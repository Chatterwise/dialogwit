DECLARE
  result jsonb := '{}';
  current_period_start timestamptz;
  current_period_end timestamptz;
  subscription_data record;
  usage_data record;
  trends_data jsonb;
  cost_data jsonb;
BEGIN
  -- Get current billing period
  current_period_start := date_trunc('month', now());
  current_period_end := current_period_start + interval '1 month';

  -- Get user subscription and plan details
  SELECT 
    us.plan_id,
    sp.name AS plan_name,
    sp.price_monthly,
    us.current_period_start,
    us.current_period_end,
    us.status AS subscription_status
  INTO subscription_data
  FROM user_subscriptions us
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id;

  -- If subscription exists, use its billing period
  IF subscription_data.current_period_start IS NOT NULL THEN
    current_period_start := subscription_data.current_period_start;
    current_period_end := subscription_data.current_period_end;
  END IF;

  -- Get current usage for all token metrics
  WITH current_usage AS (
    SELECT 
      metric_name,
      COALESCE(SUM(metric_value), 0) AS total_usage,
      COUNT(*) AS usage_events
    FROM usage_tracking 
    WHERE user_id = p_user_id 
      AND period_start >= current_period_start 
      AND period_end <= current_period_end
      AND metric_name LIKE '%_tokens%'
    GROUP BY metric_name
  ),
  usage_limits AS (
    SELECT 
      ul.metric_name,
      ul.limit_value,
      ul.overage_price
    FROM usage_limits ul
    WHERE ul.plan_id = subscription_data.plan_id
      AND ul.metric_name LIKE '%_tokens%'
  )
  SELECT 
    jsonb_object_agg(
      cu.metric_name,
      jsonb_build_object(
        'current_usage', cu.total_usage,
        'limit_value', COALESCE(ul.limit_value, 0),
        'remaining', GREATEST(0, COALESCE(ul.limit_value, 0) - cu.total_usage),
        'percentage_used', 
          CASE 
            WHEN COALESCE(ul.limit_value, 0) > 0 
            THEN ROUND((cu.total_usage::numeric / ul.limit_value::numeric) * 100, 2)
            ELSE 0 
          END,
        'overage_amount', 
          CASE 
            WHEN cu.total_usage > COALESCE(ul.limit_value, 0) 
            THEN (cu.total_usage - COALESCE(ul.limit_value, 0)) * COALESCE(ul.overage_price, 0)
            ELSE 0 
          END,
        'overage_price_per_token', COALESCE(ul.overage_price, 0),
        'usage_events', cu.usage_events
      )
    ) AS usage_breakdown
  INTO usage_data
  FROM current_usage cu
  LEFT JOIN usage_limits ul ON cu.metric_name = ul.metric_name;

  -- Get daily usage trends for the current period
  WITH daily_trends AS (
    SELECT 
      date_trunc('day', period_start) AS usage_date,
      metric_name,
      SUM(metric_value) AS daily_total
    FROM usage_tracking 
    WHERE user_id = p_user_id 
      AND period_start >= current_period_start - interval '30 days'
      AND metric_name LIKE '%_tokens%'
    GROUP BY date_trunc('day', period_start), metric_name
    ORDER BY usage_date DESC
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', usage_date,
      'metrics', jsonb_object_agg(metric_name, daily_total)
    )
  ) INTO trends_data
  FROM daily_trends;

  -- Calculate cost breakdown and projections (split aggregation to avoid nesting)
  WITH cost_breakdown AS (
    SELECT 
      metric_name,
      SUM(metric_value) AS total_tokens,
      CASE 
        WHEN metric_name = 'chat_completion_tokens_per_month' THEN SUM(metric_value) * 0.000002
        WHEN metric_name = 'embedding_tokens_per_month' THEN SUM(metric_value) * 0.0000001
        ELSE 0
      END AS estimated_cost
    FROM usage_tracking 
    WHERE user_id = p_user_id 
      AND period_start >= current_period_start 
      AND period_end <= current_period_end
      AND metric_name LIKE '%_tokens%'
    GROUP BY metric_name
  ),
  totals AS (
    SELECT 
      SUM(estimated_cost) AS current_month_cost
    FROM cost_breakdown
  ),
  projection_data AS (
    SELECT
      current_month_cost,
      CASE
        WHEN EXTRACT(day FROM now() - current_period_start) > 0 THEN
          current_month_cost * (
            EXTRACT(day FROM current_period_end - current_period_start)
            / EXTRACT(day FROM now() - current_period_start)
          )
        ELSE current_month_cost
      END AS projected_month_cost
    FROM totals
  )
  SELECT jsonb_build_object(
    'breakdown', jsonb_object_agg(cb.metric_name, 
      jsonb_build_object(
        'tokens', cb.total_tokens,
        'cost', cb.estimated_cost
      )
    ),
    'current_month_total', pd.current_month_cost,
    'projected_month_total', pd.projected_month_cost,
    'days_remaining', EXTRACT(day FROM current_period_end - now())
  ) INTO cost_data
  FROM cost_breakdown cb, projection_data pd;

  -- Final result build
  result := jsonb_build_object(
    'user_id', p_user_id,
    'billing_period', jsonb_build_object(
      'start', current_period_start,
      'end', current_period_end,
      'days_elapsed', EXTRACT(day FROM now() - current_period_start),
      'days_total', EXTRACT(day FROM current_period_end - current_period_start)
    ),
    'subscription', jsonb_build_object(
      'plan_name', COALESCE(subscription_data.plan_name, 'Free'),
      'status', COALESCE(subscription_data.subscription_status, 'trialing'),
      'monthly_price', COALESCE(subscription_data.price_monthly, 0)
    ),
    'usage', COALESCE(usage_data.usage_breakdown, '{}'),
    'trends', COALESCE(trends_data, '[]'),
    'costs', COALESCE(cost_data, '{}'),
    'last_updated', now()
  );

  RETURN result;
END;
