import React, { useState } from 'react'
import { Code, Copy, Check, Download, ExternalLink, Zap, Globe, Palette, Monitor, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Integrations = () => {
  const [copiedReact, setCopiedReact] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)
  const [copiedWidget, setCopiedWidget] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [selectedBotId, setSelectedBotId] = useState('your-bot-id-here')
  const [selectedTemplate, setSelectedTemplate] = useState('modern')

  // React Hook Code
  const reactHookCode = `import { useState, useCallback } from 'react'

interface ChatMessage {
  id: string
  message: string
  response: string
  timestamp: Date
  isLoading?: boolean
}

interface UseChatbotOptions {
  botId: string
  apiUrl?: string
  apiKey?: string
  onError?: (error: string) => void
  onMessageSent?: (message: string) => void
  onResponseReceived?: (response: string) => void
}

interface UseChatbotReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
  retryLastMessage: () => Promise<void>
}

export const useChatbot = ({
  botId,
  apiUrl = 'https://your-api.supabase.co/functions/v1',
  apiKey = 'YOUR_API_KEY',
  onError,
  onMessageSent,
  onResponseReceived
}: UseChatbotOptions): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string>('')

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return

    const messageId = Date.now().toString()
    const userMessage: ChatMessage = {
      id: messageId,
      message,
      response: '',
      timestamp: new Date(),
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage])
    setLastMessage(message)
    setIsLoading(true)
    setError(null)
    
    onMessageSent?.(message)

    try {
      const response = await fetch(\`\${apiUrl}/chat\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiKey}\`,
        },
        body: JSON.stringify({
          botId,
          message,
          userIp: 'react-client'
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(\`HTTP error! status: \${response.status}, message: \${errorText}\`)
      }

      const data = await response.json()
      
      if (!data.response) {
        throw new Error('Invalid response format from server')
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, response: data.response, isLoading: false }
            : msg
        )
      )
      
      onResponseReceived?.(data.response)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { 
                ...msg, 
                response: 'Sorry, I encountered an error. Please try again.', 
                isLoading: false 
              }
            : msg
        )
      )
      
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [botId, apiUrl, apiKey, isLoading, onError, onMessageSent, onResponseReceived])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setLastMessage('')
  }, [])

  const retryLastMessage = useCallback(async () => {
    if (lastMessage && !isLoading) {
      setMessages(prev => prev.slice(0, -1))
      await sendMessage(lastMessage)
    }
  }, [lastMessage, isLoading, sendMessage])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage
  }
}`

  // Template Integration Code
  const templateIntegrationCode = `import React, { useState } from 'react'
import { ${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}Chat } from './components/ChatTemplates'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your app content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to My App
        </h1>
        <p className="text-gray-600 mb-6">
          This is your main application content.
        </p>
        
        {/* Chat trigger button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
        >
          💬
        </button>
      </div>

      {/* Chat Template */}
      <${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}Chat
        botId="${selectedBotId}"
        apiUrl="https://your-api.supabase.co/functions/v1"
        apiKey="your-api-key"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        theme="light"
      />
    </div>
  )
}

export default App`

  // Complete Template Files Code
  const completeTemplateCode = `// Copy these files to your project:

// 1. components/ChatTemplates/ChatTemplate.tsx
${getTemplateFileContent()}

// 2. components/ChatTemplates/${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}Chat.tsx
${getSpecificTemplateContent(selectedTemplate)}

// 3. components/ChatTemplates/index.ts
export { ChatTemplate } from './ChatTemplate'
export { ModernChat } from './ModernChat'
export { MinimalChat } from './MinimalChat'
export { BubbleChat } from './BubbleChat'
export { ProfessionalChat } from './ProfessionalChat'
export { GamingChat } from './GamingChat'
export { ElegantChat } from './ElegantChat'`

  // Script Tag Code
  const scriptCode = `<!-- Add this script tag to your HTML -->
<script 
  src="https://your-domain.com/chatbot-widget.js" 
  data-bot-id="${selectedBotId}"
  data-api-url="https://your-api.supabase.co/functions/v1"
  data-api-key="your-api-key"
  data-theme="light"
  data-position="bottom-right"
  data-primary-color="#3B82F6"
  data-template="${selectedTemplate}"
  async>
</script>`

  const copyToClipboard = (text: string, type: 'react' | 'script' | 'widget' | 'template') => {
    navigator.clipboard.writeText(text)
    if (type === 'react') {
      setCopiedReact(true)
      setTimeout(() => setCopiedReact(false), 2000)
    } else if (type === 'script') {
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 2000)
    } else if (type === 'widget') {
      setCopiedWidget(true)
      setTimeout(() => setCopiedWidget(false), 2000)
    } else if (type === 'template') {
      setCopiedTemplate(true)
      setTimeout(() => setCopiedTemplate(false), 2000)
    }
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function getTemplateFileContent() {
    return `// ChatTemplate.tsx - Base template component
// This is a simplified version - download the complete file for full functionality
import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader, X, Minimize2, Maximize2 } from 'lucide-react'

interface ChatTemplateProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  template?: 'modern' | 'minimal' | 'bubble' | 'professional' | 'gaming' | 'elegant'
  theme?: 'light' | 'dark'
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  // ... other props
}

export const ChatTemplate = (props: ChatTemplateProps) => {
  // Component implementation here
  // Download complete file for full code
}`
  }

  function getSpecificTemplateContent(template: string) {
    return `import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface ${template.charAt(0).toUpperCase() + template.slice(1)}ChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const ${template.charAt(0).toUpperCase() + template.slice(1)}Chat = (props: ${template.charAt(0).toUpperCase() + template.slice(1)}ChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="${template}"
      botName="${template.charAt(0).toUpperCase() + template.slice(1)} Assistant"
      welcomeMessage="Hello! I'm your ${template} AI assistant. How can I help you today?"
      placeholder="Type your message..."
    />
  )
}`
  }

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Sleek gradient design' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
    { id: 'bubble', name: 'Bubble', description: 'Playful bubble style' },
    { id: 'professional', name: 'Professional', description: 'Corporate focused' },
    { id: 'gaming', name: 'Gaming', description: 'Gaming inspired' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated design' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chatbot Integration & Templates</h1>
        <p className="text-gray-600 mt-2">
          Complete integration solution with beautiful, production-ready chat templates.
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Quick Start Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/templates"
            className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center mb-2">
              <Palette className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Browse Templates</h4>
            </div>
            <p className="text-sm text-blue-700">Explore our template gallery with live previews</p>
          </Link>
          
          <div className="p-4 bg-white border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Code className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">React Integration</h4>
            </div>
            <p className="text-sm text-blue-700">Headless UI components for React apps</p>
          </div>
          
          <div className="p-4 bg-white border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Globe className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Universal Widget</h4>
            </div>
            <p className="text-sm text-blue-700">Script tag for any framework</p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bot ID
            </label>
            <input
              type="text"
              value={selectedBotId}
              onChange={(e) => setSelectedBotId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your bot ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Style
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Integration Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* React Template Integration */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Palette className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">React Templates</h3>
                <p className="text-sm text-gray-600">Beautiful UI components with full customization</p>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">✨ Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  6 beautiful pre-built templates
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Light & dark theme support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Fully responsive design
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  TypeScript support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Customizable animations
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">🚀 Quick Setup</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(templateIntegrationCode, 'template')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                  >
                    {copiedTemplate ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copiedTemplate ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => downloadFile(completeTemplateCode, `${selectedTemplate}-chat-template.tsx`)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono max-h-64 overflow-y-auto">
                <pre>{templateIntegrationCode}</pre>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">📦 Installation Steps</h4>
                <Link
                  to="/templates"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-500 px-2 py-1 rounded"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Gallery
                </Link>
              </div>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                  <div>
                    <strong>Download templates:</strong> Get the template files from the gallery or copy the code above
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                  <div>
                    <strong>Install dependencies:</strong> <code className="bg-gray-100 px-1 rounded">npm install lucide-react</code>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                  <div>
                    <strong>Configure API:</strong> Update your bot ID and API endpoints
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                  <div>
                    <strong>Import & use:</strong> Add the template component to your app
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Universal Script Tag */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">Universal Widget</h3>
                <p className="text-sm text-gray-600">Works with any framework or vanilla HTML</p>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">✨ Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Works with any framework
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  No build process required
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Template style selection
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Auto-positioning options
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Customizable colors & themes
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">📋 Installation</h4>
                <button
                  onClick={() => copyToClipboard(scriptCode, 'script')}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                >
                  {copiedScript ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copiedScript ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono">
                <pre>{scriptCode}</pre>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">⚙️ Configuration Options</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">data-template</code>
                  <span>modern, minimal, bubble, professional, gaming, elegant</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">data-theme</code>
                  <span>light, dark, auto</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">data-position</code>
                  <span>bottom-right, bottom-left, center, fullscreen</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">data-primary-color</code>
                  <span>Any hex color (e.g., #3B82F6)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">🚀 Setup Steps</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                  <div>
                    <strong>Host the widget:</strong> Upload chatbot-widget.js to your server
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                  <div>
                    <strong>Add script tag:</strong> Include the script with your configuration
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                  <div>
                    <strong>Configure API:</strong> Update bot ID and API endpoints
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                  <div>
                    <strong>Customize:</strong> Adjust template, colors, and position
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Headless Hook Integration */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Headless Hook Integration</h3>
          <p className="text-sm text-gray-600">For developers who want complete UI control</p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">📁 useChatbot.ts</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(reactHookCode, 'react')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                  >
                    {copiedReact ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copiedReact ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => downloadFile(reactHookCode, 'useChatbot.ts')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono max-h-64 overflow-y-auto">
                <pre>{reactHookCode}</pre>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">🎯 Use Cases</h4>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                  Custom UI design requirements
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                  Integration with existing design systems
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                  Advanced state management needs
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                  Custom analytics and tracking
                </li>
              </ul>
              
              <h4 className="text-sm font-medium text-gray-900 mb-3">📋 Quick Usage</h4>
              <div className="bg-gray-100 rounded-lg p-3 text-sm font-mono">
                <pre>{`const { messages, sendMessage, isLoading } = useChatbot({
  botId: '${selectedBotId}',
  apiUrl: 'https://your-api.supabase.co/functions/v1',
  apiKey: 'your-api-key'
})`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Compatibility */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Framework Compatibility</h3>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'React', supported: 'Templates + Hook' },
              { name: 'Vue.js', supported: 'Script Tag' },
              { name: 'Angular', supported: 'Script Tag' },
              { name: 'Svelte', supported: 'Script Tag' },
              { name: 'Vanilla JS', supported: 'Script Tag' },
              { name: 'WordPress', supported: 'Script Tag' },
              { name: 'Shopify', supported: 'Script Tag' },
              { name: 'Webflow', supported: 'Script Tag' },
              { name: 'Squarespace', supported: 'Script Tag' },
              { name: 'Wix', supported: 'Script Tag' },
              { name: 'Next.js', supported: 'Templates + Hook' },
              { name: 'Gatsby', supported: 'Templates + Hook' }
            ].map((framework) => (
              <div key={framework.name} className="text-center p-3 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-900 text-sm">{framework.name}</div>
                <div className="text-xs text-green-600 mt-1">✅ {framework.supported}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Design Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Monitor className="h-6 w-6 text-blue-600 mt-1" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">Production Ready Features</h3>
            <p className="text-blue-700 mt-1 mb-4">
              All templates and integrations are built with production requirements in mind.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-600">
              <div className="flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                Responsive Design
              </div>
              <div className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Optimized
              </div>
              <div className="flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Theme Support
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Performance Optimized
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Documentation & Support</h3>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/templates"
              className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center mb-3">
                <Palette className="h-6 w-6 text-blue-600 mr-3 group-hover:text-blue-700" />
                <h4 className="text-lg font-medium text-gray-900">Template Gallery</h4>
              </div>
              <p className="text-sm text-gray-600">
                Browse and preview all available chat templates with live demos
              </p>
            </Link>
            
            <a
              href="#"
              className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center mb-3">
                <Code className="h-6 w-6 text-green-600 mr-3 group-hover:text-green-700" />
                <h4 className="text-lg font-medium text-gray-900">Code Examples</h4>
              </div>
              <p className="text-sm text-gray-600">
                Complete implementation examples for all supported frameworks
              </p>
            </a>
            
            <a
              href="#"
              className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center mb-3">
                <ExternalLink className="h-6 w-6 text-purple-600 mr-3 group-hover:text-purple-700" />
                <h4 className="text-lg font-medium text-gray-900">API Documentation</h4>
              </div>
              <p className="text-sm text-gray-600">
                Complete API reference and integration guidelines
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}