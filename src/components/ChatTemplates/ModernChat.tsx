import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface ModernChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const ModernChat = (props: ModernChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="modern"
      botName="Modern Assistant"
      welcomeMessage="👋 Hi there! I'm your modern AI assistant. How can I help you today?"
      placeholder="Ask me anything..."
      className="animate-in slide-in-from-bottom-4 duration-300"
    />
  )
}