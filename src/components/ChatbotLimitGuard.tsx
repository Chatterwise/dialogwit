import React, { useState, useEffect } from 'react'
import { AlertTriangle, Bot, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUsageCheck } from '../hooks/useBilling'
import { useSubscriptionStatus } from '../hooks/useStripe'

interface ChatbotLimitGuardProps {
  children: React.ReactNode
  onLimitReached?: () => void
}

export const ChatbotLimitGuard: React.FC<ChatbotLimitGuardProps> = ({
  children,
  onLimitReached
}) => {
  const { user } = useAuth()
  const { checkLimit, isLoading } = useUsageLimitCheck()
  const { hasActiveSubscription } = useSubscriptionStatus()
  const [chatbotsAllowed, setChatbotsAllowed] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkChatbotLimit = async () => {
      if (!user) return;
      
      setChecking(true)
      try {
        const allowed = await checkLimit('chatbots')
        setChatbotsAllowed(allowed)
        
        if (!allowed) {
          onLimitReached?.()
        }
      } catch (error) {
        console.error('Failed to check chatbot limit:', error)
        setChatbotsAllowed(false)
      } finally {
        setChecking(false)
      }
    }
    
    if (user) {
      checkChatbotLimit()
    }
  }, [user])

  if (checking || isLoading) {
    return <>{children}</>
  }

  if (chatbotsAllowed === false) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-1 mr-3" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-900">
              Chatbot limit reached
            </h3>
            <p className="text-red-700 mt-1">
              You've reached the maximum number of chatbots allowed on your current plan. 
              Upgrade to create more chatbots.
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

  return <>{children}</>
}

// Hook to check usage limits before performing actions
export const useUsageLimitCheck = () => {
  const usageCheck = useUsageCheck()
  const [lastCheckTime, setLastCheckTime] = useState<Record<string, number>>({})
  const THROTTLE_TIME = 60000; // 1 minute in milliseconds

  const checkLimit = async (metricName: string): Promise<boolean> => {
    try {
      const now = Date.now();
      const lastCheck = lastCheckTime[metricName] || 0;
      
      // Throttle checks to prevent spamming
      if (now - lastCheck < THROTTLE_TIME) {
        console.log(`Throttled usage check for ${metricName}, using cached result`);
        // Return true by default if we're throttling to prevent blocking user actions
        return true;
      }
      
      // Update last check time
      setLastCheckTime(prev => ({
        ...prev,
        [metricName]: now
      }));
      
      const result = await usageCheck.mutateAsync(metricName)
      return result.allowed
    } catch (error) {
      console.error('Failed to check usage limit:', error)
      // Return true on error to prevent blocking user actions
      return true
    }
  }

  return { checkLimit, isLoading: usageCheck.isPending }
}