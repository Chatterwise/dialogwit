/*
  # Update kb_chunks table schema

  1. Schema Updates
    - Add source_url column for citation support
    - Add metadata jsonb column for additional chunk information
    - Update search function to return additional metadata

  2. Indexes
    - Add index on source_url for citation queries
    - Add GIN index on metadata for JSON queries
*/

-- Add new columns to kb_chunks table
DO $$
BEGIN
  -- Add source_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kb_chunks' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE kb_chunks ADD COLUMN source_url text;
  END IF;

  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kb_chunks' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE kb_chunks ADD COLUMN metadata jsonb;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_kb_chunks_source_url ON kb_chunks(source_url);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_metadata ON kb_chunks USING GIN (metadata);

-- Update the search function to return additional metadata
CREATE OR REPLACE FUNCTION search_similar_chunks(
  query_embedding vector(1536),
  target_chatbot_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  chunk_index integer,
  source_url text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb_chunks.id,
    kb_chunks.content,
    1 - (kb_chunks.embedding <=> query_embedding) AS similarity,
    kb_chunks.chunk_index,
    kb_chunks.source_url,
    kb_chunks.metadata
  FROM kb_chunks
  WHERE 
    kb_chunks.chatbot_id = target_chatbot_id
    AND kb_chunks.embedding IS NOT NULL
    AND 1 - (kb_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY kb_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function for text-based fallback search
CREATE OR REPLACE FUNCTION search_chunks_by_text(
  search_query text,
  target_chatbot_id uuid,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  content text,
  chunk_index integer,
  source_url text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb_chunks.id,
    kb_chunks.content,
    kb_chunks.chunk_index,
    kb_chunks.source_url,
    kb_chunks.metadata
  FROM kb_chunks
  WHERE 
    kb_chunks.chatbot_id = target_chatbot_id
    AND kb_chunks.content ILIKE '%' || search_query || '%'
  ORDER BY 
    CASE 
      WHEN kb_chunks.content ILIKE search_query || '%' THEN 1
      WHEN kb_chunks.content ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    length(kb_chunks.content)
  LIMIT match_count;
END;
$$;