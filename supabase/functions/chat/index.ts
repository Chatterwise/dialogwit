import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { ChatRequest } from '../_shared/types.ts'
import { corsHeaders, createErrorResponse, createSuccessResponse, createCorsResponse, validateRequestBody } from '../_shared/utils/response.ts'
import { generateRAGResponse, generateFallbackResponse } from '../_shared/handlers/rag.ts'
import { saveChatMessage } from '../_shared/utils/database.ts'
import { OpenAIError } from '../_shared/utils/openai.ts'
import { withRateLimit } from '../_shared/middleware/rateLimiting.ts'
import { AuditLogger } from '../_shared/middleware/auditLogging.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  // Apply rate limiting
  return await withRateLimit(
    req,
    '/chat',
    {
      requests_per_minute: 60,
      requests_per_hour: 500,
      requests_per_day: 2000,
      enabled: true
    },
    async () => {
      try {
        const body = await req.json()
        const { botId, message, userIp } = validateRequestBody<ChatRequest>(body, ['botId', 'message'])

        // Initialize Supabase client and audit logger
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const auditLogger = new AuditLogger(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                        req.headers.get('x-real-ip') || 
                        userIp || 
                        'unknown'
        const userAgent = req.headers.get('user-agent') || 'unknown'

        let responseText: string
        let ragResponse: any = null

        try {
          // Try RAG response first
          ragResponse = await generateRAGResponse(message, botId, supabaseClient, {
            enableCitations: false,
            maxRetrievedChunks: 5,
            similarityThreshold: 0.7
          })
          responseText = ragResponse.response
          
        } catch (error) {
          if (error instanceof OpenAIError) {
            // Log security event for OpenAI configuration issues
            await auditLogger.logSecurityEvent(
              'openai_configuration_error',
              'medium',
              {
                error_message: error.message,
                chatbot_id: botId
              },
              undefined,
              clientIP
            )

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
          await saveChatMessage(supabaseClient, botId, message, responseText, clientIP)
        } catch (error) {
          console.error('Failed to save chat message:', error)
        }

        // Log successful chat interaction
        await auditLogger.logChatMessage(
          undefined, // No user ID for public chat
          botId,
          message,
          responseText,
          clientIP,
          userAgent
        )

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
    }
  )
})