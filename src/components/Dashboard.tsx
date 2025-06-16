import React from 'react'
import { Bot, Plus, MessageCircle, BookOpen, Zap, TrendingUp, Users, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useChatbots } from '../hooks/useChatbots'
import { AnalyticsChart } from './AnalyticsChart'

export const Dashboard = () => {
  const { user } = useAuth()
  const { data: chatbots = [], isLoading } = useChatbots(user?.id || '')

  const activeBots = chatbots.filter(bot => bot.status === 'ready').length
  const processingBots = chatbots.filter(bot => bot.status === 'processing').length

  // Mock analytics data for demo
  const mockChartData = [
    { date: 'Mon', messages: 12 },
    { date: 'Tue', messages: 19 },
    { date: 'Wed', messages: 8 },
    { date: 'Thu', messages: 25 },
    { date: 'Fri', messages: 22 },
    { date: 'Sat', messages: 15 },
    { date: 'Sun', messages: 18 },
  ]

  const stats = [
    {
      name: 'Total Chatbots',
      value: chatbots.length,
      icon: Bot,
      color: 'text-blue-600 bg-blue-100',
      change: '+2 this week'
    },
    {
      name: 'Active Chatbots',
      value: activeBots,
      icon: Zap,
      color: 'text-green-600 bg-green-100',
      change: `${processingBots} processing`
    },
    {
      name: 'Total Messages',
      value: '2.4k',
      icon: MessageCircle,
      color: 'text-purple-600 bg-purple-100',
      change: '+12% from last week'
    },
    {
      name: 'Knowledge Base Items',
      value: '47',
      icon: BookOpen,
      color: 'text-orange-600 bg-orange-100',
      change: '+5 this week'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your chatbots.</p>
        </div>
        <Link
          to="/chatbots/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chatbot
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">{stat.change}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Chart */}
        <AnalyticsChart 
          data={mockChartData} 
          title="Messages This Week" 
        />

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Customer Support Bot created</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">25 new messages received</p>
                  <p className="text-sm text-gray-500">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Knowledge base updated</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Weekly report generated</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Chatbots */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Chatbots</h3>
            <Link
              to="/chatbots"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading chatbots...</p>
            </div>
          ) : chatbots.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No chatbots yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first chatbot.</p>
              <div className="mt-6">
                <Link
                  to="/chatbots/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chatbot
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatbots.slice(0, 3).map((chatbot) => (
                <div key={chatbot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Bot className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{chatbot.name}</p>
                      <p className="text-sm text-gray-500">{chatbot.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      chatbot.status === 'ready' 
                        ? 'bg-green-100 text-green-800'
                        : chatbot.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chatbot.status}
                    </span>
                    <Link
                      to={`/chatbots/${chatbot.id}`}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/chatbots/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center">
                <Plus className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
                <span className="ml-3 text-sm font-medium text-gray-900">Create New Chatbot</span>
              </div>
            </Link>
            <Link
              to="/knowledge-base"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-green-600 group-hover:text-green-700" />
                <span className="ml-3 text-sm font-medium text-gray-900">Manage Knowledge Base</span>
              </div>
            </Link>
            <Link
              to="/integrations"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center">
                <Zap className="h-6 w-6 text-purple-600 group-hover:text-purple-700" />
                <span className="ml-3 text-sm font-medium text-gray-900">View Integrations</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}