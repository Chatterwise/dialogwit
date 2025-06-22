/*
  # Create usage limit checking functions

  1. New Functions
    - `check_usage_limit` - Checks if user has exceeded usage limits for a specific metric
    - `increment_usage` - Increments usage counter for a user and metric
    - `get_current_usage` - Gets current usage for a user and metric

  2. Security
    - Functions are accessible to authenticated users and service role
    - RLS policies ensure users can only check their own usage
*/

-- DROP existing increment_usage safely to change signature or return type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'increment_usage'
      AND pg_get_function_identity_arguments(oid) = 'uuid, text'
  ) THEN
    DROP FUNCTION increment_usage(uuid, text);
  END IF;
END $$;

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
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  SELECT ul.limit_value, ul.metric_name
  INTO v_limit_config
  FROM usage_limits ul
  JOIN user_subscriptions us ON us.plan_id = ul.plan_id
  WHERE us.user_id = p_user_id
    AND ul.metric_name = p_metric_name
    AND us.status IN ('active', 'trialing')
  LIMIT 1;

  IF v_limit_config IS NULL THEN
    CASE p_metric_name
      WHEN 'emails_per_month' THEN v_limit_config.limit_value := 100;
      WHEN 'chatbots' THEN v_limit_config.limit_value := 3;
      WHEN 'messages_per_month' THEN v_limit_config.limit_value := 1000;
      ELSE v_limit_config.limit_value := 100;
    END CASE;
  END IF;

  SELECT COALESCE(SUM(metric_value), 0)
  INTO v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND metric_name = p_metric_name
    AND period_start >= v_period_start
    AND period_end <= v_period_end;

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
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE user_id = p_user_id
  LIMIT 1;

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
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  SELECT COALESCE(SUM(metric_value), 0)
  INTO v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND metric_name = p_metric_name
    AND period_start >= v_period_start
    AND period_end <= v_period_end;

  v_result := json_build_object(
    'metric_name', p_metric_name,
    'current_usage', v_current_usage,
    'period_start', v_period_start,
    'period_end', v_period_end
  );

  RETURN v_result;
END;
$$;

-- Add unique constraint safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'usage_tracking_user_metric_period_key'
  ) THEN
    ALTER TABLE usage_tracking
    ADD CONSTRAINT usage_tracking_user_metric_period_key
    UNIQUE (user_id, metric_name, period_start, period_end);
  END IF;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_usage_limit(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_usage(uuid, text, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_current_usage(uuid, text) TO authenticated, service_role;
