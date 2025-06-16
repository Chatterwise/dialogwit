import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { ProcessRequest, KnowledgeBaseItem } from '../_shared/types.ts'
import { createErrorResponse, createSuccessResponse, createCorsResponse, validateRequestBody } from '../_shared/utils/response.ts'
import { processKnowledgeItemWithChunking } from '../_shared/handlers/processing.ts'
import { updateChatbotStatus } from '../_shared/utils/database.ts'
import { OpenAIError } from '../_shared/utils/openai.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  try {
    const body = await req.json()
    const { chatbotId } = validateRequestBody<ProcessRequest>(body, ['chatbotId'])

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update chatbot status to processing
    await updateChatbotStatus(supabaseClient, chatbotId, 'processing')

    // Get unprocessed knowledge base items
    const { data: knowledgeItems, error: kbError } = await supabaseClient
      .from('knowledge_base')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .eq('processed', false)

    if (kbError) {
      throw new Error(`Failed to retrieve knowledge base items: ${kbError.message}`)
    }

    if (!knowledgeItems || knowledgeItems.length === 0) {
      await updateChatbotStatus(supabaseClient, chatbotId, 'ready', true)
      return createSuccessResponse({ 
        success: true, 
        message: 'No knowledge base items to process',
        itemsProcessed: 0
      })
    }

    let processedCount = 0
    let hasOpenAIError = false
    let openAIErrorMessage = ''

    // Process each knowledge base item
    for (const item of knowledgeItems) {
      try {
        await processKnowledgeItemWithChunking(item as KnowledgeBaseItem, supabaseClient)
        
        // Mark as processed
        await supabaseClient
          .from('knowledge_base')
          .update({ processed: true })
          .eq('id', item.id)
        
        processedCount++
        
      } catch (error) {
        if (error instanceof OpenAIError) {
          hasOpenAIError = true
          openAIErrorMessage = error.message
          console.error(`OpenAI error processing item ${item.id}:`, error)
          
          // Mark as processed even with OpenAI error (chunks stored without embeddings)
          await supabaseClient
            .from('knowledge_base')
            .update({ processed: true })
            .eq('id', item.id)
          
          processedCount++
        } else {
          console.error(`Error processing item ${item.id}:`, error)
          throw error
        }
      }
    }

    // Update chatbot status to ready
    await updateChatbotStatus(supabaseClient, chatbotId, 'ready', true)

    const response: any = {
      success: true,
      message: 'Knowledge base processed successfully',
      itemsProcessed: processedCount,
      totalItems: knowledgeItems.length
    }

    if (hasOpenAIError) {
      response.warning = 'OpenAI integration not configured - content chunked but embeddings not created'
      response.openai_error = openAIErrorMessage
    }

    return createSuccessResponse(response)

  } catch (error) {
    console.error('Process knowledge base error:', error)
    
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
    
    return createErrorResponse('Failed to process knowledge base', 500, {
      details: error.message
    })
  }
})