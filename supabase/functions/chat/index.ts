import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { ChatRequest } from '../_shared/types.ts'
import { corsHeaders, createErrorResponse, createSuccessResponse, createCorsResponse, validateRequestBody } from '../_shared/utils/response.ts'
import { generateRAGResponse, generateFallbackResponse } from '../_shared/handlers/rag.ts'
import { saveChatMessage } from '../_shared/utils/database.ts'
import { OpenAIError } from '../_shared/utils/openai.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  try {
    const body = await req.json()
    const { botId, message, userIp } = validateRequestBody<ChatRequest>(body, ['botId', 'message'])

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let responseText: string
    let ragResponse: any = null

    try {
      // Try RAG response first
      ragResponse = await generateRAGResponse(message, botId, supabaseClient, {
        enableCitations: false, // Can be made configurable
        maxRetrievedChunks: 5,
        similarityThreshold: 0.7
      })
      responseText = ragResponse.response
      
    } catch (error) {
      if (error instanceof OpenAIError) {
        // Return clear error for missing/invalid OpenAI key
        return createErrorResponse(
          'OpenAI integration is not properly configured. Please contact the administrator.',
          503,
          { 
            type: 'openai_configuration_error',
            message: error.message 
          }
        )
      }
      
      console.error('RAG response error:', error)
      
      // Fallback to simple response
      const chatbot = await supabaseClient
        .from('chatbots')
        .select('name')
        .eq('id', botId)
        .eq('status', 'ready')
        .single()
      
      if (!chatbot.data) {
        return createErrorResponse('Chatbot not found or not ready', 404)
      }
      
      responseText = await generateFallbackResponse(message, botId, chatbot.data.name, supabaseClient)
    }

    // Save chat message (don't let this fail the request)
    try {
      await saveChatMessage(supabaseClient, botId, message, responseText, userIp)
    } catch (error) {
      console.error('Failed to save chat message:', error)
    }

    // Return response with optional sources
    const response: any = { response: responseText }
    if (ragResponse?.sources) {
      response.sources = ragResponse.sources
    }

    return createSuccessResponse(response)

  } catch (error) {
    console.error('Chat function error:', error)
    
    if (error.message.includes('Missing required field')) {
      return createErrorResponse(error.message, 400)
    }
    
    return createErrorResponse('Internal server error', 500)
  }
})