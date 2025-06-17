import React, { useEffect, useState } from 'react'
import { Mail, AlertTriangle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserSubscription } from '../hooks/useBilling'
import { useSubscriptionStatus } from '../hooks/useStripe'

interface EmailUsageTrackerProps {
  showWarningAt?: number // Percentage at which to show warning (default: 80)
  showInline?: boolean // Whether to show inline or as a card
}

export const EmailUsageTracker: React.FC<EmailUsageTrackerProps> = ({
  showWarningAt = 80,
  showInline = false
}) => {
  const { user } = useAuth()
  const { data: subscriptionData } = useUserSubscription(user?.id || '')
  const { hasActiveSubscription } = useSubscriptionStatus()
  
  const usage = subscriptionData?.usage || []
  const subscription = subscriptionData?.subscription
  const currentPlan = subscription?.subscription_plans
  
  // Get email usage
  const emailUsage = usage.find(u => u.metric_name === 'emails_per_month')?.metric_value || 0
  
  // Get email limit from plan
  const getEmailLimit = () => {
    if (currentPlan?.limits?.emails_per_month) {
      return currentPlan.limits.emails_per_month
    }
    
    // Default to free plan limit
    return 3000
  }
  
  const emailLimit = getEmailLimit()
  const emailPercentage = Math.min((emailUsage / emailLimit) * 100, 100)
  const isApproachingLimit = emailPercentage >= showWarningAt
  const isAtLimit = emailPercentage >= 100
  
  if (!isApproachingLimit) {
    return null
  }
  
  if (showInline) {
    return (
      <div className={`flex items-center p-2 rounded-lg ${
        isAtLimit ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
      }`}>
        <AlertTriangle className={`h-4 w-4 mr-2 ${
          isAtLimit ? 'text-red-500' : 'text-yellow-500'
        }`} />
        <span className="text-sm">
          {isAtLimit 
            ? 'Email limit reached' 
            : `${Math.round(emailPercentage)}% of email limit used`}
        </span>
        {!hasActiveSubscription && (
          <Link
            to="/pricing"
            className={`ml-2 text-xs font-medium ${
              isAtLimit ? 'text-red-800' : 'text-yellow-800'
            } hover:underline`}
          >
            Upgrade
          </Link>
        )}
      </div>
    )
  }
  
  return (
    <div className={`border rounded-lg p-4 ${
      isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start">
        <AlertTriangle className={`h-5 w-5 ${
          isAtLimit ? 'text-red-600' : 'text-yellow-600'
        } mt-0.5 mr-3`} />
        <div>
          <h4 className={`text-sm font-medium ${
            isAtLimit ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {isAtLimit ? 'Email Limit Reached' : 'Approaching Email Limit'}
          </h4>
          <p className={`text-sm ${
            isAtLimit ? 'text-red-700' : 'text-yellow-700'
          } mt-1`}>
            {isAtLimit 
              ? `You've used all ${emailLimit.toLocaleString()} emails for this month.` 
              : `You've used ${emailUsage.toLocaleString()} of ${emailLimit.toLocaleString()} emails (${Math.round(emailPercentage)}%).`}
          </p>
          
          {!hasActiveSubscription && (
            <Link
              to="/pricing"
              className={`mt-2 inline-flex items-center text-sm font-medium ${
                isAtLimit ? 'text-red-800' : 'text-yellow-800'
              } hover:underline`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Upgrade your plan
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}