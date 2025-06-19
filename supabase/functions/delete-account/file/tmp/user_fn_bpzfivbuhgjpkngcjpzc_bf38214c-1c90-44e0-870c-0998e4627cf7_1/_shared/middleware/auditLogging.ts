import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export class AuditLogger {
  supabase;
  constructor(supabaseUrl, supabaseKey){
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  async log(entry) {
    try {
      const { error } = await this.supabase.from('audit_logs').insert({
        user_id: entry.user_id || null,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id || null,
        details: entry.details || {},
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
        success: entry.success !== false,
        error_message: entry.error_message || null,
        created_at: new Date().toISOString()
      });
      if (error) {
        console.error('Failed to write audit log:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    // Don't throw - audit logging should not break the main flow
    }
  }
  async logChatMessage(userId, chatbotId, message, response, ipAddress, userAgent) {
    await this.log({
      user_id: userId,
      action: 'chat_message_sent',
      resource_type: 'chatbot',
      resource_id: chatbotId,
      details: {
        message_length: message.length,
        response_length: response.length,
        timestamp: new Date().toISOString()
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true
    });
  }
  async logChatbotCreated(userId, chatbotId, chatbotName, ipAddress, userAgent) {
    await this.log({
      user_id: userId,
      action: 'chatbot_created',
      resource_type: 'chatbot',
      resource_id: chatbotId,
      details: {
        chatbot_name: chatbotName,
        timestamp: new Date().toISOString()
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true
    });
  }
  async logChatbotDeleted(userId, chatbotId, chatbotName, ipAddress, userAgent) {
    await this.log({
      user_id: userId,
      action: 'chatbot_deleted',
      resource_type: 'chatbot',
      resource_id: chatbotId,
      details: {
        chatbot_name: chatbotName,
        timestamp: new Date().toISOString()
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true
    });
  }
  async logKnowledgeBaseUpdated(userId, chatbotId, operation, details, ipAddress, userAgent) {
    await this.log({
      user_id: userId,
      action: `knowledge_base_${operation}`,
      resource_type: 'knowledge_base',
      resource_id: chatbotId,
      details: {
        operation,
        ...details,
        timestamp: new Date().toISOString()
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      success: true
    });
  }
  async logAPIAccess(userId, endpoint, method, statusCode, ipAddress, userAgent, apiKeyId) {
    await this.log({
      user_id: userId,
      action: 'api_access',
      resource_type: 'api',
      resource_id: endpoint,
      details: {
        method,
        status_code: statusCode,
        api_key_id: apiKeyId,
        timestamp: new Date().toISOString()
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      success: statusCode < 400
    });
  }
  async logSecurityEvent(eventType, severity, details, userId, ipAddress) {
    // Log to audit logs
    await this.log({
      user_id: userId,
      action: 'security_event',
      resource_type: 'security',
      resource_id: eventType,
      details: {
        event_type: eventType,
        severity,
        ...details,
        timestamp: new Date().toISOString()
      },
      ip_address: ipAddress,
      success: true
    });
    // Also log to security_events table
    try {
      await this.supabase.from('security_events').insert({
        event_type: eventType,
        severity,
        source_ip: ipAddress || null,
        user_id: userId || null,
        details,
        resolved: false,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  async getAuditLogs(userId, filters = {}) {
    let query = this.supabase.from('audit_logs').select('*').eq('user_id', userId).order('created_at', {
      ascending: false
    });
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
    return data || [];
  }
  async exportAuditLogs(userId, format = 'csv', filters = {}) {
    const logs = await this.getAuditLogs(userId, {
      ...filters,
      limit: 10000
    });
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }
    // CSV format
    if (logs.length === 0) {
      return 'No audit logs found';
    }
    const headers = [
      'timestamp',
      'action',
      'resource_type',
      'resource_id',
      'success',
      'ip_address',
      'details'
    ];
    const csvRows = [
      headers.join(','),
      ...logs.map((log)=>[
          log.created_at,
          log.action,
          log.resource_type,
          log.resource_id || '',
          log.success,
          log.ip_address || '',
          JSON.stringify(log.details || {}).replace(/"/g, '""')
        ].map((field)=>`"${field}"`).join(','))
    ];
    return csvRows.join('\n');
  }
}
// Middleware function for automatic audit logging
export async function withAuditLogging(request, action, resourceType, resourceId, handler) {
  const auditLogger = new AuditLogger(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  // Extract user ID from authorization header if present
  let userId;
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // In a real implementation, you'd decode the JWT token here
      // For now, we'll extract it from the request context if available
      userId = undefined // Will be set by the handler if available
      ;
    }
  } catch (error) {
  // Ignore auth parsing errors
  }
  let success = true;
  let errorMessage;
  try {
    const response = await handler();
    success = response.status < 400;
    if (!success) {
      const responseText = await response.clone().text();
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message;
      } catch  {
        errorMessage = responseText;
      }
    }
    // Log the action
    await auditLogger.log({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: {
        method: request.method,
        url: request.url,
        status_code: response.status
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      success,
      error_message: errorMessage
    });
    return response;
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Log the failed action
    await auditLogger.log({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: {
        method: request.method,
        url: request.url
      },
      ip_address: ipAddress,
      user_agent: userAgent,
      success: false,
      error_message: errorMessage
    });
    throw error;
  }
}
