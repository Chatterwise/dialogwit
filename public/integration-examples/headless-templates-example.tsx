import React, { useState } from 'react'
import { 
  ModernChat, 
  MinimalChat, 
  BubbleChat, 
  ProfessionalChat, 
  GamingChat, 
  ElegantChat 
} from '../src/components/ChatTemplates'

// Example 1: Simple Template Usage
export function SimpleTemplateExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Open Modern Chat
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
}

// Example 2: Multiple Templates with Switcher
export function MultiTemplateExample() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const templates = [
    { id: 'modern', name: 'Modern', component: ModernChat },
    { id: 'minimal', name: 'Minimal', component: MinimalChat },
    { id: 'bubble', name: 'Bubble', component: BubbleChat },
    { id: 'professional', name: 'Professional', component: ProfessionalChat },
    { id: 'gaming', name: 'Gaming', component: GamingChat },
    { id: 'elegant', name: 'Elegant', component: ElegantChat },
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Chat Template Demo</h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setActiveTemplate(template.id)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-gray-500">Click to preview</p>
            </button>
          ))}
        </div>
      </div>

      {renderActiveTemplate()}
    </div>
  )
}

// Example 3: Custom Styled Template
export function CustomStyledExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
      >
        Open Custom Chat
      </button>
      
      <ElegantChat
        botId="custom-bot"
        apiUrl="https://your-api.supabase.co/functions/v1"
        apiKey="your-api-key"
        isOpen={isOpen}
        onToggle={setIsOpen}
        theme="dark"
        className="custom-chat-animation"
      />
      
      <style jsx>{`
        .custom-chat-animation {
          animation: slideInUp 0.3s ease-out;
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

// Example 4: Fullscreen Chat
export function FullscreenChatExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Open Fullscreen Chat
      </button>
      
      <ModernChat
        botId="fullscreen-bot"
        apiUrl="https://your-api.supabase.co/functions/v1"
        apiKey="your-api-key"
        isOpen={isOpen}
        onToggle={setIsOpen}
        position="fullscreen"
        theme="light"
      />
    </div>
  )
}

// Example 5: Integration with State Management
export function StateManagementExample() {
  const [chatState, setChatState] = useState({
    isOpen: false,
    template: 'modern',
    theme: 'light' as 'light' | 'dark',
    messages: []
  })

  const handleChatToggle = (isOpen: boolean) => {
    setChatState(prev => ({ ...prev, isOpen }))
    
    // Analytics tracking
    if (isOpen) {
      console.log('Chat opened')
    } else {
      console.log('Chat closed')
    }
  }

  const templates = {
    modern: ModernChat,
    minimal: MinimalChat,
    bubble: BubbleChat,
    professional: ProfessionalChat,
    gaming: GamingChat,
    elegant: ElegantChat,
  }

  const ChatComponent = templates[chatState.template as keyof typeof templates]

  return (
    <div className="p-6">
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold">State Management Example</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={chatState.template}
            onChange={(e) => setChatState(prev => ({ ...prev, template: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="bubble">Bubble</option>
            <option value="professional">Professional</option>
            <option value="gaming">Gaming</option>
            <option value="elegant">Elegant</option>
          </select>
          
          <select
            value={chatState.theme}
            onChange={(e) => setChatState(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          
          <button
            onClick={() => handleChatToggle(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Open Chat
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          Current state: {JSON.stringify(chatState, null, 2)}
        </div>
      </div>

      <ChatComponent
        botId="state-managed-bot"
        apiUrl="https://your-api.supabase.co/functions/v1"
        apiKey="your-api-key"
        isOpen={chatState.isOpen}
        onToggle={handleChatToggle}
        theme={chatState.theme}
      />
    </div>
  )
}