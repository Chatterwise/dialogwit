import React, { useState } from 'react'
import { Mail, Loader, AlertTriangle } from 'lucide-react'
import { useEmailUsage } from '../hooks/useEmailUsage'

interface EmailSendButtonProps {
  onClick: () => Promise<void>
  children?: React.ReactNode
  emailCount?: number
  className?: string
  disabled?: boolean
}

export const EmailSendButton: React.FC<EmailSendButtonProps> = ({
  onClick,
  children = 'Send Email',
  emailCount = 1,
  className = '',
  disabled = false
}) => {
  const { trackEmail, isLoading } = useEmailUsage()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setSending(true)
    setError(null)
    
    try {
      // First check if we can send emails
      const result = await trackEmail(emailCount)
      
      if (!result.allowed) {
        setError('Email limit reached. Please upgrade your plan to send more emails.')
        return
      }
      
      // If allowed, proceed with the actual send
      await onClick()
    } catch (err) {
      setError('Failed to send email. Please try again.')
      console.error('Email send error:', err)
    } finally {
      setSending(false)
    }
  }

  const isDisabled = disabled || sending || isLoading

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {sending || isLoading ? (
          <Loader className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Mail className="h-4 w-4 mr-2" />
        )}
        {sending ? 'Sending...' : children}
      </button>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  )
}