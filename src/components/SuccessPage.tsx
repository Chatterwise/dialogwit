import React, { useEffect } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

export const SuccessPage = () => {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Invalidate subscription queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['stripe-subscription'] })
    queryClient.invalidateQueries({ queryKey: ['stripe-orders'] })
  }, [queryClient])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          
          <p className="text-gray-600 mb-8">
            Thank you for your subscription. Your account has been upgraded and you now have access to all premium features.
          </p>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-500">Session ID</p>
              <p className="text-sm font-mono text-gray-900 break-all">{sessionId}</p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <Link
              to="/chatbots"
              className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Create Your First Chatbot
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• Create and customize your chatbots</li>
            <li>• Upload your knowledge base content</li>
            <li>• Integrate with your website or app</li>
            <li>• Monitor analytics and performance</li>
          </ul>
        </div>
      </div>
    </div>
  )
}