import React, { useState } from "react";
import {
  Code,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Palette,
  Zap,
  Settings,
  ExternalLink,
  Bot,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import { motion } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

export const InstallationWizard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: chatbots = [], isLoading: chatbotsLoading } = useChatbots(
    user?.id || ""
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    framework: "",
    template: "modern",
    theme: "light",
    position: "bottom-right",
    botId: "",
    apiUrl: import.meta.env.VITE_SUPABASE_URL
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
      : "https://your-api.supabase.co/functions/v1",
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "your-api-key",
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTemplateCode, setCopiedTemplateCode] = useState(false);
  const [copiedBaseTemplateCode, setCopiedBaseTemplateCode] = useState(false);

  const steps: WizardStep[] = [
    {
      id: "framework",
      title: t(
        "installationWizard.steps.framework.title",
        "Choose Your Framework"
      ),
      description: t(
        "installationWizard.steps.framework.desc",
        "Select the framework or platform you're using"
      ),
    },
    {
      id: "template",
      title: t(
        "installationWizard.steps.template.title",
        "Select Template Style"
      ),
      description: t(
        "installationWizard.steps.template.desc",
        "Choose a chat template that matches your design"
      ),
    },
    {
      id: "configuration",
      title: t(
        "installationWizard.steps.configuration.title",
        "Configure Settings"
      ),
      description: t(
        "installationWizard.steps.configuration.desc",
        "Select your chatbot and configure settings"
      ),
    },
    {
      id: "installation",
      title: t(
        "installationWizard.steps.installation.title",
        "Installation Code"
      ),
      description: t(
        "installationWizard.steps.installation.desc",
        "Copy the generated code to your project"
      ),
    },
  ];

  const frameworks = [
    {
      id: "react",
      name: t("installationWizard.frameworks.react.name", "React / Next.js"),
      description: t(
        "installationWizard.frameworks.react.desc",
        "Use beautiful template components"
      ),
      icon: "⚛️",
      type: "template" as const,
    },
    {
      id: "vue",
      name: t("installationWizard.frameworks.vue.name", "Vue.js"),
      description: t(
        "installationWizard.frameworks.vue.desc",
        "Universal script tag integration"
      ),
      icon: "💚",
      type: "script" as const,
    },
    {
      id: "angular",
      name: t("installationWizard.frameworks.angular.name", "Angular"),
      description: t(
        "installationWizard.frameworks.angular.desc",
        "Universal script tag integration"
      ),
      icon: "🅰️",
      type: "script" as const,
    },
    {
      id: "svelte",
      name: t("installationWizard.frameworks.svelte.name", "Svelte"),
      description: t(
        "installationWizard.frameworks.svelte.desc",
        "Universal script tag integration"
      ),
      icon: "🧡",
      type: "script" as const,
    },
    {
      id: "vanilla",
      name: t("installationWizard.frameworks.vanilla.name", "Vanilla JS"),
      description: t(
        "installationWizard.frameworks.vanilla.desc",
        "Pure JavaScript integration"
      ),
      icon: "🟨",
      type: "script" as const,
    },
    {
      id: "wordpress",
      name: t("installationWizard.frameworks.wordpress.name", "WordPress"),
      description: t(
        "installationWizard.frameworks.wordpress.desc",
        "Plugin or theme integration"
      ),
      icon: "📝",
      type: "script" as const,
    },
    {
      id: "shopify",
      name: t("installationWizard.frameworks.shopify.name", "Shopify"),
      description: t(
        "installationWizard.frameworks.shopify.desc",
        "Theme liquid template"
      ),
      icon: "🛍️",
      type: "script" as const,
    },
    {
      id: "other",
      name: t("installationWizard.frameworks.other.name", "Other"),
      description: t(
        "installationWizard.frameworks.other.desc",
        "Any other platform"
      ),
      icon: "🌐",
      type: "script" as const,
    },
  ];

  const templates = [
    {
      id: "modern",
      name: t("installationWizard.templates.modern.name", "Modern"),
      description: t(
        "installationWizard.templates.modern.desc",
        "Sleek gradient design with rounded corners"
      ),
      preview: "bg-gradient-to-r from-blue-500 to-purple-500",
    },
    {
      id: "minimal",
      name: t("installationWizard.templates.minimal.name", "Minimal"),
      description: t(
        "installationWizard.templates.minimal.desc",
        "Clean and simple interface"
      ),
      preview: "bg-gray-100 border border-gray-300",
    },
    {
      id: "bubble",
      name: t("installationWizard.templates.bubble.name", "Bubble"),
      description: t(
        "installationWizard.templates.bubble.desc",
        "Playful bubble-style messages"
      ),
      preview: "bg-gradient-to-r from-pink-400 to-rose-400",
    },
    {
      id: "professional",
      name: t(
        "installationWizard.templates.professional.name",
        "Professional"
      ),
      description: t(
        "installationWizard.templates.professional.desc",
        "Corporate and business-focused"
      ),
      preview: "bg-slate-700",
    },
    {
      id: "gaming",
      name: t("installationWizard.templates.gaming.name", "Gaming"),
      description: t(
        "installationWizard.templates.gaming.desc",
        "Gaming-inspired with neon accents"
      ),
      preview: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      id: "elegant",
      name: t("installationWizard.templates.elegant.name", "Elegant"),
      description: t(
        "installationWizard.templates.elegant.desc",
        "Sophisticated and refined"
      ),
      preview: "bg-gradient-to-r from-purple-500 to-indigo-500",
    },
  ];

  const generateCode = () => {
    const framework = frameworks.find((f) => f.id === selections.framework);
    if (framework?.type === "template") {
      return generateReactCode();
    } else {
      return generateScriptCode();
    }
  };

  const generateReactCode = () => {
    const templateName =
      selections.template.charAt(0).toUpperCase() + selections.template.slice(1);
    const selectedBot = chatbots.find((bot) => bot.id === selections.botId);

    return `import React, { useState } from 'react'
import { ${templateName}Chat } from './components/ChatTemplates'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Your app content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to My App
        </h1>
        
        {/* Chat trigger button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center z-40"
        >
          💬
        </button>
      </div>

      {/* Chat Template */}
      <${templateName}Chat
        botId="${selections.botId}"
        apiUrl="${selections.apiUrl}"
        apiKey="${selections.apiKey}"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        theme="${selections.theme}"
        position="${selections.position}"${
      selectedBot
        ? `
        botName="${selectedBot.name}"
        welcomeMessage="Hello! I'm ${selectedBot.name}. ${selectedBot.description} How can I help you today?"`
        : ""
    }
      />
    </div>
  )
}

export default App`;
  };

  const generateScriptCode = () => {
    const selectedBot = chatbots.find((bot) => bot.id === selections.botId);
    const scriptSrc = `${window.location.origin}/chatbot-widget.js`;

    return `<!-- Add this script tag to your HTML -->
<script 
  src="${scriptSrc}" 
  data-bot-id="${selections.botId}"
  data-api-url="${selections.apiUrl}"
  data-api-key="${selections.apiKey}"
  data-template="${selections.template}"
  data-theme="${selections.theme}"
  data-position="${selections.position}"
  data-primary-color="#3B82F6"${
    selectedBot
      ? `
  data-bot-name="${selectedBot.name}"
  data-welcome-message="Hello! I'm ${selectedBot.name}. ${selectedBot.description} How can I help you today?"`
      : ""
  }
  async>
</script>`;
  };

  const getChatTemplateBaseContent = () => {
    return `import React, { useState, useEffect, useRef } from 'react'
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
  template?: 'modern' | 'minimal' | 'bubble' | 'professional' | 'gaming' | 'elegant' | 'corporate' | 'healthcare' | 'education' | 'retail'
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
      const response = await fetch(\`\${apiUrl}/chat\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': \`Bearer \${apiKey}\` })
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
        container: \`rounded-2xl shadow-2xl border \${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}\`,
        header: \`bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl\`,
        message: {
          user: \`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md\`,
          bot: \`\${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl rounded-bl-md\`
        }
      },
      minimal: {
        container: \`rounded-lg shadow-lg border \${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}\`,
        header: \`\${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border-b \${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-t-lg\`,
        message: {
          user: \`bg-blue-500 text-white rounded-lg\`,
          bot: \`\${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg\`
        }
      },
      bubble: {
        container: \`rounded-3xl shadow-xl border-2 \${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}\`,
        header: \`bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-3xl\`,
        message: {
          user: \`bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-6 py-3\`,
          bot: \`\${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full px-6 py-3\`
        }
      },
      professional: {
        container: \`rounded-lg shadow-lg border \${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}\`,
        header: \`\${theme === 'dark' ? 'bg-gray-800' : 'bg-slate-800'} text-white rounded-t-lg\`,
        message: {
          user: \`bg-slate-700 text-white rounded-lg\`,
          bot: \`\${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-100'} rounded-lg\`
        }
      },
      gaming: {
        container: \`rounded-xl shadow-2xl border-2 border-green-500 bg-gradient-to-b \${theme === 'dark' ? 'from-gray-900 to-black' : 'from-gray-100 to-white'}\`,
        header: \`bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl\`,
        message: {
          user: \`bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg border border-green-400\`,
          bot: \`\${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded-lg border\`
        }
      },
      elegant: {
        container: \`rounded-2xl shadow-2xl border \${theme === 'dark' ? 'border-purple-500' : 'border-purple-200'} bg-gradient-to-b \${theme === 'dark' ? 'from-purple-900 to-gray-900' : 'from-purple-50 to-white'}\`,
        header: \`bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl\`,
        message: {
          user: \`bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl\`,
          bot: \`\${theme === 'dark' ? 'bg-purple-800/30 border-purple-500' : 'bg-purple-100 border-purple-200'} rounded-2xl border\`
        }
      },
      corporate: {
        container: \`rounded-lg shadow-lg border \${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} bg-white\`,
        header: \`bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-lg\`,
        message: {
          user: \`bg-gray-700 text-white rounded-lg\`,
          bot: \`\${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50 border-gray-200'} rounded-lg border\`
        }
      },
      healthcare: {
        container: \`rounded-2xl shadow-xl border-2 \${theme === 'dark' ? 'border-teal-600' : 'border-teal-200'} bg-gradient-to-b \${theme === 'dark' ? 'from-teal-900 to-gray-900' : 'from-teal-50 to-white'}\`,
        header: \`bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-2xl\`,
        message: {
          user: \`bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl\`,
          bot: \`\${theme === 'dark' ? 'bg-teal-800/30 border-teal-500' : 'bg-teal-50 border-teal-200'} rounded-2xl border\`
        }
      },
      education: {
        container: \`rounded-2xl shadow-xl border-2 \${theme === 'dark' ? 'border-amber-600' : 'border-amber-200'} bg-gradient-to-b \${theme === 'dark' ? 'from-amber-900 to-gray-900' : 'from-amber-50 to-white'}\`,
        header: \`bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-2xl\`,
        message: {
          user: \`bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl\`,
          bot: \`\${theme === 'dark' ? 'bg-amber-800/30 border-amber-500' : 'bg-amber-50 border-amber-200'} rounded-2xl border\`
        }
      },
      retail: {
        container: \`rounded-2xl shadow-xl border-2 \${theme === 'dark' ? 'border-rose-600' : 'border-rose-200'} bg-gradient-to-b \${theme === 'dark' ? 'from-rose-900 to-gray-900' : 'from-rose-50 to-white'}\`,
        header: \`bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-t-2xl\`,
        message: {
          user: \`bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl\`,
          bot: \`\${theme === 'dark' ? 'bg-rose-800/30 border-rose-500' : 'bg-rose-50 border-rose-200'} rounded-2xl border\`
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
    <div className={\`\${getPositionStyles()} \${getContainerSize()} \${className}\`}>
      <div className={\`\${baseStyles[theme]} \${styles.container} h-full flex flex-col overflow-hidden transition-all duration-300\`}>
        {/* Header */}
        <div className={\`\${styles.header} px-4 py-3 flex items-center justify-between\`}>
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
                  className={\`flex \${message.sender === 'user' ? 'justify-end' : 'justify-start'}\`}
                >
                  <div className={\`max-w-xs lg:max-w-sm px-4 py-2 \${styles.message[message.sender]}\`}>
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
            <div className={\`p-4 border-t \${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}\`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className={\`flex-1 px-3 py-2 rounded-lg border \${ 
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500\`}
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
}`;
  };

  const getSpecificTemplateContent = (templateId: string) => {
    const templateName = templateId.charAt(0).toUpperCase() + templateId.slice(1);

    return `import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface ${templateName}ChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'fullscreen'
  botName?: string
  welcomeMessage?: string
  placeholder?: string
}

export const ${templateName}Chat = (props: ${templateName}ChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="${templateId}"
      botName={props.botName || "${templateName} Assistant"}
      welcomeMessage={props.welcomeMessage || "Hello! I'm your ${templateId} AI assistant. How can I help you today?"}
      placeholder={props.placeholder || "Type your message..."}
      className="animate-in fade-in-50 duration-300"
    />
  )
}`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyTemplateCode = () => {
    navigator.clipboard.writeText(getSpecificTemplateContent(selections.template));
    setCopiedTemplateCode(true);
    setTimeout(() => setCopiedTemplateCode(false), 2000);
  };

  const copyBaseTemplateCode = () => {
    navigator.clipboard.writeText(getChatTemplateBaseContent());
    setCopiedBaseTemplateCode(true);
    setTimeout(() => setCopiedBaseTemplateCode(false), 2000);
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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selections.framework !== "";
      case 1:
        return selections.template !== "";
      case 2:
        return (
          selections.botId !== "" &&
          selections.apiUrl !== "" &&
          selections.apiKey !== ""
        );
      default:
        return true;
    }
  };

  const readyChatbots = chatbots.filter((bot) => bot.status === "ready");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
            {t("installationWizard.title", "Installation Wizard")}
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t(
              "installationWizard.stepCount",
              "Step {{current}} of {{total}}",
              { current: currentStep + 1, total: steps.length }
            )}
          </span>
        </div>
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center ${
                  index <= currentStep
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? "bg-primary-600 dark:bg-primary-700 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                  aria-label={t(
                    "installationWizard.stepIndicator",
                    "Step {{num}}",
                    { num: index + 1 }
                  )}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep
                      ? "bg-primary-600 dark:bg-primary-700"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 min-h-[500px]"
      >
        {/* Step 1: Framework Selection */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[0].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[0].description}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {frameworks.map((framework) => (
                <motion.button
                  key={framework.id}
                  onClick={() =>
                    setSelections({ ...selections, framework: framework.id })
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-4 border rounded-xl text-left transition-all duration-200 shadow-subtle ${
                    selections.framework === framework.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800"
                      : "border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                  }`}
                  aria-pressed={selections.framework === framework.id}
                >
                  <div className="text-2xl mb-2" aria-hidden>
                    {framework.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {framework.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {framework.description}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        framework.type === "template"
                          ? "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                          : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      }`}
                    >
                      {framework.type === "template"
                        ? t(
                            "installationWizard.frameworks.type.template",
                            "React Templates"
                          )
                        : t(
                            "installationWizard.frameworks.type.script",
                            "Script Tag"
                          )}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[1].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[1].description}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() =>
                    setSelections({ ...selections, template: template.id })
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`border rounded-xl overflow-hidden transition-all duration-200 shadow-subtle ${
                    selections.template === template.id
                      ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800"
                      : "border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-700"
                  }`}
                  aria-pressed={selections.template === template.id}
                >
                  <div className={`h-20 ${template.preview} relative`}>
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white/20 rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/templates"
                className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {t(
                  "installationWizard.viewGallery",
                  "View live template gallery"
                )}
              </Link>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[2].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[2].description}
              </p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Chatbot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t(
                    "installationWizard.config.selectChatbot",
                    "Select Chatbot *"
                  )}
                </label>
                {chatbotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 dark:border-primary-400" />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {t(
                        "installationWizard.config.loadingBots",
                        "Loading chatbots..."
                      )}
                    </span>
                  </div>
                ) : readyChatbots.length === 0 ? (
                  <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          {t(
                            "installationWizard.config.noReadyTitle",
                            "No Ready Chatbots Found"
                          )}
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                          {t(
                            "installationWizard.config.noReadyBody",
                            "You need to create and train a chatbot first before you can integrate it."
                          )}
                        </p>
                        <Link
                          to="/chatbots/new"
                          className="inline-flex items-center mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200"
                        >
                          <Bot className="h-4 w-4 mr-1" />
                          {t(
                            "installationWizard.config.createBot",
                            "Create a chatbot"
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {readyChatbots.map((chatbot) => (
                      <motion.button
                        key={chatbot.id}
                        onClick={() =>
                          setSelections({ ...selections, botId: chatbot.id })
                        }
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`p-4 border rounded-xl text-left transition-all duration-200 shadow-subtle ${
                          selections.botId === chatbot.id
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800"
                            : "border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                        }`}
                        aria-pressed={selections.botId === chatbot.id}
                      >
                        <div className="flex items-center">
                          <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {chatbot.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {chatbot.description}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                {t("installationWizard.config.readyBadge", "Ready")}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {t(
                                  "installationWizard.config.createdOn",
                                  "Created {{date}}",
                                  {
                                    date: new Date(
                                      chatbot.created_at
                                    ).toLocaleDateString(),
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme and Position Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("installationWizard.config.theme.label", "Theme")}
                  </label>
                  <select
                    value={selections.theme}
                    onChange={(e) =>
                      setSelections({ ...selections, theme: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="light">
                      {t("installationWizard.config.theme.light", "Light")}
                    </option>
                    <option value="dark">
                      {t("installationWizard.config.theme.dark", "Dark")}
                    </option>
                    <option value="auto">
                      {t("installationWizard.config.theme.auto", "Auto")}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("installationWizard.config.position.label", "Position")}
                  </label>
                  <select
                    value={selections.position}
                    onChange={(e) =>
                      setSelections({ ...selections, position: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="bottom-right">
                      {t(
                        "installationWizard.config.position.bottomRight",
                        "Bottom Right"
                      )}
                    </option>
                    <option value="bottom-left">
                      {t(
                        "installationWizard.config.position.bottomLeft",
                        "Bottom Left"
                      )}
                    </option>
                    <option value="center">
                      {t("installationWizard.config.position.center", "Center")}
                    </option>
                    <option value="fullscreen">
                      {t(
                        "installationWizard.config.position.fullscreen",
                        "Fullscreen"
                      )}
                    </option>
                  </select>
                </div>
              </div>

              {/* API Configuration */}
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-200 mb-3">
                  {t("installationWizard.api.title", "API Configuration")}
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("installationWizard.api.url.label", "API URL")}
                    </label>
                    <input
                      type="url"
                      value={selections.apiUrl}
                      onChange={(e) =>
                        setSelections({ ...selections, apiUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder={t(
                        "installationWizard.api.url.placeholder",
                        "Enter your Supabase Functions URL"
                      )}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {import.meta.env.VITE_SUPABASE_URL
                        ? t(
                            "installationWizard.api.url.prefilled",
                            "Pre-filled from environment"
                          )
                        : t(
                            "installationWizard.api.url.helper",
                            "Enter your Supabase Functions URL"
                          )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t(
                        "installationWizard.api.key.label",
                        "API Key (Anon Key)"
                      )}
                    </label>
                    <input
                      type="password"
                      value={selections.apiKey}
                      onChange={(e) =>
                        setSelections({ ...selections, apiKey: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder={t(
                        "installationWizard.api.key.placeholder",
                        "Enter your Supabase anon key"
                      )}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {import.meta.env.VITE_SUPABASE_ANON_KEY
                        ? t(
                            "installationWizard.api.url.prefilled",
                            "Pre-filled from environment"
                          )
                        : t(
                            "installationWizard.api.key.help",
                            "Your Supabase anonymous key for client-side requests"
                          )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Installation Code */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[3].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t(
                  "installationWizard.install.copyIntro",
                  "Copy this code and add it to your project"
                )}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {frameworks.find((f) => f.id === selections.framework)?.type ===
                  "template"
                    ? t(
                        "installationWizard.install.reactCodeTitle",
                        "React Component Code"
                      )
                    : t(
                        "installationWizard.install.scriptCodeTitle",
                        "HTML Script Tag"
                      )}
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyCode}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-live="polite"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedCode
                      ? t("installationWizard.install.copied", "Copied!")
                      : t("installationWizard.install.copy", "Copy Code")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const blob = new Blob([generateCode()], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download =
                        frameworks.find((f) => f.id === selections.framework)
                          ?.type === "template"
                          ? "ChatbotIntegration.tsx"
                          : "chatbot-script.html";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("installationWizard.install.download", "Download")}
                  </motion.button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-100 font-mono overflow-x-auto">
                <pre>{generateCode()}</pre>
              </div>
            </div>

            {/* Template Files Section - Only show for React */}
            {selections.framework === "react" && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("installationWizard.templateFiles.title", "Template Files")}
                </h3>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        {t(
                          "installationWizard.templateFiles.noticeTitle",
                          "Important: Download Template Files"
                        )}
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        {t(
                          "installationWizard.templateFiles.noticeBody",
                          "The React integration requires template files. Download both files below and place them in your project's {{path}} directory.",
                          { path: "src/components/ChatTemplates/" }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Base Template File */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(
                        "installationWizard.templateFiles.base.title",
                        "1. ChatTemplate.tsx"
                      )}
                    </h4>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyBaseTemplateCode}
                        className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {copiedBaseTemplateCode ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        {copiedBaseTemplateCode
                          ? t(
                              "installationWizard.templateFiles.button.copied",
                              "Copied!"
                            )
                          : t(
                              "installationWizard.templateFiles.button.copy",
                              "Copy"
                            )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          downloadFile(
                            getChatTemplateBaseContent(),
                            "ChatTemplate.tsx"
                          )
                        }
                        className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t(
                          "installationWizard.templateFiles.button.download",
                          "Download"
                        )}
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t(
                      "installationWizard.templateFiles.base.desc",
                      "Base template component that handles chat functionality"
                    )}
                  </p>
                </div>

                {/* Specific Template File */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(
                        "installationWizard.templateFiles.specific.title",
                        "2. {{templateName}}Chat.tsx",
                        {
                          templateName:
                            selections.template.charAt(0).toUpperCase() +
                            selections.template.slice(1),
                        }
                      )}
                    </h4>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyTemplateCode}
                        className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {copiedTemplateCode ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        {copiedTemplateCode
                          ? t(
                              "installationWizard.templateFiles.button.copied",
                              "Copied!"
                            )
                          : t(
                              "installationWizard.templateFiles.button.copy",
                              "Copy"
                            )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          downloadFile(
                            getSpecificTemplateContent(selections.template),
                            `${
                              selections.template.charAt(0).toUpperCase() +
                              selections.template.slice(1)
                            }Chat.tsx`
                          )
                        }
                        className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t(
                          "installationWizard.templateFiles.button.download",
                          "Download"
                        )}
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t(
                      "installationWizard.templateFiles.specific.desc",
                      "Specific template implementation for {{template}} style",
                      { template: selections.template }
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Selected Chatbot Info */}
            {selections.botId && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                <div className="flex items-start">
                  <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-primary-900 dark:text-primary-200">
                      {t(
                        "installationWizard.selectedBot.title",
                        "Selected Chatbot"
                      )}
                    </h4>
                    {(() => {
                      const selectedBot = chatbots.find(
                        (bot) => bot.id === selections.botId
                      );
                      return selectedBot ? (
                        <div className="mt-1">
                          <p className="text-sm text-primary-800 dark:text-primary-300 font-medium">
                            {selectedBot.name}
                          </p>
                          <p className="text-sm text-primary-700 dark:text-primary-400">
                            {selectedBot.description}
                          </p>
                          <p className="text-xs text-primary-600 dark:text-primary-500 mt-1">
                            {t("installationWizard.selectedBot.id", "ID: {{id}}", {
                              id: selectedBot.id,
                            })}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <h4 className="text-lg font-medium text-green-900 dark:text-green-200 mb-3">
                {t("installationWizard.nextSteps.title", "Next Steps")}
              </h4>
              <ol className="text-sm text-green-800 dark:text-green-300 space-y-2">
                {frameworks.find((f) => f.id === selections.framework)?.type ===
                "template" ? (
                  <>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.react.1.title",
                            "Create directory structure"
                          )}
                          :
                        </strong>{" "}
                        {t(
                          "installationWizard.nextSteps.react.1.body",
                          "Create a {{path}} folder in your project",
                          { path: "src/components/ChatTemplates" }
                        )}
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.react.2.title",
                            "Save template files"
                          )}
                          :
                        </strong>{" "}
                        {t(
                          "installationWizard.nextSteps.react.2.body",
                          "Download both template files and place them in the ChatTemplates folder"
                        )}
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.react.3.title",
                            "Install dependencies"
                          )}
                          :
                        </strong>{" "}
                        <code className="bg-green-100 dark:bg-green-900/50 px-1 rounded">
                          npm install lucide-react
                        </code>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        4
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.react.4.title",
                            "Add the code"
                          )}
                          :
                        </strong>{" "}
                        {t(
                          "installationWizard.nextSteps.react.4.body",
                          "Copy the generated code to your React component"
                        )}
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        5
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.react.5.title",
                            "Test integration"
                          )}
                          :
                        </strong>{" "}
                        {t(
                          "installationWizard.nextSteps.react.5.body",
                          "Your chatbot is ready to use!"
                        )}
                      </div>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        1
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.script.1.title",
                            "Host the widget"
                          )}
                          :
                        </strong>{" "}
                        {t(
                          "installationWizard.nextSteps.script.1.body",
                          "The widget script is already hosted at {{url}}",
                          {
                            url: `${window.location.origin}/chatbot-widget.js`,
                          }
                        )}
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        2
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.script.2.title",
                            "Add script tag"
                          )}
                          :
                        </strong>{" "}
                        {t(
                          "installationWizard.nextSteps.script.2.body",
                          "Copy the generated script tag to your HTML"
                        )}
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        3
                      </span>
                      <div>
                        <strong>
                          {t(
                            "installationWizard.nextSteps.script.3.title",
                            "Test integration"
                          )}
                          :
                        </strong>{" "}
                        {t(
                          "installationWizard.nextSteps.script.3.body",
                          "Your chatbot should appear and function correctly"
                        )}
                      </div>
                    </li>
                  </>
                )}
              </ol>
            </div>

            {/* Additional Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
              >
                <Link to="/templates" className="block">
                  <Palette className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {t(
                      "installationWizard.resources.gallery.title",
                      "Template Gallery"
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      "installationWizard.resources.gallery.body",
                      "Browse all templates"
                    )}
                  </p>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
              >
                <Link to="/integrations" className="block">
                  <Code className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {t(
                      "installationWizard.resources.docs.title",
                      "Documentation"
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      "installationWizard.resources.docs.body",
                      "Complete setup guide"
                    )}
                  </p>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center"
              >
                <Link to="/chatbots" className="block">
                  <Settings className="h-6 w-6 text-accent-600 dark:text-accent-400 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {t(
                      "installationWizard.resources.manage.title",
                      "Manage Chatbots"
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(
                      "installationWizard.resources.manage.body",
                      "View & edit chatbots"
                    )}
                  </p>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("installationWizard.nav.previous", "Previous")}
        </motion.button>

        {currentStep < steps.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("installationWizard.nav.next", "Next")}
            <ChevronRight className="h-4 w-4 ml-2" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep(0)}
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            {t("installationWizard.nav.startOver", "Start Over")}
            <Zap className="h-4 w-4 ml-2" />
          </motion.button>
        )}
      </div>
    </div>
  );
};
