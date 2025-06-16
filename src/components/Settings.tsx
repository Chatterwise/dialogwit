import React, { useState } from 'react'
import { User, Bell, Shield, Trash2, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const Settings = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'danger'>('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    chatNotifications: false,
    weeklyReports: true,
    apiKey: 'sk-1234567890abcdef...',
    twoFactorEnabled: false
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'danger', name: 'Danger Zone', icon: Trash2 },
  ]

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Delete account logic here
      console.log('Deleting account...')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {activeTab === 'profile' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-2xl font-medium text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                        Change Avatar
                      </button>
                      <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        placeholder="Your company name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Zone
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+1 (Central European Time)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive email updates about your chatbots</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Chat Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified when someone chats with your bot</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.chatNotifications}
                        onChange={(e) => setSettings({ ...settings, chatNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">Receive weekly analytics reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.weeklyReports}
                        onChange={(e) => setSettings({ ...settings, weeklyReports: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">API Key</h4>
                    <p className="text-sm text-gray-500 mb-3">Use this key to integrate with our API</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.apiKey}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        settings.twoFactorEnabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {settings.twoFactorEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Change Password</h4>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="mt-3 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Danger Zone</h3>
                <div className="space-y-6">
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Delete Account
                    </button>
                  </div>

                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <h4 className="text-sm font-medium text-yellow-900 mb-2">Export Data</h4>
                    <p className="text-sm text-yellow-700 mb-4">
                      Download all your data including chatbots, knowledge base, and chat logs.
                    </p>
                    <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200">
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}