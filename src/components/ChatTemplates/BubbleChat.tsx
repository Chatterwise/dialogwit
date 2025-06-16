import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface BubbleChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const BubbleChat = (props: BubbleChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="bubble"
      botName="Bubble Bot"
      welcomeMessage="💬 Hey! I'm your friendly bubble assistant. What's on your mind?"
      placeholder="Share your thoughts..."
      className="animate-in zoom-in-95 duration-300"
    />
  )
}