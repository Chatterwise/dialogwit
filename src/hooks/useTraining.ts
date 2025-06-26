import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../lib/toastStore'

interface TrainChatbotParams {
  chatbotId: string
  model: string
}

export const useTrainChatbot = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ chatbotId, model }: TrainChatbotParams) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/train-chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          chatbotId,
          model,
        }),
      })

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Train failed: ${response.status} ${text}`);
      }

      const data = await response.json()
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatbot', variables.chatbotId] })
      queryClient.invalidateQueries({ queryKey: ['chatbots'] })
      toast.success('Chatbot training completed successfully')
    },
    onError: () => {
      toast.error('Chatbot training failed. Please try again.')
    },
  })
}
