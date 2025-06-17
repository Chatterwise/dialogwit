import React, { useState } from "react";
import { Bot, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useEmail } from "../hooks/useEmail";
import { useNavigate } from "react-router-dom";

export const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { signIn, signUp } = useAuth();
  const { sendEmail } = useEmail();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (isResetPassword) {
        // Handle password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        // Send password reset email via Resend
        await sendEmail.mutateAsync({
          to: email,
          subject: "Reset Your ChatterWise Password",
          templateId: "password-reset",
          templateData: {
            resetLink: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`
          }
        });
        
        setSuccessMessage("Check your email for password reset instructions!");
      } else if (isSignUp) {
        // Handle sign up
        const { error } = await signUp(email, password);
        
        if (error) throw error;
        
        setSuccessMessage("Verification email sent! Please check your inbox and verify your email to continue.");
      } else {
        // Handle sign in
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsResetPassword(false);
    setEmail("");
    setPassword("");
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isResetPassword 
              ? "Reset your password" 
              : isSignUp 
                ? "Create your account" 
                : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isResetPassword
              ? "Enter your email to receive reset instructions"
              : isSignUp
                ? "Start building AI-powered chatbots today"
                : "Welcome back to ChatterWise"}
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {!isResetPassword && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!isResetPassword && !isSignUp && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsResetPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {isResetPassword ? (
                    <Mail className="h-4 w-4 mr-2" />
                  ) : isSignUp ? (
                    <User className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {isResetPassword
                    ? "Send Reset Instructions"
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            {isResetPassword ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};