export interface ChatRequest {
  botId: string
  message: string
  userIp?: string
}

export interface ProcessRequest {
  chatbotId: string
}

export interface TrainRequest {
  chatbotId: string
  model: string
}

export interface KnowledgeBaseItem {
  id: string
  chatbot_id: string
  content: string
  content_type: 'text' | 'document'
  filename?: string
  processed: boolean
  created_at: string
}

export interface ChunkData {
  chatbot_id: string
  knowledge_base_id: string
  content: string
  embedding: number[] | null
  chunk_index: number
  source_url?: string
  metadata?: Record<string, any>
}

export interface SimilarChunk {
  id: string
  content: string
  similarity: number
  chunk_index: number
  source_url?: string
  metadata?: Record<string, any>
}

export interface RAGResponse {
  response: string
  sources?: Array<{
    content: string
    similarity: number
    chunk_index: number
    source_url?: string
  }>
  citations_enabled?: boolean
}

export interface ProcessingResult {
  model: string
  knowledgeBaseItems: number
  totalChunks: number
  embeddingsCreated: number
  tokensUsed: number
  processingType: string
  mock?: boolean
}

export interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[]
    index: number
  }>
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}