ALTER TABLE knowledge_base
ADD COLUMN status TEXT DEFAULT 'pending',
ADD COLUMN error_message TEXT;
