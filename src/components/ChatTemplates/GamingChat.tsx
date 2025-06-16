import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface GamingChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const GamingChat = (props: GamingChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="gaming"
      botName="Game Master"
      welcomeMessage="🎮 Welcome, player! Ready to level up your experience? What can I help you with?"
      placeholder="Enter command..."
      className="animate-in slide-in-from-bottom-8 duration-500"
    />
  )
}