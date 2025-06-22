-- Restore missing columns in bot_role_templates table
ALTER TABLE bot_role_templates
ADD COLUMN IF NOT EXISTS bot_avatar TEXT,
ADD COLUMN IF NOT EXISTS placeholder TEXT,
ADD COLUMN IF NOT EXISTS welcome_message TEXT;
