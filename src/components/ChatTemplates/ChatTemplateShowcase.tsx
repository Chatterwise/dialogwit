import React, { useState } from 'react'
import { Bot, Palette, Monitor, Smartphone, Settings } from 'lucide-react'
import { ModernChat } from './ModernChat'
import { MinimalChat } from './MinimalChat'
import { BubbleChat } from './BubbleChat'
import { ProfessionalChat } from './ProfessionalChat'
import { GamingChat } from './GamingChat'
import { ElegantChat } from './ElegantChat'
import { CorporateChat } from './CorporateChat'
import { HealthcareChat } from './HealthcareChat'
import { EducationChat } from './EducationChat'
import { RetailChat } from './RetailChat'

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
      features: ['Gradient backgrounds', 'Smooth animations', 'Modern typography'],
      category: 'General'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean and simple interface',
      component: MinimalChat,
      preview: 'bg-gray-100 border border-gray-300',
      features: ['Clean lines', 'Subtle shadows', 'Focused design'],
      category: 'General'
    },
    {
      id: 'bubble',
      name: 'Bubble',
      description: 'Playful bubble-style messages',
      component: BubbleChat,
      preview: 'bg-gradient-to-r from-pink-400 to-rose-400',
      features: ['Rounded bubbles', 'Playful colors', 'Friendly feel'],
      category: 'General'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Corporate and business-focused',
      component: ProfessionalChat,
      preview: 'bg-slate-700',
      features: ['Corporate colors', 'Professional tone', 'Business ready'],
      category: 'Business'
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Enterprise-grade professional design',
      component: CorporateChat,
      preview: 'bg-gradient-to-r from-gray-700 to-gray-800',
      features: ['Enterprise design', 'Formal tone', 'Corporate branding'],
      category: 'Business'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'Gaming-inspired with neon accents',
      component: GamingChat,
      preview: 'bg-gradient-to-r from-green-500 to-emerald-500',
      features: ['Neon colors', 'Gaming aesthetics', 'High contrast'],
      category: 'Entertainment'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated and refined',
      component: ElegantChat,
      preview: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      features: ['Elegant gradients', 'Refined typography', 'Luxury feel'],
      category: 'Premium'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical and health-focused design',
      component: HealthcareChat,
      preview: 'bg-gradient-to-r from-teal-500 to-cyan-500',
      features: ['Medical colors', 'Trust-building', 'Health-focused'],
      category: 'Industry'
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Learning and academic environment',
      component: EducationChat,
      preview: 'bg-gradient-to-r from-amber-500 to-orange-500',
      features: ['Academic colors', 'Learning-focused', 'Student-friendly'],
      category: 'Industry'
    },
    {
      id: 'retail',
      name: 'Retail',
      description: 'E-commerce and shopping experience',
      component: RetailChat,
      preview: 'bg-gradient-to-r from-rose-500 to-pink-500',
      features: ['Shopping colors', 'Customer-focused', 'Sales-oriented'],
      category: 'Industry'
    }
  ]

  const categories = ['All', 'General', 'Business', 'Industry', 'Entertainment', 'Premium']
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Template Gallery</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Explore our comprehensive collection of beautiful, production-ready chat templates. 
          Each template is fully customizable and designed for specific industries and use cases.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === category
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview Settings</h3>
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
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Preview */}
            <div className={`h-32 ${template.preview} relative`}>
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  template.category === 'General' ? 'bg-blue-100 text-blue-800' :
                  template.category === 'Business' ? 'bg-gray-100 text-gray-800' :
                  template.category === 'Industry' ? 'bg-green-100 text-green-800' :
                  template.category === 'Entertainment' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {template.category}
                </span>
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

      {/* Usage Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Template Collection Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-sm text-blue-700">Total Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
              <div className="text-sm text-purple-700">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-green-700">Responsive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-orange-700">Themes</div>
            </div>
          </div>
        </div>
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Industry-Specific Template</h4>
            <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono overflow-x-auto">
              <pre>{`<HealthcareChat
  botId="health-assistant"
  template="healthcare"
  theme="light"
  position="center"
  botName="Health Assistant"
  welcomeMessage="Hello! I'm here to help with your health questions."
  placeholder="Ask about health topics..."
  primaryColor="#059669"
  className="custom-health-chat"
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
            <h3 className="text-lg font-medium text-blue-900">Production Ready Features</h3>
            <p className="text-blue-700 mt-1 mb-4">
              All templates are built for production use with industry-specific optimizations.
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
                <Settings className="h-4 w-4 mr-2" />
                Fully Customizable
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