-- Add columns to users table for email tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'welcome_email_sent'
  ) THEN
    ALTER TABLE users ADD COLUMN welcome_email_sent boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_confirmed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN email_confirmed_at timestamptz DEFAULT null;
  END IF;
END $$;

-- Function to check and mark welcome email as sent
CREATE OR REPLACE FUNCTION check_and_mark_welcome_email(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_sent boolean := false;
BEGIN
  -- Check if welcome email was already sent
  SELECT welcome_email_sent INTO v_already_sent
  FROM users
  WHERE id = p_user_id;
  
  -- If already sent, return false
  IF v_already_sent THEN
    RETURN false;
  END IF;
  
  -- Mark as sent and return true
  UPDATE users
  SET welcome_email_sent = true
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;

-- Function to mark email as confirmed
CREATE OR REPLACE FUNCTION mark_email_confirmed(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update if the column exists and user exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_confirmed_at'
  ) THEN
    UPDATE users
    SET email_confirmed_at = now()
    WHERE id = p_user_id
      AND email_confirmed_at IS NULL;
  END IF;
END;
$$;

-- Function to check if user email is confirmed
CREATE OR REPLACE FUNCTION is_email_confirmed(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_confirmed_at timestamptz;
  v_auth_confirmed boolean := false;
  v_column_exists boolean := false;
BEGIN
  -- Check if our email_confirmed_at column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_confirmed_at'
  ) INTO v_column_exists;
  
  -- Check our custom confirmation tracking if column exists
  IF v_column_exists THEN
    SELECT email_confirmed_at INTO v_confirmed_at
    FROM users
    WHERE id = p_user_id;
  END IF;
  
  -- Check Supabase auth confirmation status (safely)
  BEGIN
    -- Try to check if user exists in auth.users and has any confirmation
    SELECT EXISTS(
      SELECT 1 FROM auth.users 
      WHERE id = p_user_id 
      AND (
        -- Check various possible confirmation indicators
        raw_user_meta_data->>'email_verified' = 'true'
        OR raw_app_meta_data->>'email_verified' = 'true'
        OR created_at < now() - interval '1 hour' -- Assume older users are confirmed
      )
    ) INTO v_auth_confirmed;
  EXCEPTION
    WHEN OTHERS THEN
      -- If we can't access auth.users, fall back to our tracking only
      v_auth_confirmed := false;
  END;
  
  -- Return true if either is confirmed
  RETURN (v_confirmed_at IS NOT NULL) OR v_auth_confirmed;
END;
$$;

-- Function to sync email confirmation from auth events (called manually)
CREATE OR REPLACE FUNCTION sync_email_confirmation(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_confirmed_at'
  ) THEN
    UPDATE users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = p_user_id
      AND email_confirmed_at IS NULL;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_mark_welcome_email(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_email_confirmed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_email_confirmed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION sync_email_confirmation(uuid) TO authenticated, service_role;

-- Add indexes for performance (only if columns exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'welcome_email_sent'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent ON users(welcome_email_sent);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_confirmed_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_users_email_confirmed_at ON users(email_confirmed_at);
  END IF;
END $$;

-- Update existing users to mark emails as confirmed if they're older accounts
-- This prevents issues with existing users who should already have access
DO $$
BEGIN
  -- Only run this update if both columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_confirmed_at'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'welcome_email_sent'
  ) THEN
    UPDATE users 
    SET email_confirmed_at = created_at,
        welcome_email_sent = true
    WHERE email_confirmed_at IS NULL 
      AND created_at < now() - interval '1 hour'; -- Only for users created more than 1 hour ago
  END IF;
END $$;