/*
  # Add email usage limits to subscription plans

  1. Changes
     - Add emails_per_month to subscription plan limits
     - Update existing plans with email limits
*/

-- Add emails_per_month to existing plans
UPDATE subscription_plans
SET limits = jsonb_set(
  limits,
  '{emails_per_month}',
  CASE
    WHEN name = 'free_trial' THEN '3000'::jsonb
    WHEN name = 'starter' THEN '50000'::jsonb
    WHEN name = 'pro' THEN '100000'::jsonb
    WHEN name = 'business' THEN '500000'::jsonb
    ELSE '0'::jsonb
  END
)
WHERE name IN ('free_trial', 'starter', 'pro', 'business');

-- Add usage limits for emails
INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price)
SELECT 
  id as plan_id,
  'emails_per_month' as metric_name,
  CASE
    WHEN name = 'free_trial' THEN 3000
    WHEN name = 'starter' THEN 50000
    WHEN name = 'pro' THEN 100000
    WHEN name = 'business' THEN 500000
    ELSE 0
  END as limit_value,
  0 as overage_price
FROM subscription_plans
WHERE name IN ('free_trial', 'starter', 'pro', 'business')
ON CONFLICT (plan_id, metric_name) DO UPDATE
SET limit_value = EXCLUDED.limit_value;