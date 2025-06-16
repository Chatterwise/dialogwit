import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader, X, Minimize2, Maximize2, Settings, MoreVertical } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isLoading?: boolean
}

interface ChatTemplateProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  template?: 'modern' | 'minimal' | 'bubble' | 'professional' | 'gaming' | 'elegant'
  theme?: 'light' | 'dark' | 'auto'
  primaryColor?: string
  botName?: string
  botAvatar?: string
  welcomeMessage?: string
  placeholder?: string
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'fullscreen'
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  className?: string
}

export const ChatTemplate = ({
  botId,
  apiUrl = '/api',
  apiKey,
  template = 'modern',
  theme = 'light',
  primaryColor = '#3B82F6',
  botName = 'AI Assistant',
  botAvatar,
  welcomeMessage = 'Hello! How can I help you today?',
  placeholder = 'Type your message...',
  position = 'bottom-right',
  isOpen = false,
  onToggle,
  className = ''
}: ChatTemplateProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const baseStyles = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white'
  }

  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      setMessages([{
        id: '1',
        text: welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      }])
    }
  }, [welcomeMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

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
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
          botId,
          message: inputValue
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? { ...msg, text: data.response, isLoading: false }
            : msg
        )
      )
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingMessage.id
            ? { ...msg, text: 'Sorry, I encountered an error. Please try again.', isLoading: false }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getTemplateStyles = () => {
    const templates = {
      modern: {
        container: `rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`,
        header: `bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl`,
        message: {
          user: `bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md`,
          bot: `${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl rounded-bl-md`
        }
      },
      minimal: {
        container: `rounded-lg shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`,
        header: `${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-t-lg`,
        message: {
          user: `bg-blue-500 text-white rounded-lg`,
          bot: `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`
        }
      },
      bubble: {
        container: `rounded-3xl shadow-xl border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`,
        header: `bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-3xl`,
        message: {
          user: `bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-6 py-3`,
          bot: `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full px-6 py-3`
        }
      },
      professional: {
        container: `rounded-lg shadow-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`,
        header: `${theme === 'dark' ? 'bg-gray-800' : 'bg-slate-800'} text-white rounded-t-lg`,
        message: {
          user: `bg-slate-700 text-white rounded-lg`,
          bot: `${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-100'} rounded-lg`
        }
      },
      gaming: {
        container: `rounded-xl shadow-2xl border-2 border-green-500 bg-gradient-to-b ${theme === 'dark' ? 'from-gray-900 to-black' : 'from-gray-100 to-white'}`,
        header: `bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl`,
        message: {
          user: `bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg border border-green-400`,
          bot: `${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded-lg border`
        }
      },
      elegant: {
        container: `rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-purple-500' : 'border-purple-200'} bg-gradient-to-b ${theme === 'dark' ? 'from-purple-900 to-gray-900' : 'from-purple-50 to-white'}`,
        header: `bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl`,
        message: {
          user: `bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl`,
          bot: `${theme === 'dark' ? 'bg-purple-800/30 border-purple-500' : 'bg-purple-100 border-purple-200'} rounded-2xl border`
        }
      }
    }

    return templates[template]
  }

  const styles = getTemplateStyles()

  if (!isOpen) return null

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50'
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'
      case 'fullscreen':
        return 'fixed inset-4 z-50'
      default:
        return 'fixed bottom-4 right-4 z-50'
    }
  }

  const getContainerSize = () => {
    if (position === 'fullscreen') return 'w-full h-full'
    if (position === 'center') return 'w-96 h-[600px]'
    return isMinimized ? 'w-80 h-16' : 'w-80 h-[500px]'
  }

  return (
    <div className={`${getPositionStyles()} ${getContainerSize()} ${className}`}>
      <div className={`${baseStyles[theme]} ${styles.container} h-full flex flex-col overflow-hidden transition-all duration-300`}>
        {/* Header */}
        <div className={`${styles.header} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            {botAvatar ? (
              <img src={botAvatar} alt={botName} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm">{botName}</h3>
              <p className="text-xs opacity-90">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onToggle?.(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-sm px-4 py-2 ${styles.message[message.sender]}`}>
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <span className="text-xs opacity-75 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}