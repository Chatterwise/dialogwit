/*
  # ChatterWise Database Schema

  1. New Tables
    - `chatbots`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `user_id` (uuid, foreign key to auth.users)
      - `status` (enum: creating, processing, ready, error)
      - `knowledge_base_processed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `knowledge_base`
      - `id` (uuid, primary key)
      - `chatbot_id` (uuid, foreign key to chatbots)
      - `content` (text)
      - `content_type` (enum: text, document)
      - `filename` (text, nullable)
      - `processed` (boolean)
      - `created_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `chatbot_id` (uuid, foreign key to chatbots)
      - `message` (text)
      - `response` (text)
      - `user_ip` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public chatbot interactions
*/

-- Create custom types
CREATE TYPE chatbot_status AS ENUM ('creating', 'processing', 'ready', 'error');
CREATE TYPE content_type AS ENUM ('text', 'document');

-- Create chatbots table
CREATE TABLE IF NOT EXISTS chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status chatbot_status DEFAULT 'creating',
  knowledge_base_processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  content_type content_type DEFAULT 'text',
  filename text,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  user_ip text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chatbots table
CREATE POLICY "Users can view own chatbots"
  ON chatbots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chatbots"
  ON chatbots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chatbots"
  ON chatbots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chatbots"
  ON chatbots
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for knowledge_base table
CREATE POLICY "Users can view own knowledge base"
  ON knowledge_base
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = knowledge_base.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create knowledge base for own chatbots"
  ON knowledge_base
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = knowledge_base.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own knowledge base"
  ON knowledge_base
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = knowledge_base.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own knowledge base"
  ON knowledge_base
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = knowledge_base.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

-- Policies for chat_messages table
CREATE POLICY "Users can view messages for own chatbots"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = chat_messages.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create chat messages"
  ON chat_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_chatbot_id ON knowledge_base(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chatbot_id ON chat_messages(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create updated_at trigger for chatbots
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON chatbots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();