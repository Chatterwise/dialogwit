/*
  # Add Vector Embeddings Support

  1. New Tables
    - `kb_chunks`
      - `id` (uuid, primary key)
      - `chatbot_id` (uuid, foreign key to chatbots)
      - `knowledge_base_id` (uuid, foreign key to knowledge_base)
      - `content` (text) - the chunked content
      - `embedding` (vector) - the embedding vector
      - `chunk_index` (integer) - order of chunk in original content
      - `created_at` (timestamp)

  2. Extensions
    - Enable pgvector extension for vector operations

  3. Security
    - Enable RLS on kb_chunks table
    - Add policies for authenticated users to manage their own data
*/

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create kb_chunks table for storing chunked content with embeddings
CREATE TABLE IF NOT EXISTS kb_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES chatbots(id) ON DELETE CASCADE NOT NULL,
  knowledge_base_id uuid REFERENCES knowledge_base(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  chunk_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE kb_chunks ENABLE ROW LEVEL SECURITY;

-- Policies for kb_chunks table
CREATE POLICY "Users can view own kb chunks"
  ON kb_chunks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = kb_chunks.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create kb chunks for own chatbots"
  ON kb_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = kb_chunks.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own kb chunks"
  ON kb_chunks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = kb_chunks.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own kb chunks"
  ON kb_chunks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chatbots 
      WHERE chatbots.id = kb_chunks.chatbot_id 
      AND chatbots.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kb_chunks_chatbot_id ON kb_chunks(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_knowledge_base_id ON kb_chunks(knowledge_base_id);

-- Create index for vector similarity search using cosine distance
CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding ON kb_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to search for similar chunks
CREATE OR REPLACE FUNCTION search_similar_chunks(
  query_embedding vector(1536),
  target_chatbot_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb_chunks.id,
    kb_chunks.content,
    1 - (kb_chunks.embedding <=> query_embedding) AS similarity
  FROM kb_chunks
  WHERE 
    kb_chunks.chatbot_id = target_chatbot_id
    AND 1 - (kb_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY kb_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;