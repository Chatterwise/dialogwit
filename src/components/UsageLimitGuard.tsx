import React, { useState, useEffect } from 'react'
import { AlertTriangle, Zap, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUsageCheck } from '../hooks/useBilling'
import { useSubscriptionStatus } from '../hooks/useStripe'

interface UsageLimitGuardProps {
  metricName: string
  children: React.ReactNode
  onLimitReached?: () => void
  showWarningAt?: number // Percentage at which to show warning (default: 80)
}

export const UsageLimitGuard: React.FC<UsageLimitGuardProps> = ({
  metricName,
  children,
  onLimitReached,
  showWarningAt = 80
}) => {
  const { user } = useAuth()
  const { subscription, hasActiveSubscription } = useSubscriptionStatus()
  const usageCheck = useUsageCheck()
  const [usageData, setUsageData] = useState<any>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  useEffect(() => {
    if (user?.id) {
      checkUsage()
    }
  }, [user?.id, metricName])

  const checkUsage = async () => {
    try {
      const result = await usageCheck.mutateAsync(metricName)
      setUsageData(result)
      
      if (!result.allowed) {
        setShowUpgradePrompt(true)
        onLimitReached?.()
      }
    } catch (error) {
      console.error('Failed to check usage:', error)
    }
  }

  if (!usageData) {
    return <>{children}</>
  }

  // If usage is allowed, render children
  if (usageData.allowed) {
    // Show warning if approaching limit
    if (usageData.percentage_used >= showWarningAt && usageData.limit !== -1) {
      return (
        <>
          {children}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Approaching {metricName.replace('_', ' ')} limit
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You've used {usageData.current_usage} of {usageData.limit} ({usageData.percentage_used}%). 
                  Consider upgrading to avoid interruptions.
                </p>
                <Link
                  to="/pricing"
                  className="mt-2 inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  View upgrade options →
                </Link>
              </div>
            </div>
          </div>
        </>
      )
    }
    
    return <>{children}</>
  }

  // Usage limit reached - show upgrade prompt
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-red-600 mt-1 mr-3" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-900">
            {metricName.replace('_', ' ')} limit reached
          </h3>
          <p className="text-red-700 mt-1">
            You've reached your {metricName.replace('_', ' ')} limit of {usageData.limit} for this billing period.
            Upgrade your plan to continue using this feature.
          </p>
          
          <div className="mt-4">
            <Link
              to="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to check usage before performing actions
export const useUsageLimitCheck = () => {
  const usageCheck = useUsageCheck()

  const checkLimit = async (metricName: string): Promise<boolean> => {
    try {
      const result = await usageCheck.mutateAsync(metricName)
      return result.allowed
    } catch (error) {
      console.error('Failed to check usage limit:', error)
      return false
    }
  }

  return { checkLimit, isLoading: usageCheck.isPending }
}