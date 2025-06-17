/*
  # Email Settings and Usage Tracking

  1. New Tables
    - `user_email_settings`
      - `user_id` (uuid, primary key, references auth.users.id)
      - `enable_notifications` (boolean, default true)
      - `daily_digest` (boolean, default false)
      - `weekly_report` (boolean, default true)
      - `chatbot_alerts` (boolean, default true)
      - `marketing_emails` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `user_email_settings` table
    - Add policy for authenticated users to manage their own email settings
*/

-- Create user_email_settings table
CREATE TABLE IF NOT EXISTS user_email_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_notifications boolean DEFAULT true,
  daily_digest boolean DEFAULT false,
  weekly_report boolean DEFAULT true,
  chatbot_alerts boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_email_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own email settings"
  ON user_email_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_email_settings_updated_at
  BEFORE UPDATE ON user_email_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add email_per_month usage tracking to usage_limits table for each plan
DO $$
BEGIN
  -- Check if the free plan exists and add email limit
  IF EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'free') THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price)
    SELECT id, 'emails_per_month', 3000, 0
    FROM subscription_plans
    WHERE name = 'free'
    ON CONFLICT (plan_id, metric_name) DO NOTHING;
  END IF;

  -- Check if the starter plan exists and add email limit
  IF EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'starter') THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price)
    SELECT id, 'emails_per_month', 50000, 0
    FROM subscription_plans
    WHERE name = 'starter'
    ON CONFLICT (plan_id, metric_name) DO NOTHING;
  END IF;

  -- Check if the pro/growth plan exists and add email limit
  IF EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'pro' OR name = 'growth') THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price)
    SELECT id, 'emails_per_month', 100000, 0
    FROM subscription_plans
    WHERE name = 'pro' OR name = 'growth'
    ON CONFLICT (plan_id, metric_name) DO NOTHING;
  END IF;

  -- Check if the business plan exists and add email limit
  IF EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'business') THEN
    INSERT INTO usage_limits (plan_id, metric_name, limit_value, overage_price)
    SELECT id, 'emails_per_month', 500000, 0
    FROM subscription_plans
    WHERE name = 'business'
    ON CONFLICT (plan_id, metric_name) DO NOTHING;
  END IF;
END $$;

-- Update subscription_plans table to include email limits in the limits JSONB field
UPDATE subscription_plans
SET limits = limits || jsonb_build_object('emails_per_month', 
  CASE 
    WHEN name = 'free' THEN 3000
    WHEN name = 'starter' THEN 50000
    WHEN name = 'pro' OR name = 'growth' THEN 100000
    WHEN name = 'business' THEN 500000
    ELSE 3000
  END
);