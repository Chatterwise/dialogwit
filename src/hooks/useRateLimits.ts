import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useToast } from '../lib/toastStore'

export interface RateLimitConfig {
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  burst_limit: number
  enabled: boolean
}

export interface RateLimitStatus {
  identifier: string
  endpoint: string
  requests_count: number
  window_start: string
  blocked_until?: string
  created_at: string
}

export const useRateLimitConfig = (userId: string) => {
  return useQuery({
    queryKey: ['rate_limit_config', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('endpoint', 'default')
        .maybeSingle()

      if (error) {
        throw error
      }

      // Return data or defaults if not found
      return data || {
        requests_per_minute: 100,
        requests_per_hour: 1000,
        requests_per_day: 10000,
        burst_limit: 20,
        enabled: true
      } as RateLimitConfig
    },
    enabled: !!userId
  })
}

export const useUpdateRateLimitConfig = () => {
  const queryClient = useQueryClient()
const toast = useToast()

  return useMutation({
    mutationFn: async ({ 
      userId, 
      config 
    }: { 
      userId: string
      config: RateLimitConfig 
    }) => {
      const { data, error } = await supabase
        .from('rate_limit_configs')
        .upsert({
          user_id: userId,
          endpoint: 'default',
          config_type: 'user',
          requests_per_minute: config.requests_per_minute,
          requests_per_hour: config.requests_per_hour,
          requests_per_day: config.requests_per_day,
          burst_limit: config.burst_limit,
          enabled: config.enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,endpoint'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rate_limit_config', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['rate_limit_status'] })
      toast.success("Rate limit config updated")
    },onError: () => {
      toast.error("Failed to update config")
    }
  })
}

export const useRateLimitStatus = () => {
  return useQuery({
    queryKey: ['rate_limit_status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      // Group by identifier and endpoint
      const statusMap = new Map<string, RateLimitStatus[]>()
      
      data?.forEach(item => {
        const key = `${item.identifier}-${item.endpoint}`
        if (!statusMap.has(key)) {
          statusMap.set(key, [])
        }
        statusMap.get(key)!.push(item)
      })

      const now = new Date()
      const activeBlocks = data?.filter(item => 
        item.blocked_until && new Date(item.blocked_until) > now
      ) || []

      return {
        recent_limits: data || [],
        grouped_status: Object.fromEntries(statusMap.entries()),
        total_blocked: activeBlocks.length,
        total_active_limits: statusMap.size,
        blocked_ips: activeBlocks.map(item => ({
          identifier: item.identifier,
          endpoint: item.endpoint,
          blocked_until: item.blocked_until,
          requests_count: item.requests_count
        }))
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export const useClearRateLimit = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({
      identifier,
      endpoint
    }: {
      identifier: string
      endpoint?: string
    }) => {
      let query = supabase
        .from('rate_limits')
        .delete()
        .eq('identifier', identifier)

      if (endpoint) {
        query = query.eq('endpoint', endpoint)
      }

      const { error } = await query

      if (error) throw error
      return { identifier, endpoint }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate_limit_status'] })
      toast.success("Rate limit cleared successfully")
    },onError: () => {
       toast.error("Failed to clear rate limit")
    }
  })
}

export const useRateLimitAnalytics = (timeRange: '1h' | '24h' | '7d' = '24h') => {
  return useQuery({
    queryKey: ['rate_limit_analytics', timeRange],
    queryFn: async () => {
      const now = new Date()
      const startTime = new Date()
      
      switch (timeRange) {
        case '1h':
          startTime.setHours(now.getHours() - 1)
          break
        case '24h':
          startTime.setDate(now.getDate() - 1)
          break
        case '7d':
          startTime.setDate(now.getDate() - 7)
          break
      }

      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Calculate analytics
      const totalRequests = data?.reduce((sum, item) => sum + item.requests_count, 0) || 0
      const uniqueIdentifiers = new Set(data?.map(item => item.identifier)).size
      const blockedRequests = data?.filter(item => item.blocked_until).length || 0
      const topEndpoints = data?.reduce((acc, item) => {
        acc[item.endpoint] = (acc[item.endpoint] || 0) + item.requests_count
        return acc
      }, {} as Record<string, number>)

      // Group by time intervals for chart data
      const intervalMs = timeRange === '1h' ? 5 * 60 * 1000 : // 5 minutes
                        timeRange === '24h' ? 60 * 60 * 1000 : // 1 hour
                        24 * 60 * 60 * 1000 // 1 day

      const chartData = []
      const currentTime = startTime.getTime()
      const endTime = now.getTime()

      for (let time = currentTime; time <= endTime; time += intervalMs) {
        const intervalStart = new Date(time)
        const intervalEnd = new Date(time + intervalMs)
        
        const intervalRequests = data?.filter(item => {
          const itemTime = new Date(item.created_at).getTime()
          return itemTime >= intervalStart.getTime() && itemTime < intervalEnd.getTime()
        }).reduce((sum, item) => sum + item.requests_count, 0) || 0

        chartData.push({
          timestamp: intervalStart.toISOString(),
          requests: intervalRequests,
          label: intervalStart.toLocaleTimeString()
        })
      }

      return {
        total_requests: totalRequests,
        unique_identifiers: uniqueIdentifiers,
        blocked_requests: blockedRequests,
        top_endpoints: Object.entries(topEndpoints)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([endpoint, count]) => ({ endpoint, count })),
        chart_data: chartData,
        block_rate: totalRequests > 0 ? (blockedRequests / totalRequests) * 100 : 0
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export const useGlobalRateLimitStats = () => {
  return useQuery({
    queryKey: ['global_rate_limit_stats'],
    queryFn: async () => {
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .gte('created_at', last24h.toISOString())

      if (error) throw error

      const stats = {
        total_requests_24h: data?.reduce((sum, item) => sum + item.requests_count, 0) || 0,
        unique_ips_24h: new Set(data?.map(item => item.identifier)).size,
        blocked_ips_24h: data?.filter(item => item.blocked_until).length || 0,
        top_blocked_ips: data
          ?.filter(item => item.blocked_until)
          .reduce((acc, item) => {
            acc[item.identifier] = (acc[item.identifier] || 0) + 1
            return acc
          }, {} as Record<string, number>),
        hourly_distribution: Array.from({ length: 24 }, (_, hour) => {
          const hourStart = new Date(now)
          hourStart.setHours(hour, 0, 0, 0)
          const hourEnd = new Date(hourStart)
          hourEnd.setHours(hour + 1)

          const hourRequests = data?.filter(item => {
            const itemTime = new Date(item.created_at)
            return itemTime >= hourStart && itemTime < hourEnd
          }).reduce((sum, item) => sum + item.requests_count, 0) || 0

          return {
            hour,
            requests: hourRequests,
            label: `${hour}:00`
          }
        })
      }

      return stats
    },
    refetchInterval: 60000, // Refresh every minute
  })
}