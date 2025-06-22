ALTER TABLE usage_tracking
ADD COLUMN usage_source TEXT CHECK (usage_source IN ('chat', 'training')) DEFAULT 'chat',
ADD COLUMN chatbot_id UUID REFERENCES chatbots(id);
