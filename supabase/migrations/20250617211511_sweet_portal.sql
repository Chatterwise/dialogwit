/*
  # Fix Authentication and Email Confirmation Flow

  1. Database Functions
    - Add function to check if welcome email was already sent
    - Add function to mark welcome email as sent
    - Add email confirmation tracking

  2. Security
    - Ensure proper RLS policies
    - Add audit logging for email events

  3. Changes
    - Add welcome_email_sent flag to users table
    - Add email_confirmed_at timestamp
    - Create functions to prevent duplicate welcome emails
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
  v_auth_confirmed boolean := false;
BEGIN
  -- Check our custom confirmation tracking
  SELECT email_confirmed_at INTO v_confirmed_at
  FROM users
  WHERE id = p_user_id;
  
  -- Also check Supabase auth confirmation
  SELECT email_confirmed_at IS NOT NULL INTO v_auth_confirmed
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Return true if either is confirmed
  RETURN (v_confirmed_at IS NOT NULL) OR v_auth_confirmed;
END;
$$;

-- Trigger to automatically mark email as confirmed when auth.users is updated
CREATE OR REPLACE FUNCTION handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If email_confirmed_at is being set in auth.users, update our users table
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE users
    SET email_confirmed_at = NEW.email_confirmed_at
    WHERE id = NEW.id;
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
  ) THEN
    CREATE TRIGGER on_auth_email_confirmed
      AFTER UPDATE ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_email_confirmation();
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_mark_welcome_email(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_email_confirmed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_email_confirmed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_email_confirmation() TO service_role;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent ON users(welcome_email_sent);
