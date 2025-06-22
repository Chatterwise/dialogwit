-- 1. Recreate bot_role_templates table
CREATE TABLE IF NOT EXISTS bot_role_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

-- 2. Add bot_role_template_id column to chatbots table if missing
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

-- 3. Add foreign key relationship to bot_role_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chatbots_bot_role_template_id_fkey'
  ) THEN
    ALTER TABLE chatbots
    ADD CONSTRAINT chatbots_bot_role_template_id_fkey
    FOREIGN KEY (bot_role_template_id) REFERENCES bot_role_templates(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Restore additional chatbot metadata fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chatbots' AND column_name = 'welcome_message'
  ) THEN
    ALTER TABLE chatbots
    ADD COLUMN welcome_message text DEFAULT 'Hi! How can I help you today?';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chatbots' AND column_name = 'bot_avatar'
  ) THEN
    ALTER TABLE chatbots
    ADD COLUMN bot_avatar text DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chatbots' AND column_name = 'placeholder'
  ) THEN
    ALTER TABLE chatbots
    ADD COLUMN placeholder text DEFAULT 'Type a message...';
  END IF;
END $$;
