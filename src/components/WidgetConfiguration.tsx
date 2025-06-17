import React, { useState } from 'react'
import { 
  Palette, 
  Settings, 
  Monitor, 
  Smartphone, 
  Eye,
  Save,
  RotateCcw,
  Upload,
  Download
} from 'lucide-react'

interface WidgetConfig {
  template: string
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  size: 'small' | 'medium' | 'large'
  botName: string
  welcomeMessage: string
  placeholder: string
  autoOpen: boolean
  autoOpenDelay: number
  showTypingIndicator: boolean
  enableSounds: boolean
  customCSS: string
  logo?: string
}

interface WidgetConfigurationProps {
  chatbotId: string
  onConfigSave: (config: WidgetConfig) => void
}

export const WidgetConfiguration: React.FC<WidgetConfigurationProps> = ({
  chatbotId,
  onConfigSave
}) => {
  const [config, setConfig] = useState<WidgetConfig>({
    template: 'modern',
    theme: 'light',
    primaryColor: '#3B82F6',
    position: 'bottom-right',
    size: 'medium',
    botName: 'AI Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Type your message...',
    autoOpen: false,
    autoOpenDelay: 3000,
    showTypingIndicator: true,
    enableSounds: false,
    customCSS: ''
  })

  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'messages' | 'advanced'>('appearance')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  const templates = [
    { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { id: 'minimal', name: 'Minimal', preview: 'bg-gray-100 border border-gray-300' },
    { id: 'bubble', name: 'Bubble', preview: 'bg-gradient-to-r from-pink-400 to-rose-400' },
    { id: 'professional', name: 'Professional', preview: 'bg-slate-700' },
    { id: 'corporate', name: 'Corporate', preview: 'bg-gradient-to-r from-gray-700 to-gray-800' },
    { id: 'healthcare', name: 'Healthcare', preview: 'bg-gradient-to-r from-teal-500 to-cyan-500' },
    { id: 'education', name: 'Education', preview: 'bg-gradient-to-r from-amber-500 to-orange-500' },
    { id: 'retail', name: 'Retail', preview: 'bg-gradient-to-r from-rose-500 to-pink-500' }
  ]

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ]

  const handleSave = () => {
    onConfigSave(config)
  }

  const handleReset = () => {
    setConfig({
      template: 'modern',
      theme: 'light',
      primaryColor: '#3B82F6',
      position: 'bottom-right',
      size: 'medium',
      botName: 'AI Assistant',
      welcomeMessage: 'Hello! How can I help you today?',
      placeholder: 'Type your message...',
      autoOpen: false,
      autoOpenDelay: 3000,
      showTypingIndicator: true,
      enableSounds: false,
      customCSS: ''
    })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setConfig({ ...config, logo: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const exportConfig = () => {
    const configJson = JSON.stringify(config, null, 2)
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `widget-config-${chatbotId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'behavior', name: 'Behavior', icon: Settings },
    { id: 'messages', name: 'Messages', icon: Monitor },
    { id: 'advanced', name: 'Advanced', icon: Smartphone }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Widget Configuration</h2>
          <p className="text-gray-600">Customize your chatbot's appearance and behavior</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                previewMode === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Monitor className="h-4 w-4 mr-1 inline" />
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                previewMode === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Smartphone className="h-4 w-4 mr-1 inline" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2 inline" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Template</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setConfig({ ...config, template: template.id })}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          config.template === template.id
                            ? 'border-primary-500 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className={`h-16 ${template.preview}`} />
                        <div className="p-2 text-xs font-medium text-gray-900">
                          {template.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                      value={config.theme}
                      onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <select
                      value={config.size}
                      onChange={(e) => setConfig({ ...config, size: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setConfig({ ...config, primaryColor: color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          config.primaryColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo/Avatar</label>
                  <div className="flex items-center space-x-4">
                    {config.logo && (
                      <img src={config.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'behavior' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={config.position}
                    onChange={(e) => setConfig({ ...config, position: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto Open</label>
                    <p className="text-sm text-gray-500">Automatically open the chat widget</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoOpen}
                      onChange={(e) => setConfig({ ...config, autoOpen: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {config.autoOpen && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Open Delay (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={config.autoOpenDelay / 1000}
                      onChange={(e) => setConfig({ ...config, autoOpenDelay: parseInt(e.target.value) * 1000 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Typing Indicator</label>
                    <p className="text-sm text-gray-500">Show when the bot is typing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showTypingIndicator}
                      onChange={(e) => setConfig({ ...config, showTypingIndicator: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Sounds</label>
                    <p className="text-sm text-gray-500">Play notification sounds</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableSounds}
                      onChange={(e) => setConfig({ ...config, enableSounds: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Name</label>
                  <input
                    type="text"
                    value={config.botName}
                    onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="AI Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                  <textarea
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Hello! How can I help you today?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Input Placeholder</label>
                  <input
                    type="text"
                    value={config.placeholder}
                    onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Type your message..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
                  <textarea
                    value={config.customCSS}
                    onChange={(e) => setConfig({ ...config, customCSS: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="/* Add your custom CSS here */"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Add custom CSS to further customize the widget appearance
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={exportConfig}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 ${
                previewMode === 'mobile' ? 'max-w-xs mx-auto' : ''
              }`}>
                <div className="text-center text-gray-500 text-sm">
                  <Monitor className="h-8 w-8 mx-auto mb-2" />
                  <p>Widget preview will appear here</p>
                  <p className="text-xs mt-1">
                    {previewMode === 'mobile' ? 'Mobile View' : 'Desktop View'}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p><strong>Template:</strong> {config.template}</p>
                <p><strong>Theme:</strong> {config.theme}</p>
                <p><strong>Position:</strong> {config.position}</p>
                <p><strong>Size:</strong> {config.size}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}