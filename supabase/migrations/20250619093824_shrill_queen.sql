/*
  # Update Subscription Plans and Usage Limits

  1. New Tables
    - Updates `subscription_plans` with new Stripe product data
    - Updates `usage_limits` with corresponding usage restrictions

  2. Changes
    - Replaces existing subscription plans with new pricing structure
    - Sets up proper token limits and document limits for each plan
    - Configures Stripe price IDs for billing integration

  3. Security
    - Maintains existing RLS policies
    - Preserves user subscription relationships
*/

-- First, clear existing data to start fresh
DELETE FROM usage_limits;
DELETE FROM subscription_plans;

-- Insert new subscription plans
INSERT INTO subscription_plans (
  name, 
  display_name, 
  description, 
  price_monthly, 
  price_yearly, 
  stripe_price_id_monthly, 
  stripe_price_id_yearly, 
  features, 
  limits, 
  is_active, 
  sort_order
) VALUES
-- Chatterwise Free
(
  'free', 
  'Chatterwise Free', 
  'Get started with building AI-powered chatbots at no cost. Ideal for experimenting and testing. Includes GPT-3.5, limited token allowance, and document upload cap.', 
  0, 
  0, 
  'price_1RbdmZPTUKauYAQ6PffMIExC', 
  NULL,
  '{"gpt_model": "gpt-3.5", "support": "community", "analytics": "basic"}',
  '{"tokens_per_month": 10000, "max_documents": 10, "max_chatbots": 1}',
  true, 
  0
),
-- Chatterwise Starter
(
  'starter', 
  'Chatterwise Starter', 
  'Perfect for indie developers or small teams. Includes more monthly tokens, access to GPT-3.5, and increased document uploads for training knowledge bases.', 
  1900, 
  0, 
  'price_1RbdoNPTUKauYAQ616vAg6AT', 
  NULL,
  '{"gpt_model": "gpt-3.5", "support": "email", "analytics": "standard", "api_access": true}',
  '{"tokens_per_month": 100000, "max_documents": 50, "max_chatbots": 5}',
  true, 
  1
),
-- Chatterwise Growth
(
  'growth', 
  'Chatterwise Growth', 
  'For scaling teams and products. Includes access to GPT-4, high token limits, and robust document processing capacity for more advanced bots.', 
  7900, 
  0, 
  'price_1RbdpgPTUKauYAQ6eS9EySHg', 
  NULL,
  '{"gpt_model": "gpt-4", "support": "priority", "analytics": "advanced", "api_access": true, "webhooks": true}',
  '{"tokens_per_month": 500000, "max_documents": 250, "max_chatbots": 25}',
  true, 
  2
),
-- Chatterwise Business
(
  'business', 
  'Chatterwise Business', 
  'Enterprise-grade chatbot infrastructure. Includes multi-million token limits, GPT-4 access, extended support, and custom KB scaling. Ideal for SaaS tools, agencies, or internal automation.', 
  24900, 
  0, 
  'price_1RbdrmPTUKauYAQ6F7hdYqmU', 
  NULL,
  '{"gpt_model": "gpt-4", "support": "dedicated", "analytics": "enterprise", "api_access": true, "webhooks": true, "white_label": true, "sso": true}',
  '{"tokens_per_month": 2000000, "max_documents": 1000, "max_chatbots": 100}',
  true, 
  3
),
-- GPT-4 Upgrade (Add-on)
(
  'gpt4_upgrade', 
  'GPT-4 Upgrade', 
  'Upgrade to GPT-4 model access for enhanced AI capabilities.', 
  1000, 
  0, 
  'price_1RbdtlPTUKauYAQ6hj8uESNA', 
  NULL,
  '{"model_upgrade": "gpt-4", "type": "addon"}',
  '{}',
  true, 
  10
),
-- Extra Tokens (Add-on)
(
  'extra_tokens_100k', 
  'Extra Tokens (100k)', 
  'Extra 100,000 tokens add-on for increased usage capacity.', 
  500, 
  0, 
  'price_1Rbdt0PTUKauYAQ6weQjNWUa', 
  NULL,
  '{"extra_tokens": 100000, "type": "addon"}',
  '{}',
  true, 
  11
);

-- Insert usage limits for each plan
INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price) VALUES
-- Free Plan Limits
((SELECT id FROM subscription_plans WHERE name = 'free'), 'tokens_per_month', 10000, 0),
((SELECT id FROM subscription_plans WHERE name = 'free'), 'max_documents', 10, 0),
((SELECT id FROM subscription_plans WHERE name = 'free'), 'max_chatbots', 1, 0),
((SELECT id FROM subscription_plans WHERE name = 'free'), 'api_requests_per_month', 1000, 0),
((SELECT id FROM subscription_plans WHERE name = 'free'), 'emails_per_month', 10, 0),

-- Starter Plan Limits
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'tokens_per_month', 100000, 0),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'max_documents', 50, 0),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'max_chatbots', 5, 0),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'api_requests_per_month', 10000, 0),
((SELECT id FROM subscription_plans WHERE name = 'starter'), 'emails_per_month', 100, 0),

-- Growth Plan Limits
((SELECT id FROM subscription_plans WHERE name = 'growth'), 'tokens_per_month', 500000, 0),
((SELECT id FROM subscription_plans WHERE name = 'growth'), 'max_documents', 250, 0),
((SELECT id FROM subscription_plans WHERE name = 'growth'), 'max_chatbots', 25, 0),
((SELECT id FROM subscription_plans WHERE name = 'growth'), 'api_requests_per_month', 100000, 0),
((SELECT id FROM subscription_plans WHERE name = 'growth'), 'emails_per_month', 1000, 0),

-- Business Plan Limits
((SELECT id FROM subscription_plans WHERE name = 'business'), 'tokens_per_month', 2000000, 0),
((SELECT id FROM subscription_plans WHERE name = 'business'), 'max_documents', 1000, 0),
((SELECT id FROM subscription_plans WHERE name = 'business'), 'max_chatbots', 100, 0),
((SELECT id FROM subscription_plans WHERE name = 'business'), 'api_requests_per_month', 1000000, 0),
((SELECT id FROM subscription_plans WHERE name = 'business'), 'emails_per_month', 10000, 0);

-- Update existing user subscriptions to use the free plan if they don't have a valid plan
UPDATE user_subscriptions 
SET plan_id = (SELECT id FROM subscription_plans WHERE name = 'free')
WHERE plan_id IS NULL OR plan_id NOT IN (SELECT id FROM subscription_plans);

-- Create default trial subscriptions for users who don't have any subscription
INSERT INTO user_subscriptions (user_id, plan_id, status, trial_start, trial_end)
SELECT 
  u.id,
  (SELECT id FROM subscription_plans WHERE name = 'free'),
  'trialing',
  NOW(),
  NOW() + INTERVAL '14 days'
FROM users u
WHERE u.id NOT IN (SELECT user_id FROM user_subscriptions WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;