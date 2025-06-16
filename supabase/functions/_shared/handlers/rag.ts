import { generateEmbedding, generateChatCompletion, streamChatCompletion, OpenAIError } from '../utils/openai.ts'
import { searchSimilarChunks, fallbackTextSearch, getChatbot, saveChatMessage } from '../utils/database.ts'
import { SimilarChunk, RAGResponse } from '../types.ts'

export interface RAGOptions {
  enableCitations?: boolean
  maxRetrievedChunks?: number
  similarityThreshold?: number
  enableStreaming?: boolean
  model?: string
  temperature?: number
  maxTokens?: number
}

export async function generateRAGResponse(
  message: string,
  botId: string,
  supabaseClient: any,
  options: RAGOptions = {}
): Promise<RAGResponse> {
  const {
    enableCitations = false,
    maxRetrievedChunks = 5,
    similarityThreshold = 0.7,
    enableStreaming = false,
    model = 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 500
  } = options

  // Get chatbot info
  const chatbot = await getChatbot(supabaseClient, botId)
  
  let retrievedChunks: SimilarChunk[] = []
  let context = ''

  try {
    // Step 1: Create embedding for the user's query
    const embeddingResponse = await generateEmbedding(message)
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Step 2: Search for similar chunks
    retrievedChunks = await searchSimilarChunks(
      supabaseClient,
      queryEmbedding,
      botId,
      {
        matchThreshold: similarityThreshold,
        matchCount: maxRetrievedChunks
      }
    )

    // Step 3: Build context from retrieved chunks
    if (retrievedChunks.length > 0) {
      context = retrievedChunks
        .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
        .join('\n\n')
    }

  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error // Re-throw OpenAI errors to caller
    }
    
    console.error('RAG retrieval error:', error)
    
    // Fallback to text search
    const fallbackChunks = await fallbackTextSearch(supabaseClient, message, botId)
    if (fallbackChunks.length > 0) {
      context = fallbackChunks
        .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
        .join('\n\n')
    }
  }

  // Step 4: Generate response using retrieved context
  const systemPrompt = buildSystemPrompt(chatbot.name, context, enableCitations)
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ]

  if (enableStreaming) {
    // For streaming, we'll need to handle this differently
    // This is a placeholder for streaming implementation
    throw new Error('Streaming not yet implemented in this handler')
  }

  const chatResponse = await generateChatCompletion(messages, {
    model,
    temperature,
    max_tokens: maxTokens
  }) as any

  const responseText = chatResponse.choices[0]?.message?.content || 
    'I apologize, but I encountered an error processing your request.'

  const ragResponse: RAGResponse = {
    response: responseText,
    citations_enabled: enableCitations
  }

  // Add sources if citations are enabled
  if (enableCitations && retrievedChunks.length > 0) {
    ragResponse.sources = retrievedChunks.map(chunk => ({
      content: chunk.content.substring(0, 200) + '...',
      similarity: chunk.similarity,
      chunk_index: chunk.chunk_index,
      source_url: chunk.source_url
    }))
  }

  return ragResponse
}

export async function generateFallbackResponse(
  message: string,
  botId: string,
  botName: string,
  supabaseClient: any
): Promise<string> {
  try {
    // Simple keyword search in chunks
    const fallbackChunks = await fallbackTextSearch(supabaseClient, message, botId)
    
    if (fallbackChunks.length > 0) {
      const context = fallbackChunks
        .map(chunk => chunk.content)
        .join('\n\n')
        .substring(0, 300)
      
      return `Hello! I'm ${botName}. Based on the information I have: ${context}... Is there anything specific you'd like to know more about?`
    }
  } catch (error) {
    console.error('Fallback search error:', error)
  }

  // Final fallback responses
  const responses = [
    `Hello! I'm ${botName}. I'd be happy to help you with that. Could you please provide more details about what you're looking for?`,
    `Hi there! I'm ${botName}, your AI assistant. I'm here to help answer your questions. What would you like to know?`,
    `Thank you for your question! I'm ${botName} and I'm designed to help with information from my knowledge base. Could you rephrase your question or ask about something more specific?`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

function buildSystemPrompt(
  botName: string,
  context: string,
  enableCitations: boolean
): string {
  const basePrompt = `You are ${botName}, a helpful AI assistant.`
  
  if (!context) {
    return `${basePrompt} No specific context found in the knowledge base. Provide a helpful general response and offer to help with topics that might be in the knowledge base. Always maintain a friendly, professional tone.`
  }

  const contextSection = `Knowledge Base Context:
${context}

Instructions:
- Answer based primarily on the provided context
- If the context doesn't contain relevant information, say so politely
- Be conversational and helpful
- Provide accurate information based on the context
- If asked about something not in the context, offer to help with related topics that are covered`

  const citationInstructions = enableCitations 
    ? '\n- When referencing information, you can mention it comes from the knowledge base'
    : ''

  return `${basePrompt}

${contextSection}${citationInstructions}

Always maintain a friendly, professional tone as ${botName}.`
}