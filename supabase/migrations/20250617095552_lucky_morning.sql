/*
  # Fix User Signup and Free Plan Limits

  1. New Functions
    - Improved `handle_new_user` function with better error handling
    - Added `handle_new_user_trial` function for automatic trial creation

  2. Triggers
    - Fixed user creation trigger
    - Added trial creation trigger

  3. Policies
    - Updated user creation policies for proper signup flow

  4. Free Plan
    - Created basic free plan with 1 chatbot limit
*/

-- First, let's recreate the handle_new_user function to ensure it works properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists in public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Update existing user
    UPDATE public.users SET
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      updated_at = NOW()
    WHERE id = NEW.id;
  ELSE
    -- Insert new user
    INSERT INTO public.users (
      id,
      email,
      full_name,
      created_at,
      updated_at
    ) VALUES (
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
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Update RLS policies to ensure proper user creation
DO $$
BEGIN
  -- Service role can insert users
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Service role can insert users') THEN
    CREATE POLICY "Service role can insert users"
      ON public.users
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;

  -- Authenticated users can insert their own data
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users and service can insert user data') THEN
    CREATE POLICY "Users and service can insert user data"
      ON public.users
      FOR INSERT
      TO authenticated, service_role
      WITH CHECK (true);
  END IF;

  -- Allow user creation during signup
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow user creation during signup') THEN
    CREATE POLICY "Allow user creation during signup"
      ON public.users
      FOR INSERT
      TO anon, authenticated, service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Create a function to handle trial creation for new users
CREATE OR REPLACE FUNCTION handle_new_user_trial()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE name = 'free' 
  LIMIT 1;

  -- If no free plan exists, try to find any plan to use as default
  IF free_plan_id IS NULL THEN
    SELECT id INTO free_plan_id 
    FROM subscription_plans 
    LIMIT 1;
  END IF;

  -- Create a subscription if a plan exists
  IF free_plan_id IS NOT NULL THEN
    -- Check if user already has a subscription
    IF NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = NEW.id) THEN
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        free_plan_id,
        'active',
        NOW(),
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user_trial trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for trial creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_user_trial_created') THEN
    CREATE TRIGGER on_user_trial_created
      AFTER INSERT ON public.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user_trial();
  END IF;
END $$;

-- Ensure proper permissions on the auth schema
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON auth.users TO service_role;

-- Create a basic free plan if it doesn't exist
DO $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Check if free plan already exists
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free';
  
  -- If it doesn't exist, create it
  IF free_plan_id IS NULL THEN
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
      '{"chatbots": 1, "messages": 100, "knowledge_base_size": "1MB"}'::jsonb,
      '{"chatbots": 1, "messages_per_month": 10000, "knowledge_base_items": 10, "emails_per_month": 3000}'::jsonb,
      true,
      0
    );
  END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';