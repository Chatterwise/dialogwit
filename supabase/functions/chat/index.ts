import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  generateRAGResponse,
  generateStreamingRAGResponse
} from '../_shared/handlers/rag.ts';
import {
  createErrorResponse,
  createSuccessResponse,
  createCorsResponse
} from '../_shared/utils/response.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const body = await req.json();
    const { message, chatbot_id, user_ip, stream = false } = body;

    if (!message || !chatbot_id) {
      return createErrorResponse('Message and chatbot_id are required', 400);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: chatbot, error: chatbotError } = await supabaseClient
      .from('chatbots')
      .select('id, name, user_id, status')
      .eq('id', chatbot_id)
      .single();

    if (chatbotError || !chatbot) {
      return createErrorResponse('Chatbot not found', 404);
    }

    if (chatbot.status !== 'ready') {
      return createErrorResponse('Chatbot is not ready', 400, {
        status: chatbot.status
      });
    }

    const userId = chatbot.user_id;
    if (!userId) {
      return createErrorResponse('User ID not found for the chatbot', 400);
    }

    try {
      if (stream) {
        const { stream: responseStream } = await generateStreamingRAGResponse(
          {
            message,
            chatbotId: chatbot_id,
            userId,
            userIp: user_ip || 'unknown' // pass this to log IP later
          },
          supabaseClient
        );

        // ✅ Just return the stream — do not try to consume it again
        return new Response(responseStream, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      } else {
        const result = await generateRAGResponse(
          message,
          chatbot_id,
          supabaseClient,
          {},
          userId
        );

        const { data: chatMessage, error: insertError } = await supabaseClient
          .from('chat_messages')
          .insert({
            chatbot_id,
            message,
            response: result.response,
            user_ip: user_ip || 'unknown'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Failed to store chat message:', insertError);
        }

        return createSuccessResponse({
          response: result.response,
          context: result.context,
          usage: result.usage,
          cost_estimate: result.cost_estimate,
          message_id: chatMessage?.id
        });
      }
    } catch (error) {
      if (error.message?.includes('Token limit would be exceeded')) {
        return createErrorResponse('Token limit exceeded', 429, {
          message: error.message
        });
      }
      if (error.status === 401 || error.message?.includes('Invalid API key')) {
        return createErrorResponse('AI service not configured', 503, {
          message: 'The AI service is not properly configured. Please contact support.'
        });
      }
      if (error.status === 429) {
        return createErrorResponse('AI service rate limit exceeded', 429, {
          message: 'Too many requests. Please try again later.'
        });
      }

      return createErrorResponse('AI service error', 503, {
        message: error.message
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    return createErrorResponse('Internal server error', 500, {
      details: error.message
    });
  }
});
