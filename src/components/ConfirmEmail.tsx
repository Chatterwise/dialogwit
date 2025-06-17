import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const confirmUserEmail = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash.substring(1);
        
        if (!hash) {
          setStatus('error');
          setError('Invalid or missing confirmation token');
          return;
        }
        
        // Parse the hash to get the access_token and type
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const tokenType = params.get('type');
        
        if (!accessToken || tokenType !== 'signup') {
          setStatus('error');
          setError('Invalid confirmation link');
          return;
        }
        
        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: 'signup',
        });
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } catch (err) {
        console.error('Error confirming email:', err);
        setStatus('error');
        setError('Failed to confirm email. The link may have expired.');
      }
    };
    
    confirmUserEmail();
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Confirming your email...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-900">
              Email Confirmed!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully confirmed. You will be redirected to the login page in a few seconds.
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Login
            </Link>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-900">
              Confirmation Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'There was an error confirming your email.'}
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </Link>
              <div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};