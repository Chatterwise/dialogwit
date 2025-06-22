-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_usage_limit(UUID, TEXT);
DROP FUNCTION IF EXISTS increment_usage(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS increment_usage(UUID, TEXT);

-- Function to check if a user has reached their usage limit
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_metric_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_usage INTEGER;
  v_limit INTEGER;
  v_allowed BOOLEAN;
  v_percentage_used NUMERIC;
  v_subscription_id UUID;
  v_plan_id UUID;
BEGIN
  -- Get the user's current subscription
  SELECT id, plan_id INTO v_subscription_id, v_plan_id
  FROM user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Get the limit for this metric from the user's plan
  IF v_plan_id IS NOT NULL THEN
    SELECT ul.limit_value INTO v_limit
    FROM usage_limits ul
    WHERE ul.plan_id = v_plan_id AND ul.metric_name = p_metric_name;
  ELSE
    -- Default to free plan limits if no subscription
    CASE p_metric_name
      WHEN 'chatbots' THEN v_limit := 1;
      WHEN 'messages_per_month' THEN v_limit := 10000;
      WHEN 'tokens_per_month' THEN v_limit := 10000;
      WHEN 'knowledge_base_items' THEN v_limit := 10;
      WHEN 'emails_per_month' THEN v_limit := 3000;
      WHEN 'api_calls_per_month' THEN v_limit := 1000;
      ELSE v_limit := 0;
    END CASE;
  END IF;
  
  -- Get current month's usage
  SELECT COALESCE(SUM(metric_value), 0) INTO v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND metric_name = p_metric_name
    AND period_start >= date_trunc('month', CURRENT_DATE)
    AND period_end <= date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
  
  -- Special case for chatbots - count actual chatbots
  IF p_metric_name = 'chatbots' THEN
    SELECT COUNT(*) INTO v_current_usage
    FROM chatbots
    WHERE user_id = p_user_id;
  END IF;
  
  -- Check if usage is within limits
  IF v_limit = -1 THEN
    -- -1 means unlimited
    v_allowed := TRUE;
    v_percentage_used := 0;
  ELSE
    v_allowed := v_current_usage < v_limit;
    v_percentage_used := CASE WHEN v_limit > 0 THEN (v_current_usage::NUMERIC / v_limit) * 100 ELSE 0 END;
  END IF;
  
  -- Return result as JSON
  RETURN json_build_object(
    'allowed', v_allowed,
    'current_usage', v_current_usage,
    'limit', v_limit,
    'percentage_used', v_percentage_used,
    'metric_name', p_metric_name
  );
END;
$$;

-- Function to increment usage for a specific metric
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_metric_name TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_subscription_id UUID;
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
  v_existing_id UUID;
BEGIN
  -- Get the user's subscription ID
  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Set the period to the current month
  v_period_start := date_trunc('month', CURRENT_DATE);
  v_period_end := v_period_start + INTERVAL '1 month';
  
  -- Check if there's an existing record for this period
  SELECT id INTO v_existing_id
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND metric_name = p_metric_name
    AND period_start = v_period_start
    AND period_end = v_period_end;
  
  IF v_existing_id IS NOT NULL THEN
    -- Update existing record
    UPDATE usage_tracking
    SET metric_value = metric_value + p_increment,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_existing_id;
  ELSE
    -- Insert new record
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
    );
  END IF;
END;
$$;