import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface EducationChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const EducationChat = (props: EducationChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="education"
      botName="Learning Assistant"
      welcomeMessage="📚 Welcome to your learning companion! I'm here to help you explore, understand, and master new concepts. What would you like to learn about today?"
      placeholder="Ask me anything to learn..."
      className="animate-in zoom-in-95 duration-300"
    />
  )
}