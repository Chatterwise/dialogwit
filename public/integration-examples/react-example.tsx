import React, { useState, useRef, useEffect } from 'react'
import { useChatbot } from '../useChatbot'

// Example 1: Basic Chat Interface
export function BasicChatInterface() {
  const { messages, sendMessage, isLoading, error } = useChatbot({
    botId: 'your-bot-id-here',
    apiUrl: 'https://your-api.supabase.co/functions/v1',
    apiKey: 'your-api-key-here'
  })

  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-semibold">AI Assistant</h3>
        <p className="text-sm opacity-90">Ask me anything!</p>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            {/* Bot Response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                {msg.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-800">{msg.response}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-600">Error: {error}</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Example 2: Advanced Chat with Features
export function AdvancedChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error, 
    clearMessages,
    retryLastMessage 
  } = useChatbot({
    botId: 'your-bot-id-here',
    apiUrl: 'https://your-api.supabase.co/functions/v1',
    apiKey: 'your-api-key-here',
    onMessageSent: (message) => console.log('Message sent:', message),
    onResponseReceived: (response) => console.log('Response received:', response),
    onError: (error) => console.error('Chat error:', error)
  })

  const [input, setInput] = useState('')

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  const quickReplies = [
    "Hello!",
    "How can you help me?",
    "What are your features?",
    "Thank you"
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        💬
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-sm opacity-90">Online</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={clearMessages}
            className="text-white hover:bg-blue-700 p-1 rounded"
            title="Clear chat"
          >
            🗑️
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700 p-1 rounded"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">👋 Hello! How can I help you today?</p>
            <div className="mt-4 space-y-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(reply)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs text-sm">
                {msg.message}
              </div>
            </div>
            
            {/* Bot Response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 p-2 rounded-lg max-w-xs text-sm">
                {msg.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">💭</div>
                    <span>Thinking...</span>
                  </div>
                ) : (
                  msg.response
                )}
              </div>
            </div>
          </div>
        ))}
        
        {error && (
          <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
            <p className="text-xs text-red-600 mb-2">Error: {error}</p>
            <button
              onClick={retryLastMessage}
              className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
            >
              Retry
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

// Example 3: Minimal Inline Chat
export function InlineChatInterface() {
  const { messages, sendMessage, isLoading } = useChatbot({
    botId: 'your-bot-id-here',
    apiUrl: 'https://your-api.supabase.co/functions/v1',
    apiKey: 'your-api-key-here'
  })

  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="border rounded-lg p-4 max-w-lg">
      <h3 className="font-semibold mb-3">Ask our AI Assistant</h3>
      
      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div className="text-sm">
              <strong>You:</strong> {msg.message}
            </div>
            <div className="text-sm text-gray-600">
              <strong>AI:</strong> {msg.isLoading ? 'Thinking...' : msg.response}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  )
}