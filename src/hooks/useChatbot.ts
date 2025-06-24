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
}

export const useChatbot = ({ botId, apiUrl = '/api' }: UseChatbotOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, response: data.response, isLoading: false }
            : msg
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, response: 'Sorry, I encountered an error. Please try again.', isLoading: false }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [botId, apiUrl, isLoading])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  }
}