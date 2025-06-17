import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { corsHeaders, createErrorResponse, createSuccessResponse, createCorsResponse } from '../_shared/utils/response.ts'
import { AuditLogger } from '../_shared/middleware/auditLogging.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  const url = new URL(req.url)
  const path = url.pathname.replace('/integrations', '')

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

  try {
    // Slack Integration
    if (path === '/slack' && req.method === 'POST') {
      const body = await req.json()
      
      // Handle Slack slash commands and events
      if (body.type === 'url_verification') {
        return new Response(body.challenge, {
          headers: { 'Content-Type': 'text/plain' }
        })
      }

      if (body.type === 'event_callback') {
        const event = body.event
        
        if (event.type === 'message' && !event.bot_id) {
          // Process message through chatbot
          const chatbotId = body.chatbot_id || 'default-slack-bot'
          
          try {
            const chatResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                botId: chatbotId,
                message: event.text,
                userIp: 'slack-integration'
              })
            })

            const chatData = await chatResponse.json()
            
            // Send response back to Slack
            const slackResponse = await fetch(body.response_url || `https://slack.com/api/chat.postMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SLACK_BOT_TOKEN')}`
              },
              body: JSON.stringify({
                channel: event.channel,
                text: chatData.response,
                thread_ts: event.ts
              })
            })

            await auditLogger.logAction(
              undefined,
              'slack_message_processed',
              'integrations',
              chatbotId,
              { channel: event.channel, user: event.user },
              clientIP,
              'slack-integration',
              slackResponse.ok
            )

          } catch (error) {
            console.error('Slack message processing error:', error)
          }
        }
      }

      return createSuccessResponse({ message: 'Slack event processed' })
    }

    // Discord Integration
    if (path === '/discord' && req.method === 'POST') {
      const body = await req.json()
      
      // Handle Discord interactions
      if (body.type === 1) { // PING
        return new Response(JSON.stringify({ type: 1 }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (body.type === 2) { // APPLICATION_COMMAND
        const chatbotId = body.chatbot_id || 'default-discord-bot'
        const message = body.data.options?.[0]?.value || body.data.name
        
        try {
          const chatResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              botId: chatbotId,
              message,
              userIp: 'discord-integration'
            })
          })

          const chatData = await chatResponse.json()

          await auditLogger.logAction(
            undefined,
            'discord_command_processed',
            'integrations',
            chatbotId,
            { guild_id: body.guild_id, user: body.member?.user?.id },
            clientIP,
            'discord-integration',
            true
          )

          return new Response(JSON.stringify({
            type: 4,
            data: {
              content: chatData.response
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          })

        } catch (error) {
          console.error('Discord command processing error:', error)
          
          return new Response(JSON.stringify({
            type: 4,
            data: {
              content: 'Sorry, I encountered an error processing your request.'
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }

      return createSuccessResponse({ message: 'Discord interaction processed' })
    }

    // Teams Integration
    if (path === '/teams' && req.method === 'POST') {
      const body = await req.json()
      
      if (body.type === 'message') {
        const chatbotId = body.chatbot_id || 'default-teams-bot'
        const message = body.text
        
        try {
          const chatResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              botId: chatbotId,
              message,
              userIp: 'teams-integration'
            })
          })

          const chatData = await chatResponse.json()

          await auditLogger.logAction(
            undefined,
            'teams_message_processed',
            'integrations',
            chatbotId,
            { conversation: body.conversation?.id, user: body.from?.id },
            clientIP,
            'teams-integration',
            true
          )

          // Return Teams bot response format
          return new Response(JSON.stringify({
            type: 'message',
            text: chatData.response
          }), {
            headers: { 'Content-Type': 'application/json' }
          })

        } catch (error) {
          console.error('Teams message processing error:', error)
          
          return new Response(JSON.stringify({
            type: 'message',
            text: 'Sorry, I encountered an error processing your request.'
          }), {
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }

      return createSuccessResponse({ message: 'Teams message processed' })
    }

    // Zapier Integration
    if (path === '/zapier' && req.method === 'POST') {
      const body = await req.json()
      
      // Process Zapier webhook
      const { trigger_event, data, chatbot_id } = body
      
      if (trigger_event === 'new_message') {
        // Trigger webhook for new message
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/webhooks/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            event: 'message_received',
            data,
            chatbot_id
          })
        })
      }

      await auditLogger.logAction(
        undefined,
        'zapier_webhook_processed',
        'integrations',
        chatbot_id,
        { trigger_event },
        clientIP,
        'zapier-integration',
        true
      )

      return createSuccessResponse({ message: 'Zapier webhook processed' })
    }

    return createErrorResponse('Integration endpoint not found', 404)

  } catch (error) {
    console.error('Integration error:', error)
    return createErrorResponse('Integration processing failed', 500)
  }
})