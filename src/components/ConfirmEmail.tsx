import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      // Check if we have the required parameters
      if (!tokenHash) {
        setStatus('invalid');
        setMessage('Invalid confirmation link');
        setDetails('The confirmation link is missing required parameters. Please check your email for the correct link.');
        return;
      }

      // If type is missing, add it as 'email' (common case)
      const confirmationType = type || 'email';

      try {
        console.log('Confirming email with token hash:', tokenHash, 'type:', confirmationType);

        // Use Supabase's verifyOtp method for email confirmation
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: confirmationType as any
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage('Email confirmation failed');
          setDetails(error.message || 'The confirmation link may be expired or invalid. Please try signing up again.');
          return;
        }

        if (data.user) {
          console.log('Email confirmed successfully for user:', data.user.id);
          setStatus('success');
          setMessage('Email confirmed successfully!');
          setDetails('Your account has been activated. You will be redirected to the dashboard shortly.');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Email confirmation failed');
          setDetails('No user data received. Please try the confirmation process again.');
        }

      } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setDetails('Please try again or contact support if the problem persists.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  const handleResendConfirmation = () => {
    navigate('/auth?mode=signup');
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full">
            {status === 'loading' && (
              <div className="bg-blue-100 w-full h-full rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 w-full h-full rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {(status === 'error' || status === 'invalid') && (
              <div className="bg-red-100 w-full h-full rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Confirming Your Email...'}
            {status === 'success' && 'Email Confirmed!'}
            {(status === 'error' || status === 'invalid') && 'Confirmation Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-2">{message}</p>
          
          {/* Details */}
          {details && (
            <p className="text-sm text-gray-500 mb-6">{details}</p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <p className="text-xs text-gray-500">
                  You will be automatically redirected in a few seconds...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={handleResendConfirmation}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Resend Confirmation Email
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}

            {status === 'invalid' && (
              <div className="space-y-3">
                <button
                  onClick={handleResendConfirmation}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Get New Confirmation Email
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-sm text-gray-500">
                Please wait while we confirm your email address...
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Having trouble? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}