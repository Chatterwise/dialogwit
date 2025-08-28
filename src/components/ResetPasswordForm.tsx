import React, { useState } from 'react';
import { Lock, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthEmail } from '../hooks/useAuthEmail';
import { useTranslation } from "../hooks/useTranslation";

export const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthEmail();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(
        t("resetPassword.errors.missingToken", "Invalid or missing reset token")
      );
      return;
    }

    if (password.length < 8) {
      setError(
        t(
          "resetPassword.errors.tooShort",
          "Password must be at least 8 characters long"
        )
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.errors.mismatch", "Passwords do not match"));
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(
        t(
          "resetPassword.errors.generic",
          "Failed to reset password. The link may have expired."
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("resetPassword.header.title", "Reset Your Password")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t(
              "resetPassword.header.subtitle",
              "Enter your new password below"
            )}
          </p>
        </div>

        {error && (
          <div
            className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <div
            className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-4"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {t(
                    "resetPassword.success.title",
                    "Password reset successful!"
                  )}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {t(
                    "resetPassword.success.redirect",
                    "You will be redirected to the login page in a few seconds."
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {t("resetPassword.labels.newPassword", "New Password")}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-describedby="password-hint password-complexity"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={t(
                      "resetPassword.placeholders.newPassword",
                      "Enter new password"
                    )}
                  />
                  <Lock
                    className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <p
                  id="password-hint"
                  className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                >
                  {t(
                    "resetPassword.hints.length",
                    "Password must be at least 8 characters long"
                  )}
                </p>
                <p
                  id="password-complexity"
                  className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                >
                  {t(
                    "resetPassword.hints.complexity",
                    "For best security, include a number, a symbol, and a mix of upper/lowercase letters."
                  )}
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {t(
                    "resetPassword.labels.confirmPassword",
                    "Confirm Password"
                  )}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={t(
                      "resetPassword.placeholders.confirmPassword",
                      "Confirm new password"
                    )}
                  />
                  <Lock
                    className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={resetPassword.isPending}
                aria-busy={resetPassword.isPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {resetPassword.isPending ? (
                  <>
                    <span className="sr-only">
                      {t(
                        "resetPassword.buttons.resetting",
                        "Resetting password..."
                      )}
                    </span>
                    <div
                      className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t("resetPassword.buttons.reset", "Reset Password")}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
