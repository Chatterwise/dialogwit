import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader } from 'lucide-react'
import { useSendMessage } from '../hooks/useChatMessages'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isLoading?: boolean
}

export const ChatPreview = ({ botId }: { botId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const sendMessage = useSendMessage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || !botId || sendMessage.isPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const response = await sendMessage.mutateAsync({
        chatbotId: botId,
        message: inputValue
      })

      // Replace loading message with actual response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? { ...msg, text: response.response, isLoading: false }
            : msg
        )
      )
    } catch (error) {
      // Replace loading message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? { ...msg, text: 'Sorry, I encountered an error. Please try again.', isLoading: false }
            : msg
        )
      )
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 h-96 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Chat Preview</h3>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start">
                {message.sender === 'bot' && (
                  <Bot className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {message.isLoading ? (
                    <div className="flex items-center space-x-1">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  )}
                  <span className="text-xs opacity-75 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <User className="h-4 w-4 ml-2 mt-0.5 text-white flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sendMessage.isPending || !botId}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sendMessage.isPending || !botId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {sendMessage.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        {!botId && (
          <p className="text-xs text-gray-500 mt-2">
            Chat preview is only available for saved chatbots
          </p>
        )}
      </div>
    </div>
  )
}