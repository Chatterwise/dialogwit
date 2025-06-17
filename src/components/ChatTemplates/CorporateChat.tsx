import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface CorporateChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const CorporateChat = (props: CorporateChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="corporate"
      botName="Corporate Assistant"
      welcomeMessage="Good day. I'm here to assist you with your business inquiries. How may I help you today?"
      placeholder="Enter your business inquiry..."
      className="animate-in slide-in-from-bottom-4 duration-300"
    />
  )
}