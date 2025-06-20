
DECLARE
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
  v_subscription_id UUID;
  v_result JSON;
BEGIN
  -- Prevent negative increments
  IF p_increment < 0 THEN
    RAISE EXCEPTION 'Negative token increment not allowed';
  END IF;

  -- Define current billing period
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';

  -- Get active subscription ID
  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  -- Insert or update usage
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
    metric_value = usage_tracking.metric_value + EXCLUDED.metric_value,
    updated_at = now();

  -- Log metadata if available
  IF p_metadata IS NOT NULL AND p_metadata != '{}'::jsonb THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      details,
      success
    ) VALUES (
      p_user_id,
      'token_usage_tracked',
      'usage_tracking',
      jsonb_build_object(
        'metric_name', p_metric_name,
        'token_count', p_increment,
        'metadata', p_metadata
      ),
      TRUE
    );
  END IF;

  -- Return result
  v_result := json_build_object(
    'success', TRUE,
    'increment', p_increment,
    'subscription_id', v_subscription_id,
    'period_start', v_period_start,
    'period_end', v_period_end
  );

  RETURN v_result;
END;
