/*
  # Billing and Subscription System

  1. New Tables
    - `subscription_plans` - Available subscription plans
    - `user_subscriptions` - User subscription records
    - `usage_tracking` - Track user usage metrics
    - `billing_events` - Audit trail for billing events
    - `payment_methods` - Stored payment methods
    - `invoices` - Invoice records
    - `usage_limits` - Plan-based usage limits

  2. Security
    - Enable RLS on all billing tables
    - Add policies for user data access
    - Secure sensitive billing information

  3. Functions
    - Usage tracking functions
    - Subscription management functions
    - Trial management functions
*/

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  price_monthly integer NOT NULL DEFAULT 0, -- in cents
  price_yearly integer NOT NULL DEFAULT 0, -- in cents
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  features jsonb DEFAULT '{}',
  limits jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing Events
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  stripe_event_id text,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id text NOT NULL,
  type text NOT NULL,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id text NOT NULL,
  amount_paid integer NOT NULL,
  amount_due integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL,
  invoice_pdf text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Usage Limits
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  limit_value integer NOT NULL,
  overage_price integer DEFAULT 0, -- price per unit over limit in cents
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, metric_name)
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Subscription Plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- User Subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Usage Tracking
CREATE POLICY "Users can view own usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage usage"
  ON usage_tracking
  FOR ALL
  TO service_role
  USING (true);

-- Billing Events
CREATE POLICY "Users can view own billing events"
  ON billing_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage billing events"
  ON billing_events
  FOR ALL
  TO service_role
  USING (true);

-- Payment Methods
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Invoices
CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Usage Limits (public read)
CREATE POLICY "Anyone can view usage limits"
  ON usage_limits
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits, sort_order) VALUES
('free_trial', '14-Day Free Trial', 'Full access to Starter features for 14 days', 0, 0, 
 '{"chatbots": true, "knowledge_base": true, "analytics": true, "api_access": true, "email_support": true}',
 '{"chatbots": 3, "messages_per_month": 1000, "knowledge_base_items": 50, "api_calls_per_month": 5000}', 0),

('starter', 'Starter', 'Perfect for individuals and small teams', 1900, 19000,
 '{"chatbots": true, "knowledge_base": true, "analytics": true, "api_access": true, "email_support": true}',
 '{"chatbots": 3, "messages_per_month": 1000, "knowledge_base_items": 50, "api_calls_per_month": 5000}', 1),

('pro', 'Pro', 'Advanced features for growing businesses', 4900, 49000,
 '{"chatbots": true, "knowledge_base": true, "analytics": true, "api_access": true, "priority_support": true, "custom_branding": true, "webhooks": true}',
 '{"chatbots": 10, "messages_per_month": 10000, "knowledge_base_items": 500, "api_calls_per_month": 50000}', 2),

('enterprise', 'Enterprise', 'Unlimited features for large organizations', 19900, 199000,
 '{"chatbots": true, "knowledge_base": true, "analytics": true, "api_access": true, "priority_support": true, "custom_branding": true, "webhooks": true, "sso": true, "dedicated_support": true}',
 '{"chatbots": -1, "messages_per_month": -1, "knowledge_base_items": -1, "api_calls_per_month": -1}', 3);

-- Insert usage limits for each plan
INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
SELECT id, 'chatbots', (limits->>'chatbots')::integer, 500 FROM subscription_plans WHERE name != 'enterprise';

INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
SELECT id, 'messages_per_month', (limits->>'messages_per_month')::integer, 5 FROM subscription_plans WHERE name != 'enterprise';

INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
SELECT id, 'knowledge_base_items', (limits->>'knowledge_base_items')::integer, 10 FROM subscription_plans WHERE name != 'enterprise';

INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) 
SELECT id, 'api_calls_per_month', (limits->>'api_calls_per_month')::integer, 1 FROM subscription_plans WHERE name != 'enterprise';

