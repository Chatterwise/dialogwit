-- 1. Recreate token_rollovers table
CREATE TABLE IF NOT EXISTS token_rollovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id),
  tokens_rolled_over integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_token_rollovers_user ON token_rollovers(user_id);
