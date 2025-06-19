import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createErrorResponse, createSuccessResponse, createCorsResponse, validateRequestBody } from '../_shared/utils/response.ts';
import { processKnowledgeBase } from '../_shared/handlers/processing.ts';
import { updateChatbotStatus } from '../_shared/utils/database.ts';
import { OpenAIError } from '../_shared/utils/openai.ts';
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }
  try {
    const body = await req.json();
    const { chatbotId } = validateRequestBody(body, [
      'chatbotId'
    ]);
    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Update chatbot status to processing
    await updateChatbotStatus(supabaseClient, chatbotId, 'processing');
    // Get chatbot details for user tracking
    const { data: chatbot } = await supabaseClient.from('chatbots').select('user_id, name').eq('id', chatbotId).single();
    const userId = chatbot?.user_id;
    // Check if user has sufficient token allowance for processing
    if (userId) {
      const limitCheck = await supabaseClient.rpc('check_token_limit', {
        p_user_id: userId,
        p_metric_name: 'embedding_tokens_per_month',
        p_estimated_tokens: 5000 // Conservative estimate for processing
      });
      console.log(`Token limit check for user ${userId}:`, limitCheck);
    }
    try {
      // Process the knowledge base
      const result = await processKnowledgeBase(chatbotId, supabaseClient, {
        maxChunkLength: 1000,
        overlapLength: 200,
        batchSize: 20
      });
      // Update chatbot status to ready
      await updateChatbotStatus(supabaseClient, chatbotId, 'ready', true);
      const response = {
        success: true,
        message: 'Knowledge base processed successfully',
        itemsProcessed: result.itemsProcessed,
        totalChunks: result.totalChunks,
        tokensUsed: result.totalTokensUsed,
        costEstimate: result.totalCostEstimate,
        hasEmbeddings: result.hasEmbeddings
      };
      if (!result.hasEmbeddings) {
        response.warning = 'Content was chunked but embeddings were not created. This may be due to OpenAI configuration or token limits.';
      }
      // Send notification email if chatbot is ready and has embeddings
      if (result.hasEmbeddings && userId && chatbot?.name) {
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/email/new-chatbot`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chatbotId,
              chatbotName: chatbot.name
            })
          });
        } catch (emailError) {
          console.error('Failed to send new chatbot email:', emailError);
        // Don't fail the processing if email fails
        }
      }
      return createSuccessResponse(response);
    } catch (error) {
      console.error('Knowledge base processing error:', error);
      // Update chatbot status to error
      await updateChatbotStatus(supabaseClient, chatbotId, 'error');
      if (error instanceof OpenAIError) {
        return createErrorResponse('AI service error during processing', 503, {
          code: error.code,
          message: error.message,
          details: 'The knowledge base was chunked but embeddings could not be created.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Process knowledge base error:', error);
    // Update chatbot status to error if we have the chatbotId
    try {
      const body = await req.json();
      const { chatbotId } = body;
      if (chatbotId) {
        const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
        await updateChatbotStatus(supabaseClient, chatbotId, 'error');
      }
    } catch (e) {
      console.error('Failed to update chatbot status to error:', e);
    }
    if (error.message.includes('Missing required field')) {
      return createErrorResponse(error.message, 400);
    }
    return createErrorResponse('Failed to process knowledge base', 500, {
      details: error.message
    });
  }
});
