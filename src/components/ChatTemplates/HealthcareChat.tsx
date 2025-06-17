import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface HealthcareChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const HealthcareChat = (props: HealthcareChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="healthcare"
      botName="Health Assistant"
      welcomeMessage="🏥 Hello! I'm your healthcare assistant. I'm here to provide general health information and support. How can I help you today?"
      placeholder="Ask about health topics..."
      className="animate-in fade-in-up duration-400"
    />
  )
}