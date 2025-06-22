/*
  # Add chat feedback table

  1. New Tables
    - `chat_feedback`
      - `id` (uuid, primary key)
      - `chatbot_id` (uuid, foreign key to chatbots)
      - `message_id` (uuid)
      - `user_query` (text)
      - `bot_response` (text)
      - `is_positive` (boolean)
      - `comment` (text, optional)
      - `sources` (jsonb, optional)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `chat_feedback` table
    - Add policy for authenticated users to view their own feedback
*/

-- Create chat_feedback table
CREATE TABLE IF NOT EXISTS chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  message_id text NOT NULL,
  user_query text NOT NULL,
  bot_response text NOT NULL,
  is_positive boolean NOT NULL,
  comment text,
  sources jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_feedback_chatbot_id ON chat_feedback(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_is_positive ON chat_feedback(is_positive);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_created_at ON chat_feedback(created_at);

-- Enable RLS
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view feedback for their chatbots" 
  ON chat_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots
      WHERE chatbots.id = chat_feedback.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create feedback" 
  ON chat_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);