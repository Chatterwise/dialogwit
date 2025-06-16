import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface ProfessionalChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const ProfessionalChat = (props: ProfessionalChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="professional"
      botName="Professional Assistant"
      welcomeMessage="Good day. I'm here to provide professional assistance. How may I help you?"
      placeholder="Enter your inquiry..."
      className="animate-in slide-in-from-right-4 duration-300"
    />
  )
}