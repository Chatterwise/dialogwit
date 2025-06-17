-- Staging Deployments Table
CREATE TABLE IF NOT EXISTS staging_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chatbot_id uuid NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  config jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'ready', 'error')),
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE staging_deployments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own staging deployments"
  ON staging_deployments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staging_deployments_user_id ON staging_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_staging_deployments_chatbot_id ON staging_deployments(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_staging_deployments_status ON staging_deployments(status);

-- Update trigger
CREATE TRIGGER update_staging_deployments_updated_at 
  BEFORE UPDATE ON staging_deployments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();