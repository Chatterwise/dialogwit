import { useMutation, useQueryClient } from '@tanstack/react-query'

interface TrainChatbotParams {
  chatbotId: string
  model: string
}

export const useTrainChatbot = () => {
  const queryClient = useQueryClient()

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
          model
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to train chatbot')
      }

      const data = await response.json()
      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate chatbot queries to refetch updated status
      queryClient.invalidateQueries({ queryKey: ['chatbot', variables.chatbotId] })
      queryClient.invalidateQueries({ queryKey: ['chatbots'] })
    }
  })
}