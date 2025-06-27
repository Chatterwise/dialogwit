ALTER TABLE usage_tracking
DROP CONSTRAINT usage_tracking_chatbot_id_fkey,
ADD CONSTRAINT usage_tracking_chatbot_id_fkey
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE;
