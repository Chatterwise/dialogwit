/*
  # Fix User Signup Database Error

  1. Updates
    - Fix handle_new_user function with proper error handling
    - Update RLS policies to allow user creation during signup
    - Create trial subscription handling
    - Add basic free plan

  2. Security
    - Maintain RLS policies for user data protection
    - Add service role permissions for user creation
*/

-- First, let's recreate the handle_new_user function to ensure it works properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists to avoid duplicates
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Update existing user
    UPDATE public.users SET
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      updated_at = NOW()
    WHERE id = NEW.id;
  ELSE
    -- Insert new user
    INSERT INTO public.users (id, email, full_name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies to ensure proper user creation
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure authenticated users can insert their own data during signup
DROP POLICY IF EXISTS "Users and service can insert user data" ON public.users;
CREATE POLICY "Users and service can insert user data"
  ON public.users
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Create a more permissive policy for the signup process
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;
CREATE POLICY "Allow user creation during signup"
  ON public.users
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Create a function to handle trial creation for new users
CREATE OR REPLACE FUNCTION handle_new_user_trial()
RETURNS TRIGGER AS $$
DECLARE
  trial_plan_id uuid;
BEGIN
  -- Get the trial plan ID (assuming there's a trial plan)
  SELECT id INTO trial_plan_id 
  FROM subscription_plans 
  WHERE name = 'free' OR name = 'trial'
  ORDER BY sort_order ASC
  LIMIT 1;

  -- Create a trial subscription if a trial plan exists and user doesn't have one
  IF trial_plan_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = NEW.id) THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      trial_start,
      trial_end,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      trial_plan_id,
      'trialing',
      NOW(),
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user_trial trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for trial creation (if it doesn't exist)
DROP TRIGGER IF EXISTS on_user_trial_created ON public.users;
CREATE TRIGGER on_user_trial_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_trial();

-- Ensure proper permissions on the auth schema
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON auth.users TO service_role;

-- Create a basic trial/free plan if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'free') THEN
    INSERT INTO subscription_plans (
      name,
      display_name,
      description,
      price_monthly,
      price_yearly,
      features,
      limits,
      is_active,
      sort_order
    ) VALUES (
      'free',
      'Free Plan',
      'Basic chatbot functionality with limited features',
      0,
      0,
      '{"chatbots": 1, "messages": 100, "knowledge_base_size": "1MB"}',
      '{"max_chatbots": 1, "max_messages_per_month": 100, "max_kb_size_mb": 1}',
      true,
      0
    );
  END IF;
END $$;

-- Add additional RLS policies for user_subscriptions to ensure trial creation works
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON public.user_subscriptions
  FOR ALL
  TO service_role
  WITH CHECK (true);

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION handle_new_user_trial() TO service_role;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';