import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface AuditLogEntry {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  created_at: string
}

export interface AuditLogFilters {
  action?: string
  resource_type?: string
  start_date?: string
  end_date?: string
  success?: boolean
  limit?: number
  offset?: number
}

export const useAuditLogs = (userId: string, filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: ['audit_logs', userId, filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters.action) {
        query = query.eq('action', filters.action)
      }

      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type)
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date)
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date)
      }

      if (filters.success !== undefined) {
        query = query.eq('success', filters.success)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data as AuditLogEntry[]
    },
    enabled: !!userId,
  })
}

export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      format,
      filters
    }: {
      userId: string
      format: 'csv' | 'json'
      filters?: AuditLogFilters
    }) => {
      // Get all logs for export (up to 10,000)
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10000)

      if (filters?.action) {
        query = query.eq('action', filters.action)
      }

      if (filters?.resource_type) {
        query = query.eq('resource_type', filters.resource_type)
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date)
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date)
      }

      if (filters?.success !== undefined) {
        query = query.eq('success', filters.success)
      }

      const { data, error } = await query

      if (error) throw error

      if (format === 'json') {
        return JSON.stringify(data, null, 2)
      }

      // CSV format
      if (!data || data.length === 0) {
        return 'No audit logs found'
      }

      const headers = [
        'timestamp',
        'action',
        'resource_type',
        'resource_id',
        'success',
        'ip_address',
        'user_agent',
        'details',
        'error_message'
      ]

      const csvRows = [
        headers.join(','),
        ...data.map(log => [
          log.created_at,
          log.action,
          log.resource_type,
          log.resource_id || '',
          log.success,
          log.ip_address || '',
          log.user_agent || '',
          JSON.stringify(log.details || {}).replace(/"/g, '""'),
          log.error_message || ''
        ].map(field => `"${field}"`).join(','))
      ]

      return csvRows.join('\n')
    }
  })
}

export const useSecurityEvents = (userId?: string) => {
  return useQuery({
    queryKey: ['security_events', userId],
    queryFn: async () => {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export const useResolveSecurityEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      resolvedBy
    }: {
      eventId: string
      resolvedBy: string
    }) => {
      const { data, error } = await supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy
        })
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security_events'] })
    }
  })
}