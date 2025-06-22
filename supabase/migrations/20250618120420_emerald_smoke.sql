/*
  # Add Token Usage Metrics

  1. New Usage Metrics
    - Add token-based usage limits for different subscription plans
    - Configure pricing for token overages
    - Set up tracking for chat and embedding tokens

  2. Security
    - Maintains existing RLS policies
    - Uses service role for system operations
*/

-- Add token usage limits for existing plans
INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price)
SELECT 
  sp.id,
  'chat_tokens_per_month',
  CASE 
    WHEN sp.name = 'free' THEN 10000
    WHEN sp.name = 'starter' THEN 100000
    WHEN sp.name = 'professional' THEN 500000
    WHEN sp.name = 'enterprise' THEN 2000000
    ELSE 10000
  END,
  CASE 
    WHEN sp.name = 'free' THEN 0
    WHEN sp.name = 'starter' THEN 20  -- $0.0020 per 1000 tokens
    WHEN sp.name = 'professional' THEN 15  -- $0.0015 per 1000 tokens  
    WHEN sp.name = 'enterprise' THEN 10  -- $0.0010 per 1000 tokens
    ELSE 20
  END
FROM subscription_plans sp
WHERE sp.is_active = true
ON CONFLICT (plan_id, metric_name) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  overage_price = EXCLUDED.overage_price;

-- Add embedding token usage limits
INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price)
SELECT 
  sp.id,
  'embedding_tokens_per_month',
  CASE 
    WHEN sp.name = 'free' THEN 5000
    WHEN sp.name = 'starter' THEN 50000
    WHEN sp.name = 'professional' THEN 200000
    WHEN sp.name = 'enterprise' THEN 1000000
    ELSE 5000
  END,
  CASE 
    WHEN sp.name = 'free' THEN 0
    WHEN sp.name = 'starter' THEN 1  -- $0.0001 per 1000 tokens
    WHEN sp.name = 'professional' THEN 1
    WHEN sp.name = 'enterprise' THEN 1
    ELSE 1
  END
FROM subscription_plans sp
WHERE sp.is_active = true
ON CONFLICT (plan_id, metric_name) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  overage_price = EXCLUDED.overage_price;

-- Create function to track token usage
CREATE OR REPLACE FUNCTION track_token_usage(
  p_user_id uuid,
  p_metric_name text,
  p_token_count integer,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use the existing increment_usage function
  PERFORM increment_usage(p_user_id, p_metric_name, p_token_count);
  
  -- Log additional metadata if provided
  IF p_metadata != '{}'::jsonb THEN
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
        'token_count', p_token_count,
        'metadata', p_metadata
      ),
      true
    );
  END IF;
END;
$$;

-- Create function to check token usage limits before operations
CREATE OR REPLACE FUNCTION check_token_limit(
  p_user_id uuid,
  p_metric_name text,
  p_estimated_tokens integer DEFAULT 1000
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usage_result jsonb;
  current_usage integer;
  usage_limit integer;
  percentage_used numeric;
BEGIN
  -- Check current usage
  SELECT check_usage_limit(p_user_id, p_metric_name) INTO usage_result;
  
  current_usage := (usage_result->>'current_usage')::integer;
  usage_limit := (usage_result->>'limit')::integer;
  percentage_used := (usage_result->>'percentage_used')::numeric;
  
  -- Check if adding estimated tokens would exceed limit
  IF current_usage + p_estimated_tokens > usage_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_usage', current_usage,
      'limit', usage_limit,
      'estimated_tokens', p_estimated_tokens,
      'would_exceed', true,
      'percentage_used', percentage_used
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_usage', current_usage,
    'limit', usage_limit,
    'estimated_tokens', p_estimated_tokens,
    'percentage_used', percentage_used
  );
END;
$$;