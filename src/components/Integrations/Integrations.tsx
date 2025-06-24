import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  Download,
  ExternalLink,
  Zap,
  Globe,
  Palette,
  Monitor,
  Smartphone,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PlatformIntegrations } from "../PlatformIntegrations";
import { motion } from "framer-motion";

export const Integrations = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "platforms" | "api" | "templates"
  >("overview");
  const [copiedReact, setCopiedReact] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState("your-bot-id-here");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

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
}`;

  // Template Integration Code
  const templateIntegrationCode = `import React, { useState } from 'react'
import { ${
    selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)
  }Chat } from './components/ChatTemplates'

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
      <${
        selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)
      }Chat
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

export default App`;

  // Complete Template Files Code
  const completeTemplateCode = `// Copy these files to your project:

// 1. components/ChatTemplates/ChatTemplate.tsx
${getTemplateFileContent()}

// 2. components/ChatTemplates/${
    selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)
  }Chat.tsx
${getSpecificTemplateContent(selectedTemplate)}

// 3. components/ChatTemplates/index.ts
export { ChatTemplate } from './ChatTemplate'
export { ModernChat } from './ModernChat'
export { MinimalChat } from './MinimalChat'
export { BubbleChat } from './BubbleChat'
export { ProfessionalChat } from './ProfessionalChat'
export { GamingChat } from './GamingChat'
export { ElegantChat } from './ElegantChat'
export { CorporateChat } from './CorporateChat'
export { HealthcareChat } from './HealthcareChat'
export { EducationChat } from './EducationChat'
export { RetailChat } from './RetailChat'`;

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
</script>`;

  const copyToClipboard = (
    text: string,
    type: "react" | "script" | "widget" | "template"
  ) => {
    navigator.clipboard.writeText(text);
    if (type === "react") {
      setCopiedReact(true);
      setTimeout(() => setCopiedReact(false), 2000);
    } else if (type === "script") {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else if (type === "widget") {
      setCopiedWidget(true);
      setTimeout(() => setCopiedWidget(false), 2000);
    } else if (type === "template") {
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function getTemplateFileContent() {
    return `// ChatTemplate.tsx - Base template component
// This is a simplified version - download the complete file for full functionality
import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader, X, Minimize2, Maximize2 } from 'lucide-react'

interface ChatTemplateProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  template?: 'modern' | 'minimal' | 'bubble' | 'professional' | 'gaming' | 'elegant' | 'corporate' | 'healthcare' | 'education' | 'retail'
  theme?: 'light' | 'dark'
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  // ... other props
}

export const ChatTemplate = (props: ChatTemplateProps) => {
  // Component implementation here
  // Download complete file for full code
}`;
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

export const ${
      template.charAt(0).toUpperCase() + template.slice(1)
    }Chat = (props: ${
      template.charAt(0).toUpperCase() + template.slice(1)
    }ChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="${template}"
      botName="${
        template.charAt(0).toUpperCase() + template.slice(1)
      } Assistant"
      welcomeMessage="Hello! I'm your ${template} AI assistant. How can I help you today?"
      placeholder="Type your message..."
    />
  )
}`;
  }

  const templates = [
    { id: "modern", name: "Modern", description: "Sleek gradient design" },
    { id: "minimal", name: "Minimal", description: "Clean and simple" },
    { id: "bubble", name: "Bubble", description: "Playful bubble style" },
    {
      id: "professional",
      name: "Professional",
      description: "Corporate focused",
    },
    { id: "corporate", name: "Corporate", description: "Enterprise grade" },
    { id: "healthcare", name: "Healthcare", description: "Medical focused" },
    { id: "education", name: "Education", description: "Learning focused" },
    { id: "retail", name: "Retail", description: "E-commerce focused" },
    { id: "gaming", name: "Gaming", description: "Gaming inspired" },
    { id: "elegant", name: "Elegant", description: "Sophisticated design" },
  ];

  const tabs = [
    { id: "overview", name: "Overview", icon: Globe },
    { id: "platforms", name: "Platform Integrations", icon: MessageSquare },
    { id: "api", name: "API & Webhooks", icon: Code },
    { id: "templates", name: "Templates & Widgets", icon: Palette },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-6 font-sans"
    >
      {/* Header */}
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
          Integrations & Templates
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Complete integration solution with beautiful, production-ready chat
          templates and platform connectors.
        </p>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-gray-200 dark:border-gray-800"
      >
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2 inline" />
              {tab.name}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8 mt-8"
        >
          {/* Quick Navigation */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-gray-900/90 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-6 shadow-card"
          >
            <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-3">
              Quick Start Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("platforms")}
                className="p-4 bg-white dark:bg-gray-800/90 border border-primary-100 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group shadow-subtle"
              >
                <div className="flex items-center mb-2">
                  <MessageSquare className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
                  <h4 className="font-semibold text-primary-800 dark:text-primary-200">
                    Platform Integrations
                  </h4>
                </div>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Connect with Slack, Discord, WordPress, Shopify & more
                </p>
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 bg-white dark:bg-gray-800/90 border border-primary-100 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group shadow-subtle"
              >
                <Link to="/templates" className="block">
                  <div className="flex items-center mb-2">
                    <Palette className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
                    <h4 className="font-semibold text-primary-800 dark:text-primary-200">
                      Browse Templates
                    </h4>
                  </div>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Explore our template gallery with live previews
                  </p>
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("api")}
                className="p-4 bg-white dark:bg-gray-800/90 border border-primary-100 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group shadow-subtle"
              >
                <div className="flex items-center mb-2">
                  <Code className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
                  <h4 className="font-semibold text-primary-800 dark:text-primary-200">
                    API & Webhooks
                  </h4>
                </div>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Programmatic access and webhook integrations
                </p>
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 bg-white dark:bg-gray-800/90 border border-primary-100 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group shadow-subtle"
              >
                <Link to="/wizard" className="block">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
                    <h4 className="font-semibold text-primary-800 dark:text-primary-200">
                      Setup Wizard
                    </h4>
                  </div>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Step-by-step integration guide
                  </p>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Integration Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                color: "text-blue-500 dark:text-blue-400",
                bg: "bg-blue-100 dark:bg-blue-900/20",
                value: "6+",
                title: "Platform Integrations",
                description: "Slack, Discord, WordPress, Shopify & more",
              },
              {
                icon: Palette,
                color: "text-purple-500 dark:text-purple-400",
                bg: "bg-purple-100 dark:bg-purple-900/20",
                value: "10",
                title: "Chat Templates",
                description: "Industry-specific designs",
              },
              {
                icon: Globe,
                color: "text-green-500 dark:text-green-400",
                bg: "bg-green-100 dark:bg-green-900/20",
                value: "100%",
                title: "Framework Compatible",
                description: "React, Vue, Angular & more",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 text-center"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 ${stat.bg} rounded-full mx-auto mb-4`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                title: "🚀 React Templates",
                icon: Palette,
                features: [
                  "10 beautiful pre-built templates",
                  "Industry-specific designs (Healthcare, Education, Retail, etc.)",
                  "Light & dark theme support",
                  "Fully responsive design",
                  "TypeScript support",
                ],
              },
              {
                title: "🌐 Universal Widget",
                icon: Globe,
                features: [
                  "Works with any framework",
                  "No build process required",
                  "Template style selection",
                  "Auto-positioning options",
                  "Customizable colors & themes",
                ],
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {item.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Other tabs (API, Templates) - for brevity, only the structure is shown */}
      {activeTab === "platforms" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PlatformIntegrations />
        </motion.div>
      )}

      {activeTab === "api" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 mt-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-1">
                API & Webhook Integration
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Programmatic access to your chatbots with comprehensive API
                endpoints and webhook support.{" "}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🔗 REST API
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <li className="flex items-center">
                  <Code className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  5 core endpoints covering all functionality
                </li>
                <li className="flex items-center">
                  <Code className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  Secure API key authentication
                </li>
                <li className="flex items-center">
                  <Code className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  Rate limiting with configurable thresholds
                </li>
                <li className="flex items-center">
                  <Code className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  Comprehensive error handling
                </li>
              </ul>
              <Link
                to="/api"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View API Documentation
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🔔 Webhooks
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  Real-time event notifications
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  Message and conversation events
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  Secure webhook verification
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  Retry mechanism for failed deliveries
                </li>
              </ul>
              {/* <button className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm font-medium">
                <Settings className="h-4 w-4 mr-1" />
                Configure Webhooks
              </button> */}
              <Link
                to="/webhook"
                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm font-medium"
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure Webhooks
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}

      {activeTab === "templates" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10 mt-8"
        >
          {/* Configuration */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 "
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Bot ID
                </label>
                <input
                  type="text"
                  value={selectedBotId}
                  onChange={(e) => setSelectedBotId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600"
                  placeholder="Enter your bot ID"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Template Style
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Integration Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* React Template Integration */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-t-2xl">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-primary-500 dark:bg-primary-600 rounded-lg flex items-center justify-center">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      React Templates
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Beautiful UI components with full customization
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    ✨ Features
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      10 beautiful pre-built templates
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      Light & dark theme support
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      Fully responsive design
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      TypeScript support
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      Customizable animations
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      🚀 Quick Setup
                    </h4>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          copyToClipboard(templateIntegrationCode, "template")
                        }
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded"
                      >
                        {copiedTemplate ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copiedTemplate ? "Copied!" : "Copy"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          downloadFile(
                            completeTemplateCode,
                            `${selectedTemplate}-chat-template.tsx`
                          )
                        }
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </motion.button>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono max-h-64 overflow-y-auto">
                    <pre>{templateIntegrationCode}</pre>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Universal Script Tag */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-2xl">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Universal Widget
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Works with any framework or vanilla HTML
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    ✨ Features
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      Works with any framework
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      No build process required
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      Template style selection
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      Auto-positioning options
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                      Customizable colors & themes
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      📋 Installation
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => copyToClipboard(scriptCode, "script")}
                      className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded"
                    >
                      {copiedScript ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copiedScript ? "Copied!" : "Copy"}
                    </motion.button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono">
                    <pre>{scriptCode}</pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Headless Hook Integration */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Headless Hook Integration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For developers who want complete UI control
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      📁 useChatbot.ts
                    </h4>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => copyToClipboard(reactHookCode, "react")}
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded"
                      >
                        {copiedReact ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copiedReact ? "Copied!" : "Copy"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          downloadFile(reactHookCode, "useChatbot.ts")
                        }
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </motion.button>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono max-h-64 overflow-y-auto">
                    <pre>{reactHookCode}</pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    🎯 Use Cases
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2" />
                      Custom UI design requirements
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2" />
                      Integration with existing design systems
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2" />
                      Advanced state management needs
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-2" />
                      Custom analytics and tracking
                    </li>
                  </ul>

                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    📋 Quick Usage
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono">
                    <pre>{`const { messages, sendMessage, isLoading } = useChatbot({
  botId: '${selectedBotId}',
  apiUrl: 'https://your-api.supabase.co/functions/v1',
  apiKey: 'your-api-key'
})`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Framework Compatibility */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Framework Compatibility
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: "React", supported: "Templates + Hook" },
                  { name: "Vue.js", supported: "Script Tag" },
                  { name: "Angular", supported: "Script Tag" },
                  { name: "Svelte", supported: "Script Tag" },
                  { name: "Vanilla JS", supported: "Script Tag" },
                  { name: "WordPress", supported: "Script Tag" },
                  { name: "Shopify", supported: "Script Tag" },
                  { name: "Webflow", supported: "Script Tag" },
                  { name: "Squarespace", supported: "Script Tag" },
                  { name: "Wix", supported: "Script Tag" },
                  { name: "Next.js", supported: "Templates + Hook" },
                  { name: "Gatsby", supported: "Templates + Hook" },
                ].map((framework) => (
                  <motion.div
                    key={framework.name}
                    whileHover={{ scale: 1.03 }}
                    className="text-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {framework.name}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✅ {framework.supported}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Responsive Design Info */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-6 shadow-card"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Monitor className="h-6 w-6 text-primary-500 dark:text-primary-400 mt-1" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200">
                  Production Ready Features
                </h3>
                <p className="text-primary-700 dark:text-primary-300 mt-1 mb-4">
                  All templates and integrations are built for production use.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-primary-600 dark:text-primary-400">
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
          </motion.div>

          {/* Documentation Links */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Documentation & Support
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200 group"
                >
                  <Link to="/templates" className="block">
                    <div className="flex items-center mb-3">
                      <Palette className="h-6 w-6 text-primary-500 dark:text-primary-400 mr-3 group-hover:text-primary-700" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Template Gallery
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Browse and preview all available chat templates with live
                      demos
                    </p>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200 group"
                >
                  <Link to="/api" className="block">
                    <div className="flex items-center mb-3">
                      <Code className="h-6 w-6 text-green-600 dark:text-green-400 mr-3 group-hover:text-green-700" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        API Documentation
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete API reference and integration guidelines
                    </p>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200 group"
                >
                  <Link to="/wizard" className="block">
                    <div className="flex items-center mb-3">
                      <ExternalLink className="h-6 w-6 text-accent-500 dark:text-accent-400 mr-3 group-hover:text-accent-700" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Setup Wizard
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Step-by-step integration guide for all platforms
                    </p>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
