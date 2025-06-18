import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface EmailConfirmationRequiredProps {
  email?: string;
}

export function EmailConfirmationRequired({ email }: EmailConfirmationRequiredProps) {
  const { resendConfirmation } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  const handleResendConfirmation = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendStatus('idle');
    setResendMessage('');

    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        setResendStatus('error');
        setResendMessage(error.message || 'Failed to resend confirmation email');
      } else {
        setResendStatus('success');
        setResendMessage('Confirmation email sent successfully! Please check your inbox.');
      }
    } catch (error) {
      setResendStatus('error');
      setResendMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a confirmation link to your email address. Please click the link to verify your account and continue.
          </p>
        </div>

        {/* Email Display */}
        {email && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Confirmation email sent to:</p>
            <p className="font-medium text-gray-900 break-all">{email}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">What to do next:</h3>
          <ol className="text-left text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                1
              </span>
              Check your email inbox (and spam folder)
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                2
              </span>
              Click the "Confirm Email Address\" button in the email
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                3
              </span>
              You'll be redirected back to continue using ChatterWise
            </li>
          </ol>
        </div>

        {/* Resend Button */}
        <div className="mb-6">
          <button
            onClick={handleResendConfirmation}
            disabled={isResending || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend Confirmation Email
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {resendStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">{resendMessage}</p>
            </div>
          </div>
        )}

        {resendStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{resendMessage}</p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500">
          <p className="mb-2">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@chatterwise.ai" className="text-blue-600 hover:underline">
              support@chatterwise.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}