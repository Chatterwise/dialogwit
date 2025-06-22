/*
  # Create Usage Tracking Functions

  1. New Functions
    - `check_usage_limit` - Check if user has exceeded usage limits
    - `increment_usage` - Increment usage tracking for a metric
    - `get_current_usage` - Get current usage for a metric

  2. Security
    - Functions use SECURITY DEFINER for proper access control
    - Grant execute permissions to authenticated and service_role

  3. Features
    - Monthly usage tracking periods
    - Default limits for users without specific plans
    - Proper error handling and fallbacks
*/

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS check_usage_limit(uuid, text);
DROP FUNCTION IF EXISTS increment_usage(uuid, text, integer);
DROP FUNCTION IF EXISTS increment_usage(uuid, text);
DROP FUNCTION IF EXISTS get_current_usage(uuid, text);

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_metric_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_limit_config record;
  v_current_usage integer := 0;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_result json;
BEGIN
  -- Get the current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  -- Get usage limit configuration for the user's plan
  SELECT ul.limit_value, ul.metric_name
  INTO v_limit_config
  FROM usage_limits ul
  JOIN user_subscriptions us ON us.plan_id = ul.plan_id
  WHERE us.user_id = p_user_id 
    AND ul.metric_name = p_metric_name
    AND us.status IN ('active', 'trialing')
  LIMIT 1;
  
  -- If no specific limit found, use default limits
  IF v_limit_config IS NULL THEN
    CASE p_metric_name
      WHEN 'emails_per_month' THEN
        v_limit_config.limit_value := 100;
      WHEN 'chatbots' THEN
        v_limit_config.limit_value := 3;
      WHEN 'messages_per_month' THEN
        v_limit_config.limit_value := 1000;
      ELSE
        v_limit_config.limit_value := 100;
    END CASE;
  END IF;
  
  -- Get current usage for the period
  SELECT COALESCE(SUM(metric_value), 0)
  INTO v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND metric_name = p_metric_name
    AND period_start >= v_period_start
    AND period_end <= v_period_end;
  
  -- Build result JSON
  v_result := json_build_object(
    'allowed', v_current_usage < v_limit_config.limit_value,
    'limit', v_limit_config.limit_value,
    'current_usage', v_current_usage,
    'percentage_used', CASE 
      WHEN v_limit_config.limit_value > 0 THEN 
        ROUND((v_current_usage::numeric / v_limit_config.limit_value::numeric) * 100, 2)
      ELSE 0 
    END,
    'period_start', v_period_start,
    'period_end', v_period_end
  );
  
  RETURN v_result;
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_metric_name text,
  p_increment integer DEFAULT 1
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_subscription_id uuid;
  v_result json;
BEGIN
  -- Get the current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  -- Get user's subscription ID
  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (
    user_id,
    subscription_id,
    metric_name,
    metric_value,
    period_start,
    period_end
  )
  VALUES (
    p_user_id,
    v_subscription_id,
    p_metric_name,
    p_increment,
    v_period_start,
    v_period_end
  )
  ON CONFLICT (user_id, metric_name, period_start, period_end)
  DO UPDATE SET
    metric_value = usage_tracking.metric_value + p_increment,
    updated_at = now();
  
  -- Return success result
  v_result := json_build_object(
    'success', true,
    'increment', p_increment,
    'period_start', v_period_start,
    'period_end', v_period_end
  );
  
  RETURN v_result;
END;
$$;

-- Function to get current usage
CREATE OR REPLACE FUNCTION get_current_usage(
  p_user_id uuid,
  p_metric_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_current_usage integer := 0;
  v_result json;
BEGIN
  -- Get the current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  -- Get current usage for the period
  SELECT COALESCE(SUM(metric_value), 0)
  INTO v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND metric_name = p_metric_name
    AND period_start >= v_period_start
    AND period_end <= v_period_end;
  
  -- Build result JSON
  v_result := json_build_object(
    'metric_name', p_metric_name,
    'current_usage', v_current_usage,
    'period_start', v_period_start,
    'period_end', v_period_end
  );
  
  RETURN v_result;
END;
$$;

-- Add unique constraint to usage_tracking to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'usage_tracking_user_metric_period_key'
  ) THEN
    ALTER TABLE usage_tracking 
    ADD CONSTRAINT usage_tracking_user_metric_period_key 
    UNIQUE (user_id, metric_name, period_start, period_end);
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_usage_limit(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_usage(uuid, text, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_current_usage(uuid, text) TO authenticated, service_role;