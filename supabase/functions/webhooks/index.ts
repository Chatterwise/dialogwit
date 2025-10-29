import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createErrorResponse, createSuccessResponse, createCorsResponse } from '../_shared/utils/response.ts';
import { AuditLogger } from '../_shared/middleware/auditLogging.ts';
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }
  const url = new URL(req.url);
  const path = url.pathname;
  // Initialize Supabase client and audit logger
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const auditLogger = new AuditLogger(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  try {
    if (path === '/webhooks/chat' && req.method === 'POST') {
      const body = await req.json();
      const { event, data, chatbot_id, user_id } = body;
      // Get active webhooks for this event
      let query = supabaseClient.from('webhooks').select('*').eq('active', true).contains('events', [
        event
      ]);
      if (chatbot_id) {
        query = query.eq('chatbot_id', chatbot_id);
      }
      const { data: webhooks, error } = await query;
      if (error) throw error;
      const results = [];
      // Send webhook to each registered endpoint
      for (const webhook of webhooks || []){
        try {
          const payload = {
            event,
            data,
            timestamp: new Date().toISOString(),
            chatbot_id,
            user_id,
            webhook_id: webhook.id
          };
          // Add signature if secret is provided
          const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ChatBot-Webhook/1.0'
          };
          if (webhook.secret) {
            const signature = await generateSignature(JSON.stringify(payload), webhook.secret);
            headers['X-Webhook-Signature'] = signature;
          }
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
          const success = response.ok;
          // Update webhook statistics
          await supabaseClient.from('webhooks').update({
            last_triggered_at: new Date().toISOString(),
            success_count: success ? supabaseClient.rpc('increment', {
              table_name: 'webhooks',
              column_name: 'success_count',
              row_id: webhook.id
            }) : webhook.success_count,
            failure_count: !success ? supabaseClient.rpc('increment', {
              table_name: 'webhooks',
              column_name: 'failure_count',
              row_id: webhook.id
            }) : webhook.failure_count
          }).eq('id', webhook.id);
          results.push({
            webhook_id: webhook.id,
            url: webhook.url,
            success,
            status: response.status,
            response_time: Date.now() // Simplified
          });
          // Log webhook delivery
          await auditLogger.logAction(webhook.user_id, 'webhook_delivery', 'webhooks', webhook.id, {
            event,
            success,
            status: response.status
          }, clientIP, 'webhook-system', success);
        } catch (error) {
          console.error(`Webhook delivery failed for ${webhook.url}:`, error);
          // Update failure count
          await supabaseClient.from('webhooks').update({
            failure_count: supabaseClient.rpc('increment', {
              table_name: 'webhooks',
              column_name: 'failure_count',
              row_id: webhook.id
            })
          }).eq('id', webhook.id);
          results.push({
            webhook_id: webhook.id,
            url: webhook.url,
            success: false,
            error: error.message
          });
        }
      }
      return createSuccessResponse({
        message: 'Webhooks processed',
        results,
        total_webhooks: webhooks?.length || 0,
        successful_deliveries: results.filter((r)=>r.success).length
      });
    }
    if (path === '/webhooks/test' && req.method === 'POST') {
      const body = await req.json();
      const { webhook_id } = body;
      if (!webhook_id) {
        return createErrorResponse('Webhook ID is required', 400);
      }
      // Get webhook details
      const { data: webhook, error } = await supabaseClient.from('webhooks').select('*').eq('id', webhook_id).single();
      if (error || !webhook) {
        return createErrorResponse('Webhook not found', 404);
      }
      // Send test payload
      const testPayload = {
        event: 'webhook_test',
        data: {
          message: 'This is a test webhook delivery',
          test: true
        },
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id
      };
      try {
        const headers = {
          'Content-Type': 'application/json',
          'User-Agent': 'ChatBot-Webhook-Test/1.0'
        };
        if (webhook.secret) {
          const signature = await generateSignature(JSON.stringify(testPayload), webhook.secret);
          headers['X-Webhook-Signature'] = signature;
        }
        const startTime = Date.now();
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(testPayload)
        });
        const responseTime = Date.now() - startTime;
        const success = response.ok;
        const responseText = await response.text();
        // Log test webhook
        await auditLogger.logAction(webhook.user_id, 'webhook_test', 'webhooks', webhook.id, {
          success,
          status: response.status,
          response_time: responseTime
        }, clientIP, 'webhook-test', success);
        return createSuccessResponse({
          success,
          status: response.status,
          response_time: responseTime,
          response_body: responseText.substring(0, 1000),
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error) {
        return createErrorResponse('Webhook test failed', 500, {
          error: error.message
        });
      }
    }
    return createErrorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Webhook error:', error);
    return createErrorResponse('Internal server error', 500);
  }
});
async function generateSignature(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {
    name: 'HMAC',
    hash: 'SHA-256'
  }, false, [
    'sign'
  ]);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  return 'sha256=' + hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
}
