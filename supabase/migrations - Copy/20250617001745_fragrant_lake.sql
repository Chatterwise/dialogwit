/*
  # Rate Limit Configuration System

  1. New Tables
    - `rate_limit_configs` - Store rate limiting configurations per user/global
  2. Security
    - Enable RLS on rate_limit_configs table
    - Add policies for user access
*/

-- Rate Limit Configuration Table
CREATE TABLE IF NOT EXISTS rate_limit_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  config_type text NOT NULL DEFAULT 'user', -- 'user' or 'global'
  endpoint text NOT NULL DEFAULT 'default',
  requests_per_minute integer NOT NULL DEFAULT 100,
  requests_per_hour integer NOT NULL DEFAULT 1000,
  requests_per_day integer NOT NULL DEFAULT 10000,
  burst_limit integer NOT NULL DEFAULT 20,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE rate_limit_configs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own rate limit configs"
  ON rate_limit_configs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all rate limit configs"
  ON rate_limit_configs
  FOR ALL
  TO service_role
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_configs_user_id ON rate_limit_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_configs_endpoint ON rate_limit_configs(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_configs_enabled ON rate_limit_configs(enabled);

-- Update trigger
CREATE TRIGGER update_rate_limit_configs_updated_at 
  BEFORE UPDATE ON rate_limit_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration for existing users
INSERT INTO rate_limit_configs (user_id, config_type, endpoint, requests_per_minute, requests_per_hour, requests_per_day, burst_limit, enabled)
SELECT 
  id as user_id,
  'user' as config_type,
  'default' as endpoint,
  100 as requests_per_minute,
  1000 as requests_per_hour,
  10000 as requests_per_day,
  20 as burst_limit,
  true as enabled
FROM auth.users
ON CONFLICT (user_id, endpoint) DO NOTHING;

-- Function to get rate limit config for a user
CREATE OR REPLACE FUNCTION get_rate_limit_config(p_user_id uuid, p_endpoint text DEFAULT 'default')
RETURNS TABLE (
  requests_per_minute integer,
  requests_per_hour integer,
  requests_per_day integer,
  burst_limit integer,
  enabled boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rlc.requests_per_minute,
    rlc.requests_per_hour,
    rlc.requests_per_day,
    rlc.burst_limit,
    rlc.enabled
  FROM rate_limit_configs rlc
  WHERE rlc.user_id = p_user_id AND rlc.endpoint = p_endpoint
  LIMIT 1;
  
  -- If no config found, return defaults
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      100 as requests_per_minute,
      1000 as requests_per_hour,
      10000 as requests_per_day,
      20 as burst_limit,
      true as enabled;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment rate limit counter with better upsert logic
CREATE OR REPLACE FUNCTION increment_rate_limit_counter(
  p_identifier text,
  p_endpoint text,
  p_window_start timestamptz
) RETURNS void AS $$
BEGIN
  INSERT INTO rate_limits (identifier, endpoint, requests_count, window_start, limit_value)
  VALUES (p_identifier, p_endpoint, 1, p_window_start, 100)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET 
    requests_count = rate_limits.requests_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;