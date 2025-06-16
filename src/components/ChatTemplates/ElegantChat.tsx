import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface ElegantChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const ElegantChat = (props: ElegantChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="elegant"
      botName="Elegant Assistant"
      welcomeMessage="✨ Greetings! I'm your elegant AI companion. How may I be of service today?"
      placeholder="Share your request..."
      className="animate-in fade-in-up duration-400"
    />
  )
}