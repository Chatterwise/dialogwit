import { useState, useCallback } from 'react'

interface ChatMessage {
  id: string
  message: string
  response: string
  timestamp: Date
  isLoading?: boolean
}

interface UseChatbotOptions {
  botId: string
  apiUrl?: string
  apiKey?: string
  onError?: (error: string) => void
  onMessageSent?: (message: string) => void
  onResponseReceived?: (response: string) => void
}

interface UseChatbotReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
  retryLastMessage: () => Promise<void>
}

/**
 * Custom React hook for integrating AI chatbot functionality
 * 
 * @param options Configuration options for the chatbot
 * @returns Object containing messages, loading state, and functions to interact with the chatbot
 * 
 * @example
 * ```tsx
 * import { useChatbot } from './useChatbot'
 * 
 * function ChatComponent() {
 *   const { messages, sendMessage, isLoading } = useChatbot({
 *     botId: 'your-bot-id',
 *     apiUrl: 'https://your-api.supabase.co/functions/v1',
 *     apiKey: 'your-api-key'
 *   })
 * 
 *   const handleSend = (message: string) => {
 *     sendMessage(message)
 *   }
 * 
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <div key={msg.id}>
 *           <div>User: {msg.message}</div>
 *           <div>Bot: {msg.response}</div>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useChatbot = ({
  botId,
  apiUrl = 'https://your-api.supabase.co/functions/v1',
  apiKey = 'YOUR_API_KEY',
  onError,
  onMessageSent,
  onResponseReceived
}: UseChatbotOptions): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string>('')

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return

    const messageId = Date.now().toString()
    const userMessage: ChatMessage = {
      id: messageId,
      message,
      response: '',
      timestamp: new Date(),
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage])
    setLastMessage(message)
    setIsLoading(true)
    setError(null)
    
    // Call onMessageSent callback
    onMessageSent?.(message)

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          botId,
          message,
          userIp: 'react-client'
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      
      if (!data.response) {
        throw new Error('Invalid response format from server')
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, response: data.response, isLoading: false }
            : msg
        )
      )
      
      // Call onResponseReceived callback
      onResponseReceived?.(data.response)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { 
                ...msg, 
                response: 'Sorry, I encountered an error. Please try again.', 
                isLoading: false 
              }
            : msg
        )
      )
      
      // Call onError callback
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [botId, apiUrl, apiKey, isLoading, onError, onMessageSent, onResponseReceived])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setLastMessage('')
  }, [])

  const retryLastMessage = useCallback(async () => {
    if (lastMessage && !isLoading) {
      // Remove the last message if it had an error
      setMessages(prev => prev.slice(0, -1))
      await sendMessage(lastMessage)
    }
  }, [lastMessage, isLoading, sendMessage])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage
  }
}

// Type exports for TypeScript users
export type { ChatMessage, UseChatbotOptions, UseChatbotReturn }