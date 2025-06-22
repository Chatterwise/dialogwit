-- Update Free plan
UPDATE subscription_plans
SET limits = jsonb_set(limits, '{tokens_per_month}', '20000'::jsonb),
    updated_at = now()
WHERE name = 'free';

-- Update Starter plan
UPDATE subscription_plans
SET limits = jsonb_set(limits, '{tokens_per_month}', '200000'::jsonb),
    updated_at = now()
WHERE name = 'starter';

-- Update Growth plan
UPDATE subscription_plans
SET limits = jsonb_set(limits, '{tokens_per_month}', '1000000'::jsonb),
    updated_at = now()
WHERE name = 'growth';

-- Update Business plan
UPDATE subscription_plans
SET limits = jsonb_set(limits, '{tokens_per_month}', '5000000'::jsonb),
    updated_at = now()
WHERE name = 'business';
