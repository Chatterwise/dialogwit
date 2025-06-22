/*
  # Fix usage check function type casting

  1. Database Functions
    - Drop and recreate `check_usage_limit` function with proper type casting
    - Drop and recreate `increment_usage` function with proper type casting
    - Ensure all numeric operations use proper casting

  2. Changes
    - Cast double precision values to numeric before using round()
    - Fix any other potential type casting issues in usage calculations
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_usage_limit(uuid, text);
DROP FUNCTION IF EXISTS increment_usage(uuid, text, integer);

-- Create check_usage_limit function with proper type casting
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_metric_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription user_subscriptions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
  v_usage_limit usage_limits%ROWTYPE;
  v_current_usage integer := 0;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_limit_value integer;
  v_allowed boolean := true;
  v_usage_percentage numeric := 0;
BEGIN
  -- Get current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  -- Get user subscription
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  -- If no subscription, check if user is on trial or free tier
  IF v_subscription IS NULL THEN
    -- Create default trial subscription if it doesn't exist
    INSERT INTO user_subscriptions (
      user_id,
      status,
      trial_start,
      trial_end
    ) VALUES (
      p_user_id,
      'trialing',
      now(),
      now() + interval '14 days'
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Get the subscription again
    SELECT * INTO v_subscription
    FROM user_subscriptions
    WHERE user_id = p_user_id;
  END IF;

  -- Get plan details
  IF v_subscription.plan_id IS NOT NULL THEN
    SELECT * INTO v_plan
    FROM subscription_plans
    WHERE id = v_subscription.plan_id;
  ELSE
    -- Default to free/trial limits
    v_plan.limits := jsonb_build_object(
      'chatbots', 1,
      'messages', 100,
      'knowledge_base_size', 1000000
    );
  END IF;

  -- Get specific usage limit for this metric
  SELECT * INTO v_usage_limit
  FROM usage_limits
  WHERE plan_id = v_subscription.plan_id
    AND metric_name = p_metric_name;

  -- Determine limit value
  IF v_usage_limit IS NOT NULL THEN
    v_limit_value := v_usage_limit.limit_value;
  ELSE
    -- Fallback to plan limits or default values
    CASE p_metric_name
      WHEN 'chatbots' THEN
        v_limit_value := COALESCE((v_plan.limits->>'chatbots')::integer, 1);
      WHEN 'messages' THEN
        v_limit_value := COALESCE((v_plan.limits->>'messages')::integer, 100);
      WHEN 'knowledge_base_size' THEN
        v_limit_value := COALESCE((v_plan.limits->>'knowledge_base_size')::integer, 1000000);
      ELSE
        v_limit_value := 1;
    END CASE;
  END IF;

  -- Get current usage based on metric type
  CASE p_metric_name
    WHEN 'chatbots' THEN
      SELECT COUNT(*)::integer INTO v_current_usage
      FROM chatbots
      WHERE user_id = p_user_id;
    
    WHEN 'messages' THEN
      SELECT COALESCE(SUM(metric_value), 0)::integer INTO v_current_usage
      FROM usage_tracking
      WHERE user_id = p_user_id
        AND metric_name = 'messages'
        AND period_start >= v_period_start
        AND period_end <= v_period_end;
    
    WHEN 'knowledge_base_size' THEN
      SELECT COALESCE(SUM(LENGTH(content)), 0)::integer INTO v_current_usage
      FROM knowledge_base kb
      JOIN chatbots c ON kb.chatbot_id = c.id
      WHERE c.user_id = p_user_id;
    
    ELSE
      SELECT COALESCE(SUM(metric_value), 0)::integer INTO v_current_usage
      FROM usage_tracking
      WHERE user_id = p_user_id
        AND metric_name = p_metric_name
        AND period_start >= v_period_start
        AND period_end <= v_period_end;
  END CASE;

  -- Check if usage exceeds limit
  v_allowed := v_current_usage < v_limit_value;

  -- Calculate usage percentage with proper type casting
  IF v_limit_value > 0 THEN
    v_usage_percentage := round((v_current_usage::numeric / v_limit_value::numeric * 100), 2);
  ELSE
    v_usage_percentage := 0;
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_usage', v_current_usage,
    'limit_value', v_limit_value,
    'usage_percentage', v_usage_percentage,
    'metric_name', p_metric_name,
    'period_start', v_period_start,
    'period_end', v_period_end,
    'subscription_status', COALESCE(v_subscription.status, 'trialing')
  );
END;
$$;

-- Create increment_usage function with proper type casting
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_metric_name text,
  p_increment integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_subscription_id uuid;
BEGIN
  -- Get current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  -- Get subscription ID
  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE user_id = p_user_id;

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
    v_subscription_id,
    p_metric_name,
    p_increment,
    v_period_start,
    v_period_end
  )
  ON CONFLICT (user_id, metric_name, period_start)
  DO UPDATE SET
    metric_value = usage_tracking.metric_value + p_increment,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'metric_name', p_metric_name,
    'increment', p_increment
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_usage_limit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION increment_usage(uuid, text, integer) TO service_role;