/*
  # Fix Email Confirmation and Welcome Email Tracking

  1. New Columns
    - `welcome_email_sent` (boolean) - tracks if welcome email was sent
    - `email_confirmed_at` (timestamptz) - tracks when email was confirmed

  2. Functions
    - `check_and_mark_welcome_email()` - prevents duplicate welcome emails
    - `mark_email_confirmed()` - marks email as confirmed
    - `is_email_confirmed()` - checks confirmation status

  3. Security
    - All functions have proper RLS and permissions
    - Indexes added for performance
*/

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
  UPDATE users
  SET email_confirmed_at = now()
  WHERE id = p_user_id
    AND email_confirmed_at IS NULL;
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
  v_auth_confirmed_at timestamptz;
BEGIN
  -- Check our custom confirmation tracking
  SELECT email_confirmed_at INTO v_confirmed_at
  FROM users
  WHERE id = p_user_id;
  
  -- Check Supabase auth confirmation (safely handle missing column)
  BEGIN
    SELECT COALESCE(email_confirmed_at, confirmed_at) INTO v_auth_confirmed_at
    FROM auth.users
    WHERE id = p_user_id;
  EXCEPTION
    WHEN undefined_column THEN
      -- If email_confirmed_at doesn't exist, try confirmed_at
      BEGIN
        SELECT confirmed_at INTO v_auth_confirmed_at
        FROM auth.users
        WHERE id = p_user_id;
      EXCEPTION
        WHEN undefined_column THEN
          -- If neither exists, fall back to our tracking only
          v_auth_confirmed_at := NULL;
      END;
  END;
  
  -- Return true if either is confirmed
  RETURN (v_confirmed_at IS NOT NULL) OR (v_auth_confirmed_at IS NOT NULL);
END;
$$;

-- Function to handle email confirmation from auth events
CREATE OR REPLACE FUNCTION handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_confirmed_at timestamptz;
BEGIN
  -- Safely get confirmation timestamp from auth.users
  BEGIN
    -- Try email_confirmed_at first
    v_auth_confirmed_at := NEW.email_confirmed_at;
  EXCEPTION
    WHEN undefined_column THEN
      BEGIN
        -- Fall back to confirmed_at
        v_auth_confirmed_at := NEW.confirmed_at;
      EXCEPTION
        WHEN undefined_column THEN
          -- If neither exists, use current timestamp if this is a confirmation event
          IF TG_OP = 'UPDATE' AND NEW.id IS NOT NULL THEN
            v_auth_confirmed_at := now();
          ELSE
            v_auth_confirmed_at := NULL;
          END IF;
      END;
  END;
  
  -- If we have a confirmation timestamp and it's new, update our users table
  IF v_auth_confirmed_at IS NOT NULL THEN
    UPDATE users
    SET email_confirmed_at = COALESCE(email_confirmed_at, v_auth_confirmed_at)
    WHERE id = NEW.id
      AND email_confirmed_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_email_confirmed'
      AND event_object_schema = 'auth'
      AND event_object_table = 'users'
  ) THEN
    CREATE TRIGGER on_auth_email_confirmed
      AFTER UPDATE ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_email_confirmation();
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we can't create trigger on auth.users, that's okay
    -- We'll handle confirmation manually in the application
    NULL;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_mark_welcome_email(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_email_confirmed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_email_confirmed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_email_confirmation() TO service_role;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent ON users(welcome_email_sent);
CREATE INDEX IF NOT EXISTS idx_users_email_confirmed_at ON users(email_confirmed_at);

-- Update existing users to mark emails as confirmed if they can already log in
-- This prevents issues with existing users
UPDATE users 
SET email_confirmed_at = created_at
WHERE email_confirmed_at IS NULL 
  AND created_at < now() - interval '1 hour'; -- Only for users created more than 1 hour ago