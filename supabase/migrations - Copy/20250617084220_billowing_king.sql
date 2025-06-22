/*
  # Add email tracking functionality

  1. New Functions
     - track_email_usage: Function to track email usage
     - check_email_limit: Function to check if user has reached email limit

  2. New Procedures
     - send_email: Procedure to send an email and track usage
*/

-- Function to track email usage
CREATE OR REPLACE FUNCTION track_email_usage(
  p_user_id UUID,
  p_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_current_period_start TIMESTAMP WITH TIME ZONE;
  v_current_period_end TIMESTAMP WITH TIME ZONE;
  v_usage_record_id UUID;
  v_plan_id UUID;
  v_limit INTEGER;
  v_current_usage INTEGER;
BEGIN
  -- Get user's subscription
  SELECT id, current_period_start, current_period_end, plan_id
  INTO v_subscription_id, v_current_period_start, v_current_period_end, v_plan_id
  FROM user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription, use default period (current month)
  IF v_current_period_start IS NULL THEN
    v_current_period_start := date_trunc('month', CURRENT_DATE);
    v_current_period_end := (date_trunc('month', CURRENT_DATE) + interval '1 month')::date - interval '1 day';
  END IF;
  
  -- Get usage limit for emails
  SELECT limit_value INTO v_limit
  FROM usage_limits
  WHERE plan_id = v_plan_id AND metric_name = 'emails_per_month';
  
  -- If no limit found, use free tier default
  IF v_limit IS NULL THEN
    v_limit := 3000; -- Free tier default
  END IF;
  
  -- Get current usage
  SELECT id, metric_value INTO v_usage_record_id, v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id 
    AND metric_name = 'emails_per_month'
    AND period_start >= v_current_period_start
    AND period_end <= v_current_period_end;
  
  -- If no usage record exists, create one
  IF v_usage_record_id IS NULL THEN
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
      'emails_per_month',
      p_count,
      v_current_period_start,
      v_current_period_end
    );
  ELSE
    -- Update existing record
    UPDATE usage_tracking
    SET metric_value = metric_value + p_count
    WHERE id = v_usage_record_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to check if user has reached email limit
CREATE OR REPLACE FUNCTION check_email_limit(
  p_user_id UUID,
  p_count INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_current_period_start TIMESTAMP WITH TIME ZONE;
  v_current_period_end TIMESTAMP WITH TIME ZONE;
  v_plan_id UUID;
  v_limit INTEGER;
  v_current_usage INTEGER;
  v_allowed BOOLEAN;
  v_percentage_used NUMERIC;
  v_result JSONB;
BEGIN
  -- Get user's subscription
  SELECT id, current_period_start, current_period_end, plan_id
  INTO v_subscription_id, v_current_period_start, v_current_period_end, v_plan_id
  FROM user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription, use default period (current month)
  IF v_current_period_start IS NULL THEN
    v_current_period_start := date_trunc('month', CURRENT_DATE);
    v_current_period_end := (date_trunc('month', CURRENT_DATE) + interval '1 month')::date - interval '1 day';
  END IF;
  
  -- Get usage limit for emails
  SELECT limit_value INTO v_limit
  FROM usage_limits
  WHERE plan_id = v_plan_id AND metric_name = 'emails_per_month';
  
  -- If no limit found, use free tier default
  IF v_limit IS NULL THEN
    v_limit := 3000; -- Free tier default
  END IF;
  
  -- Get current usage
  SELECT COALESCE(SUM(metric_value), 0) INTO v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id 
    AND metric_name = 'emails_per_month'
    AND period_start >= v_current_period_start
    AND period_end <= v_current_period_end;
  
  -- Check if allowed
  IF v_limit = -1 THEN
    -- Unlimited
    v_allowed := TRUE;
    v_percentage_used := 0;
  ELSE
    v_allowed := (v_current_usage + p_count) <= v_limit;
    v_percentage_used := CASE WHEN v_limit > 0 THEN 
                            ROUND((v_current_usage::NUMERIC / v_limit::NUMERIC) * 100, 2)
                          ELSE 0 END;
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'allowed', v_allowed,
    'current_usage', v_current_usage,
    'limit', v_limit,
    'percentage_used', v_percentage_used,
    'remaining', GREATEST(0, v_limit - v_current_usage),
    'requested', p_count
  );
  
  RETURN v_result;
END;
$$;

-- Procedure to send an email and track usage
CREATE OR REPLACE PROCEDURE send_email(
  p_user_id UUID,
  p_to TEXT[],
  p_subject TEXT,
  p_body TEXT,
  p_track_usage BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recipient TEXT;
  v_email_count INTEGER;
  v_limit_check JSONB;
BEGIN
  -- Count recipients
  v_email_count := array_length(p_to, 1);
  
  -- Check limit if tracking is enabled
  IF p_track_usage THEN
    v_limit_check := check_email_limit(p_user_id, v_email_count);
    
    IF NOT (v_limit_check->>'allowed')::BOOLEAN THEN
      RAISE EXCEPTION 'Email limit reached. Limit: %, Current usage: %', 
        v_limit_check->>'limit', 
        v_limit_check->>'current_usage';
    END IF;
  END IF;
  
  -- In a real implementation, this would call an email service
  -- For now, we'll just log the email
  RAISE NOTICE 'Sending email to % recipients: %', v_email_count, p_to;
  RAISE NOTICE 'Subject: %', p_subject;
  RAISE NOTICE 'Body: %', p_body;
  
  -- Track usage if enabled
  IF p_track_usage THEN
    PERFORM track_email_usage(p_user_id, v_email_count);
  END IF;
  
  -- Log the email in audit_logs
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    details,
    success
  ) VALUES (
    p_user_id,
    'send_email',
    'email',
    jsonb_build_object(
      'recipients', p_to,
      'subject', p_subject,
      'count', v_email_count
    ),
    TRUE
  );
END;
$$;