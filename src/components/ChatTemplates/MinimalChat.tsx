import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface MinimalChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const MinimalChat = (props: MinimalChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="minimal"
      botName="Assistant"
      welcomeMessage="Hello! How can I assist you?"
      placeholder="Type here..."
      className="animate-in fade-in duration-200"
    />
  )
}