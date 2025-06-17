import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { corsHeaders, createErrorResponse, createSuccessResponse, createCorsResponse } from '../_shared/utils/response.ts'
import { authenticateRequest, validateApiKey, AuthenticationError } from '../_shared/middleware/authentication.ts'
import { withRateLimit } from '../_shared/middleware/rateLimiting.ts'
import { AuditLogger } from '../_shared/middleware/auditLogging.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  const url = new URL(req.url)
  const path = url.pathname.replace('/api', '')
  
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
                  'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  try {
    // Authenticate request
    let authContext
    try {
      authContext = await authenticateRequest(
        req,
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return createErrorResponse('Unauthorized', 401, { error: error.message })
      }
      throw error
    }

    // Route requests
    if (path === '/chatbots' && req.method === 'GET') {
      return await withRateLimit(req, '/api/chatbots', { requests_per_minute: 100 }, async () => {
        const { data, error } = await supabaseClient
          .from('chatbots')
          .select('*')
          .eq('user_id', authContext.userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        await auditLogger.logAction(
          authContext.userId!,
          'list_chatbots',
          'chatbots',
          undefined,
          { count: data?.length || 0 },
          clientIP,
          userAgent,
          true
        )

        return createSuccessResponse({ data })
      })
    }

    if (path.startsWith('/chatbots/') && req.method === 'GET') {
      const chatbotId = path.split('/')[2]
      
      return await withRateLimit(req, '/api/chatbots/:id', { requests_per_minute: 200 }, async () => {
        const { data, error } = await supabaseClient
          .from('chatbots')
          .select('*')
          .eq('id', chatbotId)
          .eq('user_id', authContext.userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return createErrorResponse('Chatbot not found', 404)
          }
          throw error
        }

        await auditLogger.logAction(
          authContext.userId!,
          'get_chatbot',
          'chatbots',
          chatbotId,
          {},
          clientIP,
          userAgent,
          true
        )

        return createSuccessResponse({ data })
      })
    }

    if (path === '/chatbots' && req.method === 'POST') {
      return await withRateLimit(req, '/api/chatbots', { requests_per_minute: 20 }, async () => {
        const body = await req.json()
        const { name, description } = body

        if (!name || !description) {
          return createErrorResponse('Name and description are required', 400)
        }

        const { data, error } = await supabaseClient
          .from('chatbots')
          .insert({
            name,
            description,
            user_id: authContext.userId,
            status: 'creating'
          })
          .select()
          .single()

        if (error) throw error

        await auditLogger.logAction(
          authContext.userId!,
          'create_chatbot',
          'chatbots',
          data.id,
          { name, description },
          clientIP,
          userAgent,
          true
        )

        return createSuccessResponse({ data }, 201)
      })
    }

    if (path.startsWith('/chatbots/') && req.method === 'PUT') {
      const chatbotId = path.split('/')[2]
      
      return await withRateLimit(req, '/api/chatbots/:id', { requests_per_minute: 50 }, async () => {
        const body = await req.json()
        const { name, description, status } = body

        // Verify ownership
        const { data: existing } = await supabaseClient
          .from('chatbots')
          .select('id')
          .eq('id', chatbotId)
          .eq('user_id', authContext.userId)
          .single()

        if (!existing) {
          return createErrorResponse('Chatbot not found', 404)
        }

        const updates: any = {}
        if (name) updates.name = name
        if (description) updates.description = description
        if (status) updates.status = status

        const { data, error } = await supabaseClient
          .from('chatbots')
          .update(updates)
          .eq('id', chatbotId)
          .select()
          .single()

        if (error) throw error

        await auditLogger.logAction(
          authContext.userId!,
          'update_chatbot',
          'chatbots',
          chatbotId,
          updates,
          clientIP,
          userAgent,
          true
        )

        return createSuccessResponse({ data })
      })
    }

    if (path.startsWith('/chatbots/') && req.method === 'DELETE') {
      const chatbotId = path.split('/')[2]
      
      return await withRateLimit(req, '/api/chatbots/:id', { requests_per_minute: 10 }, async () => {
        // Verify ownership
        const { data: existing } = await supabaseClient
          .from('chatbots')
          .select('id, name')
          .eq('id', chatbotId)
          .eq('user_id', authContext.userId)
          .single()

        if (!existing) {
          return createErrorResponse('Chatbot not found', 404)
        }

        const { error } = await supabaseClient
          .from('chatbots')
          .delete()
          .eq('id', chatbotId)

        if (error) throw error

        await auditLogger.logAction(
          authContext.userId!,
          'delete_chatbot',
          'chatbots',
          chatbotId,
          { name: existing.name },
          clientIP,
          userAgent,
          true
        )

        return createSuccessResponse({ message: 'Chatbot deleted successfully' })
      })
    }

    if (path === '/knowledge-base' && req.method === 'POST') {
      return await withRateLimit(req, '/api/knowledge-base', { requests_per_minute: 50 }, async () => {
        const body = await req.json()
        const { chatbot_id, content, content_type, filename } = body

        if (!chatbot_id || !content) {
          return createErrorResponse('Chatbot ID and content are required', 400)
        }

        // Verify chatbot ownership
        const { data: chatbot } = await supabaseClient
          .from('chatbots')
          .select('id')
          .eq('id', chatbot_id)
          .eq('user_id', authContext.userId)
          .single()

        if (!chatbot) {
          return createErrorResponse('Chatbot not found', 404)
        }

        const { data, error } = await supabaseClient
          .from('knowledge_base')
          .insert({
            chatbot_id,
            content,
            content_type: content_type || 'text',
            filename,
            processed: false
          })
          .select()
          .single()

        if (error) throw error

        await auditLogger.logAction(
          authContext.userId!,
          'add_knowledge_base',
          'knowledge_base',
          data.id,
          { chatbot_id, content_type, filename },
          clientIP,
          userAgent,
          true
        )

        return createSuccessResponse({ data }, 201)
      })
    }

    if (path.startsWith('/analytics/') && req.method === 'GET') {
      const chatbotId = path.split('/')[2]
      const params = new URLSearchParams(url.search)
      const period = params.get('period') || '30d'
      
      return await withRateLimit(req, '/api/analytics/:id', { requests_per_minute: 100 }, async () => {
        // Verify chatbot ownership
        const { data: chatbot } = await supabaseClient
          .from('chatbots')
          .select('id, name')
          .eq('id', chatbotId)
          .eq('user_id', authContext.userId)
          .single()

        if (!chatbot) {
          return createErrorResponse('Chatbot not found', 404)
        }

        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        
        switch (period) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(endDate.getDate() - 30)
            break
          case '90d':
            startDate.setDate(endDate.getDate() - 90)
            break
          default:
            startDate.setDate(endDate.getDate() - 30)
        }

        // Get chat messages for analytics
        const { data: messages, error } = await supabaseClient
          .from('chat_messages')
          .select('created_at, message, response, user_ip')
          .eq('chatbot_id', chatbotId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        if (error) throw error

        // Calculate analytics
        const totalMessages = messages?.length || 0
        const uniqueUsers = new Set(messages?.map(m => m.user_ip)).size || 0
        const avgResponseTime = Math.floor(Math.random() * 1000) + 500 // Mock data

        // Group by day for daily stats
        const dailyStats = messages?.reduce((acc: any, message: any) => {
          const date = new Date(message.created_at).toISOString().split('T')[0]
          if (!acc[date]) {
            acc[date] = { messages: 0, users: new Set() }
          }
          acc[date].messages++
          acc[date].users.add(message.user_ip)
          return acc
        }, {}) || {}

        const formattedDailyStats = Object.entries(dailyStats).map(([date, stats]: [string, any]) => ({
          date,
          messages: stats.messages,
          users: stats.users.size
        }))

        const analyticsData = {
          total_messages: totalMessages,
          unique_users: uniqueUsers,
          avg_response_time: avgResponseTime,
          satisfaction_rate: Math.floor(Math.random() * 20) + 75, // Mock data
          period,
          daily_stats: formattedDailyStats
        }

        await auditLogger.logAction(
          authContext.userId!,
          'get_analytics',
          'analytics',
          chatbotId,
          { period },
          clientIP,
          userAgent,
          true
        )

        return createSuccessResponse({ data: analyticsData })
      })
    }

    // Default 404 for unmatched routes
    return createErrorResponse('Endpoint not found', 404)

  } catch (error) {
    console.error('API error:', error)
    
    // Log failed request
    try {
      await auditLogger.logAction(
        authContext?.userId,
        'api_error',
        'api',
        undefined,
        { path, method: req.method, error: error.message },
        clientIP,
        userAgent,
        false,
        error.message
      )
    } catch (logError) {
      console.error('Failed to log audit event:', logError)
    }

    return createErrorResponse('Internal server error', 500, {
      details: error.message
    })
  }
})