-- 1. Add column bot_role_template_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chatbots' AND column_name = 'bot_role_template_id'
  ) THEN
    ALTER TABLE chatbots
    ADD COLUMN bot_role_template_id uuid;
  END IF;
END $$;

-- 2. Add FK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'chatbots'
    AND constraint_name = 'chatbots_bot_role_template_id_fkey'
  ) THEN
    ALTER TABLE chatbots
    ADD CONSTRAINT chatbots_bot_role_template_id_fkey
    FOREIGN KEY (bot_role_template_id)
    REFERENCES bot_role_templates(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Add index to speed up lookups
CREATE INDEX IF NOT EXISTS idx_chatbots_bot_role_template_id ON chatbots(bot_role_template_id);
