import React from 'react'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'

export const CancelPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Payment Canceled
          </h2>
          
          <p className="text-gray-600 mb-8">
            Your payment was canceled. No charges were made to your account. You can try again anytime.
          </p>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Payment Again
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you're experiencing issues with payment, please contact our support team. We're here to help!
          </p>
          <Link
            to="/support"
            className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  )
}