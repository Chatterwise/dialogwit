-- First, let's fix the handle_new_user function to properly handle user creation
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix the trial creation function to properly assign users to the free plan
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

  -- If no free plan exists, create one
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
      '{"chatbots": 1, "messages": 100, "knowledge_base_size": "1MB"}',
      '{"chatbots": 1, "messages_per_month": 10000, "knowledge_base_items": 10, "emails_per_month": 3000}',
      true,
      0
    )
    RETURNING id INTO free_plan_id;
  END IF;

  -- Check if user already has a subscription
  IF NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = NEW.id) THEN
    -- Create a subscription with the free plan
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
      free_plan_id,
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

-- Make sure the free plan exists and has correct limits
DO $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Check if free plan already exists
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free';
  
  IF free_plan_id IS NULL THEN
    -- Create the free plan
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
      '{"chatbots": 1, "messages_per_month": 10000, "knowledge_base_items": 10, "emails_per_month": 3000}',
      true,
      0
    );
  ELSE
    -- Update existing free plan
    UPDATE subscription_plans SET
      limits = '{"chatbots": 1, "messages_per_month": 10000, "knowledge_base_items": 10, "emails_per_month": 3000}',
      is_active = true
    WHERE id = free_plan_id;
  END IF;
END $$;

-- Fix any existing users who don't have a subscription
DO $$
DECLARE
  free_plan_id uuid;
  user_record RECORD;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  
  -- Exit if no free plan exists
  IF free_plan_id IS NULL THEN
    RAISE LOG 'No free plan found, cannot fix user subscriptions';
    RETURN;
  END IF;
  
  -- Find users without subscriptions
  FOR user_record IN 
    SELECT u.id 
    FROM public.users u
    LEFT JOIN user_subscriptions s ON u.id = s.user_id
    WHERE s.id IS NULL
  LOOP
    -- Create subscription for user
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      created_at,
      updated_at
    ) VALUES (
      user_record.id,
      free_plan_id,
      'active',
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Created subscription for user %', user_record.id;
  END LOOP;
END $$;

-- Create usage limits for the free plan if they don't exist
DO $$
DECLARE
  free_plan_id uuid;
  existing_limit_id uuid;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  
  -- Exit if no free plan exists
  IF free_plan_id IS NULL THEN
    RAISE LOG 'No free plan found, cannot create usage limits';
    RETURN;
  END IF;
  
  -- Create or update chatbots limit
  SELECT id INTO existing_limit_id FROM usage_limits WHERE plan_id = free_plan_id AND metric_name = 'chatbots';
  IF existing_limit_id IS NULL THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
    VALUES (free_plan_id, 'chatbots', 1, 0);
  ELSE
    UPDATE usage_limits SET limit_value = 1 WHERE id = existing_limit_id;
  END IF;
  
  -- Create or update messages_per_month limit
  SELECT id INTO existing_limit_id FROM usage_limits WHERE plan_id = free_plan_id AND metric_name = 'messages_per_month';
  IF existing_limit_id IS NULL THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
    VALUES (free_plan_id, 'messages_per_month', 10000, 0);
  ELSE
    UPDATE usage_limits SET limit_value = 10000 WHERE id = existing_limit_id;
  END IF;
  
  -- Create or update knowledge_base_items limit
  SELECT id INTO existing_limit_id FROM usage_limits WHERE plan_id = free_plan_id AND metric_name = 'knowledge_base_items';
  IF existing_limit_id IS NULL THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
    VALUES (free_plan_id, 'knowledge_base_items', 10, 0);
  ELSE
    UPDATE usage_limits SET limit_value = 10 WHERE id = existing_limit_id;
  END IF;
  
  -- Create or update emails_per_month limit
  SELECT id INTO existing_limit_id FROM usage_limits WHERE plan_id = free_plan_id AND metric_name = 'emails_per_month';
  IF existing_limit_id IS NULL THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
    VALUES (free_plan_id, 'emails_per_month', 3000, 0);
  ELSE
    UPDATE usage_limits SET limit_value = 3000 WHERE id = existing_limit_id;
  END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';