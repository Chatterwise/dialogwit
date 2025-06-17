import React, { useState } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity,
  Users,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
  Settings,
  Download,
  Save,
  RotateCcw
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { 
  useRateLimitConfig, 
  useUpdateRateLimitConfig, 
  useRateLimitStatus,
  useRateLimitAnalytics,
  useGlobalRateLimitStats,
  useClearRateLimit,
  RateLimitConfig
} from '../hooks/useRateLimits'
import { useAuditLogs, useSecurityEvents, useExportAuditLogs } from '../hooks/useAuditLogs'

export const SecurityCenter = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'rate-limits' | 'audit-logs' | 'privacy'>('overview')
  
  // Rate limiting hooks
  const { data: rateLimitConfig, isLoading: configLoading } = useRateLimitConfig(user?.id || '')
  const updateRateLimitConfig = useUpdateRateLimitConfig()
  const { data: rateLimitStatus } = useRateLimitStatus()
  const { data: rateLimitAnalytics } = useRateLimitAnalytics('24h')
  const { data: globalStats } = useGlobalRateLimitStats()
  const clearRateLimit = useClearRateLimit()

  // Audit logging hooks
  const { data: auditLogs } = useAuditLogs(user?.id || '', { limit: 50 })
  const { data: securityEvents } = useSecurityEvents(user?.id)
  const exportAuditLogs = useExportAuditLogs()

  // Local state for rate limit configuration
  const [localRateLimitConfig, setLocalRateLimitConfig] = useState<RateLimitConfig>({
    requests_per_minute: 100,
    requests_per_hour: 1000,
    requests_per_day: 10000,
    burst_limit: 20,
    enabled: true
  })

  // Update local state when data loads
  React.useEffect(() => {
    if (rateLimitConfig) {
      setLocalRateLimitConfig(rateLimitConfig)
    }
  }, [rateLimitConfig])

  const handleRateLimitSave = async () => {
    if (!user?.id) return

    try {
      await updateRateLimitConfig.mutateAsync({
        userId: user.id,
        config: localRateLimitConfig
      })
      
      // Show success message
      alert('Rate limit configuration saved successfully!')
    } catch (error) {
      console.error('Failed to save rate limit config:', error)
      alert('Failed to save configuration. Please try again.')
    }
  }

  const handleRateLimitReset = () => {
    setLocalRateLimitConfig({
      requests_per_minute: 100,
      requests_per_hour: 1000,
      requests_per_day: 10000,
      burst_limit: 20,
      enabled: true
    })
  }

  const handleExportAuditLogs = async (format: 'csv' | 'json') => {
    if (!user?.id) return

    try {
      const data = await exportAuditLogs.mutateAsync({
        userId: user.id,
        format
      })

      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export audit logs. Please try again.')
    }
  }

  const handleClearRateLimit = async (identifier: string, endpoint?: string) => {
    try {
      await clearRateLimit.mutateAsync({ identifier, endpoint })
      alert('Rate limit cleared successfully!')
    } catch (error) {
      console.error('Failed to clear rate limit:', error)
      alert('Failed to clear rate limit. Please try again.')
    }
  }

  const securityMetrics = {
    total_requests_today: rateLimitAnalytics?.total_requests || 0,
    blocked_requests_today: rateLimitAnalytics?.blocked_requests || 0,
    unique_ips_today: rateLimitAnalytics?.unique_identifiers || 0,
    rate_limit_violations: rateLimitStatus?.total_blocked || 0,
    security_score: Math.max(70, 100 - (rateLimitAnalytics?.block_rate || 0) * 2)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_limit': return <Clock className="h-4 w-4" />
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />
      case 'failed_auth': return <Lock className="h-4 w-4" />
      case 'data_access': return <Eye className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const tabs = [
    { id: 'overview', name: 'Security Overview', icon: Shield },
    { id: 'rate-limits', name: 'Rate Limiting', icon: Clock },
    { id: 'audit-logs', name: 'Audit Logs', icon: Eye },
    { id: 'privacy', name: 'Privacy Controls', icon: Lock }
  ]

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-1">
          Security Center
        </h1>
        <p className="text-gray-600">
          Monitor and configure security settings for your chatbots.
        </p>
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900">Security Score</h3>
              <p className="text-sm text-green-700">Your overall security rating</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{Math.round(securityMetrics.security_score)}/100</div>
            <div className="text-sm text-green-700">
              {securityMetrics.security_score >= 90 ? 'Excellent' : 
               securityMetrics.security_score >= 75 ? 'Good' : 
               securityMetrics.security_score >= 60 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>

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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.total_requests_today.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.blocked_requests_today}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique IPs</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.unique_ips_today}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Rate Limit Hits</p>
                  <p className="text-2xl font-bold text-gray-900">{securityMetrics.rate_limit_violations}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Security Events</h3>
            <div className="space-y-3">
              {securityEvents && securityEvents.length > 0 ? (
                securityEvents.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                        {getTypeIcon(event.event_type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.event_type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleString()} • {event.source_ip || 'Unknown IP'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No security events recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rate-limits' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Rate Limiting Configuration</h3>
                <p className="text-sm text-gray-600">Configure API rate limits to prevent abuse</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rate Limiting</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localRateLimitConfig.enabled}
                    onChange={(e) => setLocalRateLimitConfig({ 
                      ...localRateLimitConfig, 
                      enabled: e.target.checked 
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requests per Minute
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={localRateLimitConfig.requests_per_minute}
                  onChange={(e) => setLocalRateLimitConfig({ 
                    ...localRateLimitConfig, 
                    requests_per_minute: parseInt(e.target.value) || 100
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!localRateLimitConfig.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requests per Hour
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={localRateLimitConfig.requests_per_hour}
                  onChange={(e) => setLocalRateLimitConfig({ 
                    ...localRateLimitConfig, 
                    requests_per_hour: parseInt(e.target.value) || 1000
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!localRateLimitConfig.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requests per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={localRateLimitConfig.requests_per_day}
                  onChange={(e) => setLocalRateLimitConfig({ 
                    ...localRateLimitConfig, 
                    requests_per_day: parseInt(e.target.value) || 10000
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!localRateLimitConfig.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Burst Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={localRateLimitConfig.burst_limit}
                  onChange={(e) => setLocalRateLimitConfig({ 
                    ...localRateLimitConfig, 
                    burst_limit: parseInt(e.target.value) || 20
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!localRateLimitConfig.enabled}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleRateLimitReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </button>
              <button
                onClick={handleRateLimitSave}
                disabled={updateRateLimitConfig.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateRateLimitConfig.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>

          {/* Rate Limit Status */}
          <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Rate Limit Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-900">Normal Traffic</p>
                <p className="text-xs text-green-700">
                  {rateLimitAnalytics?.block_rate ? `${rateLimitAnalytics.block_rate.toFixed(1)}% blocked` : '0% blocked'}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-yellow-900">
                  {rateLimitStatus?.total_blocked || 0} IPs Blocked
                </p>
                <p className="text-xs text-yellow-700">Rate limit exceeded</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-900">
                  {rateLimitAnalytics?.unique_identifiers || 0} Active IPs
                </p>
                <p className="text-xs text-blue-700">Last 24 hours</p>
              </div>
            </div>

            {/* Blocked IPs */}
            {rateLimitStatus?.blocked_ips && rateLimitStatus.blocked_ips.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Currently Blocked IPs</h4>
                <div className="space-y-2">
                  {rateLimitStatus.blocked_ips.map((blocked: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-mono text-sm text-red-900">{blocked.identifier}</span>
                        <span className="text-xs text-red-700 ml-2">
                          Blocked until {new Date(blocked.blocked_until).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleClearRateLimit(blocked.identifier, blocked.endpoint)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit-logs' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Security Audit Logs</h3>
                <p className="text-sm text-gray-600">Detailed log of all security events</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportAuditLogs('csv')}
                  disabled={exportAuditLogs.isPending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExportAuditLogs('json')}
                  disabled={exportAuditLogs.isPending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.resource_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {log.ip_address || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        No audit logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Privacy & Data Controls</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Data Retention</h4>
                  <p className="text-sm text-gray-500">Automatically delete chat logs after specified period</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="never">Never delete</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">IP Address Logging</h4>
                  <p className="text-sm text-gray-500">Log IP addresses for security monitoring</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Anonymous Analytics</h4>
                  <p className="text-sm text-gray-500">Collect anonymized usage statistics</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Data Encryption</h4>
                  <p className="text-sm text-gray-500">Encrypt sensitive data at rest and in transit</p>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-600 font-medium">Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">Compliance & Standards</h3>
                <p className="text-blue-700 mt-1 mb-4">
                  Our platform adheres to industry-standard security and privacy regulations.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    GDPR Compliant
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    SOC 2 Type II
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    ISO 27001
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    CCPA Compliant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}