-- Functions for usage tracking
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_metric_name text,
  p_increment integer DEFAULT 1
) RETURNS void AS $$
DECLARE
  current_period_start timestamptz;
  current_period_end timestamptz;
  subscription_record record;
BEGIN
  -- Get user's current subscription
  SELECT * INTO subscription_record
  FROM user_subscriptions 
  WHERE user_id = p_user_id 
  AND status IN ('active', 'trialing');

  IF NOT FOUND THEN
    RETURN; -- No active subscription
  END IF;

  -- Calculate current billing period
  current_period_start := date_trunc('month', now());
  current_period_end := current_period_start + interval '1 month';

  -- Insert or update usage tracking
  INSERT INTO usage_tracking (
    user_id, 
    subscription_id, 
    metric_name, 
    metric_value, 
    period_start, 
    period_end
  ) VALUES (
    p_user_id,
    subscription_record.id,
    p_metric_name,
    p_increment,
    current_period_start,
    current_period_end
  )
  ON CONFLICT (user_id, subscription_id, metric_name, period_start)
  DO UPDATE SET 
    metric_value = usage_tracking.metric_value + p_increment,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_metric_name text
) RETURNS jsonb AS $$
DECLARE
  current_usage integer := 0;
  usage_limit integer := 0;
  subscription_record record;
  limit_record record;
  result jsonb;
BEGIN
  -- Get user's current subscription
  SELECT us.*, sp.name as plan_name INTO subscription_record
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
  AND us.status IN ('active', 'trialing');

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'No active subscription',
      'current_usage', 0,
      'limit', 0
    );
  END IF;

  -- Get usage limit for this plan and metric
  SELECT * INTO limit_record
  FROM usage_limits
  WHERE plan_id = subscription_record.plan_id
  AND metric_name = p_metric_name;

  IF NOT FOUND THEN
    -- No limit defined, allow unlimited
    RETURN jsonb_build_object(
      'allowed', true,
      'current_usage', 0,
      'limit', -1
    );
  END IF;

  usage_limit := limit_record.limit_value;

  -- Enterprise plans have unlimited usage (-1)
  IF usage_limit = -1 THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'current_usage', 0,
      'limit', -1
    );
  END IF;

  -- Get current usage for this period
  SELECT COALESCE(metric_value, 0) INTO current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
  AND metric_name = p_metric_name
  AND period_start = date_trunc('month', now());

  result := jsonb_build_object(
    'allowed', current_usage < usage_limit,
    'current_usage', current_usage,
    'limit', usage_limit,
    'remaining', GREATEST(0, usage_limit - current_usage),
    'percentage_used', CASE 
      WHEN usage_limit > 0 THEN ROUND((current_usage::float / usage_limit::float) * 100, 2)
      ELSE 0 
    END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start free trial
CREATE OR REPLACE FUNCTION start_free_trial(p_user_id uuid) RETURNS uuid AS $$
DECLARE
  trial_plan_id uuid;
  subscription_id uuid;
BEGIN
  -- Get the free trial plan
  SELECT id INTO trial_plan_id
  FROM subscription_plans
  WHERE name = 'free_trial'
  AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Free trial plan not found';
  END IF;

  -- Create subscription record
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end
  ) VALUES (
    p_user_id,
    trial_plan_id,
    'trialing',
    now(),
    now() + interval '14 days',
    now(),
    now() + interval '14 days'
  ) RETURNING id INTO subscription_id;

  RETURN subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically start trial for new users
CREATE OR REPLACE FUNCTION handle_new_user_trial() RETURNS trigger AS $$
BEGIN
  -- Start free trial for new user
  PERFORM start_free_trial(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created_trial'
  ) THEN
    CREATE TRIGGER on_auth_user_created_trial
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user_trial();
  END IF;
END $$;

-- Update existing users table trigger
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  -- Start free trial
  PERFORM start_free_trial(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;