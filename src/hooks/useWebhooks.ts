import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { fetchWithRetry } from '../lib/http'

export interface Webhook {
  id: string
  user_id: string
  chatbot_id?: string
  name: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  last_triggered_at?: string
  success_count: number
  failure_count: number
  created_at: string
  updated_at: string
}

export const useWebhooks = (userId: string, chatbotId?: string) => {
  return useQuery({
    queryKey: ['webhooks', userId, chatbotId],
    queryFn: async () => {
      let query = supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (chatbotId) {
        query = query.eq('chatbot_id', chatbotId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Webhook[]
    },
    enabled: !!userId
  })
}

export const useCreateWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (webhook: Omit<Webhook, 'id' | 'created_at' | 'updated_at' | 'last_triggered_at' | 'success_count' | 'failure_count'>) => {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          ...webhook,
          success_count: 0,
          failure_count: 0
        })
        .select()
        .single()

      if (error) throw error
      return data as Webhook
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', data.user_id] })
    }
  })
}

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: Partial<Webhook> 
    }) => {
      const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Webhook
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', data.user_id] })
    }
  })
}

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    }
  })
}

export const useTestWebhook = () => {
  return useMutation({
    mutationFn: async (webhookId: string) => {
      const response = await fetchWithRetry(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhooks/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ webhook_id: webhookId }),
        timeoutMs: 15000,
        retries: 1,
      })

      if (!response.ok) {
        throw new Error('Webhook test failed')
      }

      return await response.json()
    }
  })
}
