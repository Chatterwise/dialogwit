import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Loader
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useChatbots } from '../hooks/useChatbots'
import { useRealTimeAnalytics } from '../hooks/useRealTimeAnalytics'

interface MetricCard {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<any>
  color: string
}

export const AdvancedAnalytics = () => {
  const { user } = useAuth()
  const { data: chatbots = [] } = useChatbots(user?.id || '')
  const [selectedChatbot, setSelectedChatbot] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [isExporting, setIsExporting] = useState(false)

  const { 
    data: analytics, 
    isLoading, 
    refetch 
  } = useRealTimeAnalytics(selectedChatbot, dateRange)

  const handleExport = async (format: 'csv' | 'json') => {
    if (!analytics) return;
    
    setIsExporting(true)
    try {
      const exportData = analytics.exportData || []
      
      if (format === 'csv') {
        const csv = convertToCSV(exportData)
        downloadFile(csv, `analytics-${dateRange}.csv`, 'text/csv')
      } else {
        const json = JSON.stringify(exportData, null, 2)
        downloadFile(json, `analytics-${dateRange}.json`, 'application/json')
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n')
    
    return `${headers}\n${rows}`
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  const metrics: MetricCard[] = [
    {
      title: 'Total Conversations',
      value: analytics.totalConversations,
      change: `${analytics.conversationGrowth >= 0 ? '+' : ''}${analytics.conversationGrowth}%`,
      trend: analytics.conversationGrowth >= 0 ? 'up' : 'down',
      icon: MessageCircle,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Unique Users',
      value: analytics.uniqueUsers,
      change: `${analytics.userGrowth >= 0 ? '+' : ''}${analytics.userGrowth}%`,
      trend: analytics.userGrowth >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Avg Response Time',
      value: `${analytics.avgResponseTime}ms`,
      change: `${analytics.responseTimeImprovement >= 0 ? '-' : '+'}${Math.abs(analytics.responseTimeImprovement)}%`,
      trend: analytics.responseTimeImprovement >= 0 ? 'up' : 'down',
      icon: Clock,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Satisfaction Rate',
      value: `${analytics.satisfactionRate}%`,
      change: `${analytics.satisfactionGrowth >= 0 ? '+' : ''}${analytics.satisfactionGrowth}%`,
      trend: analytics.satisfactionGrowth >= 0 ? 'up' : 'down',
      icon: ThumbsUp,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      title: 'Resolution Rate',
      value: `${analytics.resolutionRate}%`,
      change: `${analytics.resolutionGrowth >= 0 ? '+' : ''}${analytics.resolutionGrowth}%`,
      trend: analytics.resolutionGrowth >= 0 ? 'up' : 'down',
      icon: Zap,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Peak Usage Hour',
      value: analytics.peakHour || 'N/A',
      change: 'Most active',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-1">
            Advanced Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into your chatbot performance and user engagement.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <div className="relative">
            <select
              value={selectedChatbot}
              onChange={(e) => setSelectedChatbot(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Chatbots</option>
              {chatbots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume Chart */}
        <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Message Volume</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center">
            {analytics.messageVolumeChart && analytics.messageVolumeChart.length > 0 ? (
              <div className="w-full h-full">
                <div className="flex items-end space-x-2 h-full">
                  {analytics.messageVolumeChart.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-primary-500 rounded-t transition-all duration-300"
                        style={{
                          height: `${(data.value / Math.max(...analytics.messageVolumeChart.map(d => d.value) || 1)) * 200}px`
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-2">{data.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* User Satisfaction Chart */}
        <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">User Satisfaction</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                    <ThumbsUp className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.positiveRating}%</p>
                  <p className="text-sm text-gray-500">Positive</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-2">
                    <ThumbsDown className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.negativeRating}%</p>
                  <p className="text-sm text-gray-500">Negative</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.positiveRating}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-600">Download your analytics data and chat logs</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting || !analytics.exportData.length}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting || !analytics.exportData.length}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </button>
          </div>
        </div>
        
        {isExporting && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
            <span className="text-sm text-gray-600">Preparing export...</span>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.type === 'success' ? 'bg-green-100 text-green-800' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}