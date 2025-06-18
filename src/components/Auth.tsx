import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { EmailConfirmationRequired } from './EmailConfirmationRequired';

export function Auth() {
  const { signUp, signIn, resetPassword, user, emailConfirmed, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  // Check if user needs email confirmation
  useEffect(() => {
    if (user && !emailConfirmed) {
      setShowEmailConfirmation(true);
    } else {
      setShowEmailConfirmation(false);
    }
  }, [user, emailConfirmed]);

  // Show email confirmation screen if needed
  if (showEmailConfirmation && user?.email) {
    return <EmailConfirmationRequired email={user.email} />;
  }

  // Don't render auth form if user is authenticated and email is confirmed
  if (user && emailConfirmed) {
    return null; // Let the main app handle routing
  }

  const getErrorMessage = (error: any): string => {
    const message = error?.message || '';
    
    // Handle specific authentication errors with user-friendly messages
    if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
      return 'The email or password you entered is incorrect. Please check your credentials and try again.';
    }
    
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    if (message.includes('User not found')) {
      return 'No account found with this email address. Please check your email or sign up for a new account.';
    }
    
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    
    if (message.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    
    if (message.includes('Email rate limit exceeded')) {
      return 'Too many email attempts. Please wait a few minutes before trying again.';
    }
    
    if (message.includes('Signup is disabled')) {
      return 'Account registration is currently disabled. Please contact support.';
    }
    
    // Return original message for other errors
    return message || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isResetPassword) {
        const { error } = await resetPassword(formData.email);
        if (error) {
          setError(getErrorMessage(error));
        } else {
          setSuccessMessage('Password reset email sent! Check your inbox and spam folder.');
          setIsResetPassword(false);
        }
      } else if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          setError(getErrorMessage(error));
        } else {
          setSuccessMessage('Account created! Please check your email to confirm your account.');
          setShowEmailConfirmation(true);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(getErrorMessage(error));
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isResetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isResetPassword 
              ? 'Enter your email to receive a password reset link'
              : isSignUp 
                ? 'Sign up to start building amazing chatbots'
                : 'Sign in to your ChatterWise account'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800 mb-2">{error}</p>
                {error.includes('email or password you entered is incorrect') && !isSignUp && (
                  <div className="text-xs text-red-700 space-y-1">
                    <p>• Double-check your email address for typos</p>
                    <p>• Make sure your password is correct</p>
                    <p>• Try using the "Forgot Password" option if needed</p>
                  </div>
                )}
                {error.includes('No account found') && (
                  <div className="text-xs text-red-700">
                    <p>Consider creating a new account using the "Sign up" option below.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mr-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Info Message for Sign In */}
        {!isSignUp && !isResetPassword && !error && !successMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="mb-1">New to ChatterWise?</p>
                <p className="text-xs">Create an account to start building intelligent chatbots for your business.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name (Sign Up Only) */}
          {isSignUp && !isResetPassword && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password (Not for Reset Password) */}
          {!isResetPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
                {isSignUp && (
                  <span className="text-xs text-gray-500 ml-1">(minimum 6 characters)</span>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {isResetPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          {!isResetPassword && (
            <button
              onClick={() => setIsResetPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot your password?
            </button>
          )}
          
          <div className="text-sm text-gray-600">
            {isResetPassword ? (
              <button
                onClick={() => {
                  setIsResetPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Back to sign in
              </button>
            ) : isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}