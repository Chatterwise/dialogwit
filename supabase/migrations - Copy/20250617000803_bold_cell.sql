/*
  # Phase 2.5 Database Schema - Production-Ready Features

  1. New Tables
    - `audit_logs` - Comprehensive audit trail for all operations
    - `rate_limits` - API rate limiting tracking and configuration
    - `test_scenarios` - Automated testing scenarios and results
    - `webhooks` - Webhook management and delivery tracking
    - `api_keys` - API key management and authentication
    - `security_events` - Security monitoring and threat detection

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data isolation
    - Implement proper indexing for performance

  3. Performance
    - Add indexes for frequently queried columns
    - Implement proper foreign key relationships
    - Add constraints for data integrity
*/

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Rate Limits Table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  endpoint text NOT NULL,
  requests_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  window_duration interval DEFAULT '1 hour',
  limit_value integer NOT NULL,
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test Scenarios Table
CREATE TABLE IF NOT EXISTS test_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chatbot_id uuid NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  test_messages jsonb NOT NULL DEFAULT '[]',
  expected_responses jsonb DEFAULT '[]',
  last_run_at timestamptz,
  last_run_results jsonb DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chatbot_id uuid REFERENCES chatbots(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  secret text,
  active boolean DEFAULT true,
  last_triggered_at timestamptz,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  permissions jsonb DEFAULT '{}',
  last_used_at timestamptz,
  usage_count integer DEFAULT 0,
  rate_limit_override jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_ip inet,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}',
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies
CREATE POLICY "Users can view own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Rate Limits Policies (Admin only for now)
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits
  FOR ALL
  TO service_role
  USING (true);

-- Test Scenarios Policies
CREATE POLICY "Users can manage own test scenarios"
  ON test_scenarios
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Webhooks Policies
CREATE POLICY "Users can manage own webhooks"
  ON webhooks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- API Keys Policies
CREATE POLICY "Users can manage own API keys"
  ON api_keys
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Security Events Policies
CREATE POLICY "Users can view security events related to them"
  ON security_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

CREATE INDEX IF NOT EXISTS idx_test_scenarios_user_id ON test_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_test_scenarios_chatbot_id ON test_scenarios(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_test_scenarios_status ON test_scenarios(status);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_chatbot_id ON webhooks(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(active);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

-- Update Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_scenarios_updated_at BEFORE UPDATE ON test_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();