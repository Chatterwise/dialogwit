import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Bot, User, Loader, MessageCircle, Minimize2, Maximize2 } from 'lucide-react'
import { useChatbot } from '../hooks/useChatbots'
import { useSendMessage } from '../hooks/useChatMessages'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isLoading?: boolean
}

export const PublicChat = () => {
  const { botId } = useParams<{ botId: string }>()
  const { data: chatbot, isLoading: chatbotLoading } = useChatbot(botId || '')
  const sendMessage = useSendMessage()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (chatbot) {
      setMessages([
        {
          id: '1',
          text: `Hello! I'm ${chatbot.name}. ${chatbot.description} How can I help you today?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ])
    }
  }, [chatbot])

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

  if (chatbotLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chatbot...</p>
        </div>
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chatbot Not Found</h1>
          <p className="text-gray-600">The chatbot you're looking for doesn't exist or isn't available.</p>
        </div>
      </div>
    )
  }

  if (chatbot.status !== 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chatbot Not Ready</h1>
          <p className="text-gray-600">This chatbot is still being processed. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{chatbot.name}</h1>
                <p className="text-sm text-gray-600">{chatbot.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Chat with {chatbot.name}</h3>
              </div>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 h-[480px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
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
                            <div className="flex items-center space-x-2">
                              <Loader className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          )}
                          <span className="text-xs opacity-75 mt-2 block">
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
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={sendMessage.isPending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sendMessage.isPending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                  >
                    {sendMessage.isPending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by {chatbot.name} • Press Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          This chatbot is powered by AI and trained on custom knowledge base
        </p>
      </div>
    </div>
  )
}