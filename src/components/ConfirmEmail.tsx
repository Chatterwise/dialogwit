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
import { useTranslation } from "../hooks/useTranslation";

export default function ConfirmEmail() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
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
        setMessage(
          t("confirm_email.invalid_link_title", "Invalid confirmation link")
        );
        setDetails(
          t(
            "confirm_email.invalid_link_details",
            "The confirmation link is missing required parameters. Please check your email for the correct link."
          )
        );
        return;
      }

      const confirmationType = (type || "email") as any;

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: confirmationType,
        });

        if (error) {
          setStatus("error");
          setMessage(
            t("confirm_email.failed_title", "Email confirmation failed")
          );
          setDetails(
            error.message ||
              t(
                "confirm_email.failed_details_default",
                "The confirmation link may be expired or invalid. Please try signing up again."
              )
          );
          return;
        }

        if (data.user) {
          setStatus("success");
          setMessage(
            t("confirm_email.success_message", "Email confirmed successfully!")
          );
          setDetails(
            t(
              "confirm_email.success_details",
              "Your account has been activated. You will be redirected to the dashboard shortly."
            )
          );
          setShowConfetti(true);

          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            t("confirm_email.failed_title", "Email confirmation failed")
          );
          setDetails(
            t(
              "confirm_email.no_user_details",
              "No user data received. Please try the confirmation process again."
            )
          );
        }
      } catch {
        setStatus("error");
        setMessage(
          t(
            "confirm_email.unexpected_error_title",
            "An unexpected error occurred"
          )
        );
        setDetails(
          t(
            "confirm_email.unexpected_error_details",
            "Please try again or contact support if the problem persists."
          )
        );
      }
    };

    confirmEmail();
  }, [searchParams, navigate, t]);

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
    window.location.href = "mailto:support@chatterwise.io";
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
          <div
            className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-full"
            aria-hidden="true"
          >
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
            {status === "loading" &&
              t("confirm_email.title_loading", "Confirming Your Email...")}
            {status === "success" &&
              t("confirm_email.title_success", "Welcome to ChatterWise! 🎉")}
            {(status === "error" || status === "invalid") &&
              t("confirm_email.title_failed", "Confirmation Failed")}
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
                  {t("confirm_email.go_to_dashboard", "Go to Dashboard")}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t(
                    "confirm_email.auto_redirect_hint",
                    "You will be automatically redirected in a few seconds..."
                  )}
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
                  {t("confirm_email.resend_email", "Resend Confirmation Email")}
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t("confirm_email.back_to_login", "Back to Login")}
                </button>
              </div>
            )}

            {status === "loading" && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  "confirm_email.please_wait",
                  "Please wait while we confirm your email address..."
                )}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t(
                "confirm_email.help_text",
                "Having trouble? Contact our support team for assistance."
              )}
            </p>
            <button
              onClick={handleContactSupport}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <LifeBuoy className="w-3 h-3" />
              {t("confirm_email.contact_support", "Contact Support")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
