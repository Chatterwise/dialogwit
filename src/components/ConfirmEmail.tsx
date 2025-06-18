import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Home,
  LifeBuoy,
} from "lucide-react";
import Confetti from "react-confetti";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams(); // <-- Fix: use useSearchParams, not useNavigate
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "invalid"
  >("loading");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!tokenHash) {
        setStatus("invalid");
        setMessage("Invalid confirmation link");
        setDetails(
          "The confirmation link is missing required parameters. Please check your email for the correct link."
        );
        return;
      }

      const confirmationType = type || "email";

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: confirmationType as any,
        });

        if (error) {
          setStatus("error");
          setMessage("Email confirmation failed");
          setDetails(
            error.message ||
              "The confirmation link may be expired or invalid. Please try signing up again."
          );
          return;
        }

        if (data.user) {
          setStatus("success");
          setMessage("Email confirmed successfully!");
          setDetails(
            "Your account has been activated. You will be redirected to the dashboard shortly."
          );
          setShowConfetti(true);

          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage("Email confirmation failed");
          setDetails(
            "No user data received. Please try the confirmation process again."
          );
        }
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred");
        setDetails(
          "Please try again or contact support if the problem persists."
        );
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  const handleResendConfirmation = () => {
    navigate("/auth?mode=signup");
  };

  const handleGoToLogin = () => {
    navigate("/auth");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@chatterwise.ai";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
          tweenDuration={5000}
          gravity={0.2}
          style={{ zIndex: 10 }}
        />
      )}
      <div className="max-w-md w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          {/* Status Icon */}
          <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-full">
            {status === "loading" && (
              <div className="bg-blue-100 dark:bg-blue-900/20 w-full h-full rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 dark:bg-green-900/20 w-full h-full rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {(status === "error" || status === "invalid") && (
              <div className="bg-red-100 dark:bg-red-900/20 w-full h-full rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {status === "loading" && "Confirming Your Email..."}
            {status === "success" && "Welcome to ChatterWise! 🎉"}
            {(status === "error" || status === "invalid") &&
              "Confirmation Failed"}
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            {message}
          </p>

          {/* Details */}
          {details && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {details}
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === "success" && (
              <div className="space-y-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You will be automatically redirected in a few seconds...
                </p>
              </div>
            )}

            {(status === "error" || status === "invalid") && (
              <div className="space-y-3">
                <button
                  onClick={handleResendConfirmation}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Resend Confirmation Email
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}

            {status === "loading" && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we confirm your email address...
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Having trouble? Contact our support team for assistance.
            </p>
            <button
              onClick={handleContactSupport}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <LifeBuoy className="w-3 h-3" />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
