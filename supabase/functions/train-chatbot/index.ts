import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { TrainRequest, KnowledgeBaseItem } from '../_shared/types.ts'
import { createErrorResponse, createSuccessResponse, createCorsResponse, validateRequestBody } from '../_shared/utils/response.ts'
import { processKnowledgeBaseWithRAG } from '../_shared/handlers/processing.ts'
import { updateChatbotStatus } from '../_shared/utils/database.ts'
import { OpenAIError } from '../_shared/utils/openai.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  try {
    const body = await req.json()
    const { chatbotId, model } = validateRequestBody<TrainRequest>(body, ['chatbotId', 'model'])

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update chatbot status to processing
    await updateChatbotStatus(supabaseClient, chatbotId, 'processing')

    // Get knowledge base content
    const { data: knowledgeBase, error: kbError } = await supabaseClient
      .from('knowledge_base')
      .select('*')
      .eq('chatbot_id', chatbotId)

    if (kbError) {
      throw new Error(`Failed to retrieve knowledge base: ${kbError.message}`)
    }

    if (!knowledgeBase || knowledgeBase.length === 0) {
      await updateChatbotStatus(supabaseClient, chatbotId, 'ready', true)
      return createSuccessResponse({
        success: true,
        message: 'No knowledge base content to process',
        processingResult: {
          model,
          knowledgeBaseItems: 0,
          totalChunks: 0,
          embeddingsCreated: 0,
          tokensUsed: 0,
          processingType: 'No content'
        }
      })
    }

    let processingResult
    
    try {
      // Process knowledge base with RAG pipeline
      processingResult = await processKnowledgeBaseWithRAG(
        knowledgeBase as KnowledgeBaseItem[],
        chatbotId,
        model,
        supabaseClient
      )
      
    } catch (error) {
      if (error instanceof OpenAIError) {
        // Return clear error for OpenAI configuration issues
        await updateChatbotStatus(supabaseClient, chatbotId, 'error')
        
        return createErrorResponse(
          'OpenAI integration is not properly configured',
          503,
          {
            type: 'openai_configuration_error',
            message: error.message,
            suggestion: 'Please configure the OPENAI_API_KEY environment variable'
          }
        )
      }
      
      throw error
    }

    // Mark knowledge base items as processed
    const itemIds = knowledgeBase.map(item => item.id)
    await supabaseClient
      .from('knowledge_base')
      .update({ processed: true })
      .in('id', itemIds)

    // Update chatbot status to ready
    await updateChatbotStatus(supabaseClient, chatbotId, 'ready', true)

    return createSuccessResponse({
      success: true,
      message: 'RAG pipeline completed successfully',
      processingResult
    })

  } catch (error) {
    console.error('RAG processing error:', error)
    
    // Update chatbot status to error
    try {
      const body = await req.json()
      const { chatbotId } = body
      if (chatbotId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        await updateChatbotStatus(supabaseClient, chatbotId, 'error')
      }
    } catch (e) {
      console.error('Failed to update chatbot status to error:', e)
    }

    if (error.message.includes('Missing required field')) {
      return createErrorResponse(error.message, 400)
    }
    
    return createErrorResponse('Failed to process RAG pipeline', 500, {
      details: error.message
    })
  }
})