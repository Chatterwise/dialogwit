This function will:

Fetch the knowledge_base entry by id

Download the file from Supabase Storage (file_path)

Extract text (PDF or plain text)

Chunk it

Generate embeddings via OpenAI

Insert into kb_chunks

Mark the knowledge_base row as processed
