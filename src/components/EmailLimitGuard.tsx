import React, { useState, useEffect } from 'react'
import { AlertTriangle, Mail, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEmailUsage } from '../hooks/useEmailUsage'

interface EmailLimitGuardProps {
  children: React.ReactNode
  onLimitReached?: () => void
  emailCount?: number // Number of emails this action will send
}

export const EmailLimitGuard: React.FC<EmailLimitGuardProps> = ({
  children,
  onLimitReached,
  emailCount = 1
}) => {
  const { user } = useAuth()
  const { checkEmailAllowed } = useEmailUsage()
  const [emailsAllowed, setEmailsAllowed] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkEmails = async () => {
      setChecking(true)
      try {
        const allowed = await checkEmailAllowed()
        setEmailsAllowed(allowed)
        
        if (!allowed) {
          onLimitReached?.()
        }
      } catch (error) {
        console.error('Failed to check email limit:', error)
        setEmailsAllowed(false)
      } finally {
        setChecking(false)
      }
    }
    
    if (user) {
      checkEmails()
    }
  }, [user, emailCount])

  if (checking) {
    return <>{children}</>
  }

  if (emailsAllowed === false) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-1 mr-3" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-900">
              Email limit reached
            </h3>
            <p className="text-red-700 mt-1">
              You've reached your email limit for this month. Upgrade your plan to send more emails.
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