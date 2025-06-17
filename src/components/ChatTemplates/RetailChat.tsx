import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface RetailChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const RetailChat = (props: RetailChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="retail"
      botName="Shopping Assistant"
      welcomeMessage="🛍️ Hi there! Welcome to our store! I'm here to help you find exactly what you're looking for. How can I assist you today?"
      placeholder="What are you shopping for?"
      className="animate-in slide-in-from-right-4 duration-300"
    />
  )
}