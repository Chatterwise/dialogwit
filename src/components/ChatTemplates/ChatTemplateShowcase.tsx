import React, { useState } from 'react'
import { Bot, Palette, Monitor, Smartphone, Settings } from 'lucide-react'
import { ModernChat } from './ModernChat'
import { MinimalChat } from './MinimalChat'
import { BubbleChat } from './BubbleChat'
import { ProfessionalChat } from './ProfessionalChat'
import { GamingChat } from './GamingChat'
import { ElegantChat } from './ElegantChat'

export const ChatTemplateShowcase = () => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'center'>('bottom-right')

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Sleek gradient design with rounded corners',
      component: ModernChat,
      preview: 'bg-gradient-to-r from-blue-500 to-purple-500',
      features: ['Gradient backgrounds', 'Smooth animations', 'Modern typography']
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean and simple interface',
      component: MinimalChat,
      preview: 'bg-gray-100 border border-gray-300',
      features: ['Clean lines', 'Subtle shadows', 'Focused design']
    },
    {
      id: 'bubble',
      name: 'Bubble',
      description: 'Playful bubble-style messages',
      component: BubbleChat,
      preview: 'bg-gradient-to-r from-pink-400 to-rose-400',
      features: ['Rounded bubbles', 'Playful colors', 'Friendly feel']
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Corporate and business-focused',
      component: ProfessionalChat,
      preview: 'bg-slate-700',
      features: ['Corporate colors', 'Professional tone', 'Business ready']
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'Gaming-inspired with neon accents',
      component: GamingChat,
      preview: 'bg-gradient-to-r from-green-500 to-emerald-500',
      features: ['Neon colors', 'Gaming aesthetics', 'High contrast']
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated and refined',
      component: ElegantChat,
      preview: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      features: ['Elegant gradients', 'Refined typography', 'Luxury feel']
    }
  ]

  const renderActiveTemplate = () => {
    const template = templates.find(t => t.id === activeTemplate)
    if (!template) return null

    const Component = template.component
    return (
      <Component
        botId="demo-bot"
        apiUrl="/api"
        isOpen={true}
        onToggle={() => setActiveTemplate(null)}
        theme={theme}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Template Showcase</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our collection of beautiful, production-ready chat templates. Each template is fully customizable 
          and can be easily integrated into any React application.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customization Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="center">Center</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setActiveTemplate(null)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Preview */}
            <div className={`h-32 ${template.preview} relative`}>
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              
              {/* Features */}
              <div className="space-y-2 mb-4">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTemplate(template.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Preview
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Code Examples */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Usage</h4>
            <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono overflow-x-auto">
              <pre>{`import { ModernChat } from './components/ChatTemplates'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Open Chat
      </button>
      
      <ModernChat
        botId="your-bot-id"
        apiUrl="https://your-api.supabase.co/functions/v1"
        apiKey="your-api-key"
        isOpen={isOpen}
        onToggle={setIsOpen}
        theme="light"
      />
    </div>
  )
}`}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Advanced Customization</h4>
            <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono overflow-x-auto">
              <pre>{`<ChatTemplate
  botId="support-bot"
  template="professional"
  theme="dark"
  position="center"
  botName="Support Assistant"
  welcomeMessage="Welcome to our support center!"
  placeholder="Describe your issue..."
  primaryColor="#059669"
  className="custom-chat-styles"
/>`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Design Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Monitor className="h-6 w-6 text-blue-600 mt-1" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">Responsive Design</h3>
            <p className="text-blue-700 mt-1">
              All templates are fully responsive and work perfectly on desktop, tablet, and mobile devices. 
              They automatically adapt to different screen sizes and orientations.
            </p>
            <div className="mt-3 flex items-center space-x-4 text-sm text-blue-600">
              <div className="flex items-center">
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </div>
              <div className="flex items-center">
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </div>
              <div className="flex items-center">
                <Palette className="h-4 w-4 mr-1" />
                Customizable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Template */}
      {renderActiveTemplate()}
    </div>
  )
}