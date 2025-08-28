import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Github,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Logo } from "./ui/Logo";
import { useTheme } from "../hooks/useTheme";
import { useLocation } from "react-router-dom";
import { EmailGate } from "./EmailGate";
import { useTranslation } from "../hooks/useTranslation";

const leftBgLight = "bg-gradient-to-br from-primary-500 to-accent-500";
const leftBgDark = "bg-gradient-to-br from-gray-900 to-primary-900";

const rocketVector = (
  <svg width="160" height="160" fill="none" viewBox="0 0 160 160" className="mx-auto mb-8">
    <circle cx="80" cy="80" r="80" fill="white" fillOpacity="0.05" />
    <path d="M80 40l10 40h-20l10-40z" fill="none" stroke="white" strokeWidth="3" />
    <circle cx="80" cy="110" r="6" fill="white" fillOpacity="0.2" />
    <circle cx="60" cy="100" r="3" fill="white" fillOpacity="0.2" />
    <circle cx="100" cy="100" r="3" fill="white" fillOpacity="0.2" />
  </svg>
);

export function Auth() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirm: "", name: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { signInWithGitHub, signInWithDiscord } = useAuth();
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { user, emailConfirmed, loading, signUp, signIn, resetPassword } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const email = params.get("email");
  const password = params.get("password");

  useEffect(() => {
    if (email && password) {
      setForm({ email, password, confirm: "", name: "" });
    }
  }, [email, password]);

  useEffect(() => {
    if (user && !emailConfirmed) setShowEmailConfirmation(true);
    else setShowEmailConfirmation(false);
  }, [user, emailConfirmed]);

  const needsConfirm = showEmailConfirmation || (user && !emailConfirmed);

  if (needsConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <EmailGate
          email={user?.email || form.email}
          onResend={async () => {
            await signUp(form.email, form.password, form.name);
          }}
        />
      </div>
    );
  }

  // Validation
  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = t("auth_error_invalid_email", "Enter a valid email");
    if (mode === "signup" && form.name.trim().length < 2)
      errs.name = t("auth_error_name_required", "Enter your full name");
    if (form.password.length < 6)
      errs.password = t("auth_error_password_length", "Password must be at least 6 characters");
    if (mode === "signup" && form.password !== form.confirm)
      errs.confirm = t("auth_error_password_mismatch", "Passwords do not match");
    return errs;
  };

  // Map backend errors to friendly messages
  const getErrorMessage = (err: unknown): string => {
    const message =
      typeof err === "object" && err !== null && "message" in err && typeof (err as any).message === "string"
        ? (err as any).message
        : "";

    if (message.includes("Invalid login credentials") || message.includes("invalid_credentials"))
      return t(
        "auth_error_invalid_credentials",
        "The email or password you entered is incorrect. Please check your credentials and try again."
      );
    if (message.includes("Email not confirmed"))
      return t(
        "auth_error_email_not_confirmed",
        "Please check your email and click the confirmation link before signing in."
      );
    if (message.includes("User not found"))
      return t(
        "auth_error_user_not_found",
        "No account found with this email address. Please check your email or sign up for a new account."
      );
    if (message.includes("Password should be at least"))
      return t("auth_error_password_length", "Password must be at least 6 characters");
    if (message.includes("Unable to validate email address"))
      return t("auth_error_invalid_email", "Please enter a valid email address.");
    if (message.includes("Email rate limit exceeded"))
      return t("auth_error_rate_limit", "Too many email attempts. Please wait a few minutes before trying again.");
    if (message.includes("Signup is disabled"))
      return t("auth_error_signup_disabled", "Account registration is currently disabled. Please contact support.");
    return message || t("auth_error_generic", "An unexpected error occurred. Please try again.");
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);

    try {
      if (isResetPassword) {
        const { error } = await resetPassword(form.email);
        if (error) setError(getErrorMessage(error));
        else {
          setSuccess(t("auth_reset_sent", "Password reset email sent! Check your inbox and spam folder."));
          setIsResetPassword(false);
        }
      } else if (mode === "signup") {
        const { error } = await signUp(form.email, form.password, form.name);
        if (error) setError(getErrorMessage(error));
        else {
          setSuccess(t("auth_signup_success", "Account created! Please check your email to confirm your account."));
          setShowEmailConfirmation(true);
        }
      } else {
        const { error } = await signIn(form.email, form.password);
        if (error) setError(getErrorMessage(error));
      }
    } catch {
      setError(t("auth_error_generic", "An unexpected error occurred. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch font-sans transition-colors duration-500">
      {/* Left Side */}
      <div
        className={`relative w-1/2 hidden lg:flex flex-col justify-center px-20 py-12 ${
          theme === "dark" ? leftBgDark : leftBgLight
        } transition-colors duration-500`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode + String(isResetPassword)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
            className="text-center text-white max-w-lg mx-auto"
          >
            {rocketVector}
            <h2 className="text-4xl font-bold mb-6 font-display tracking-tight">
              {isResetPassword
                ? t("auth_left_title_reset", "Reset Password")
                : mode === "signup"
                ? t("auth_left_title_signup", "Join ChatterWise today!")
                : t("auth_left_title_login", "Welcome back!")}
            </h2>
            <p className="text-lg leading-relaxed">
              {isResetPassword
                ? t("auth_left_desc_reset", "Enter your email to receive a password reset link.")
                : mode === "signup"
                ? t(
                    "auth_left_desc_signup",
                    "Build intelligent, scalable chatbots with ease. Enjoy seamless integration, powerful AI features, and secure, scalable infrastructure."
                  )
                : t(
                    "auth_left_desc_login",
                    "Empower your workflow with AI-driven chatbots. Sign in to access your personalized dashboard and start creating."
                  )}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Side */}
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 transition-colors duration-500 p-6">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-between items-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Mode Switch */}
          <div className="flex justify-center mb-8 space-x-4">
            <button
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                !isResetPassword && mode === "login"
                  ? "bg-primary-600 text-white shadow"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300"
              }`}
              onClick={() => {
                setMode("login");
                setIsResetPassword(false);
                setError("");
                setSuccess("");
              }}
            >
              {t("auth_tab_signin", "Sign In")}
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                !isResetPassword && mode === "signup"
                  ? "bg-primary-600 text-white shadow"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300"
              }`}
              onClick={() => {
                setMode("signup");
                setIsResetPassword(false);
                setError("");
                setSuccess("");
              }}
            >
              {t("auth_tab_signup", "Sign Up")}
            </button>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isResetPassword ? "reset" : mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-6"
              autoComplete="off"
            >
              {success && (
                <div className="flex items-center bg-green-50 border border-green-200 text-green-800 rounded-xl p-3">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="flex items-center bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {!isResetPassword && mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("auth_label_full_name", "Full Name")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                        errors.name ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                      }`}
                      placeholder={t("auth_placeholder_full_name", "Enter your full name")}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("auth_label_email", "E-mail")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                      errors.email ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                    }`}
                    placeholder={t("auth_placeholder_email", "Enter your e-mail address")}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {!isResetPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("auth_label_password", "Password")}{" "}
                    {mode === "signup" && (
                      <span className="text-xs text-gray-500 ml-1">
                        {t("auth_hint_min_chars", "(minimum 6 characters)")}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                        errors.password ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                      }`}
                      placeholder={t("auth_placeholder_password", "Enter your password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      aria-label={t("auth_toggle_password", "Toggle password visibility")}
                      title={t("auth_toggle_password", "Toggle password visibility")}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
              )}

              {!isResetPassword && mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("auth_label_confirm_password", "Confirm Password")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm"
                      value={form.confirm}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition ${
                        errors.confirm ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                      }`}
                      placeholder={t("auth_placeholder_confirm_password", "Confirm your password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      aria-label={t("auth_toggle_confirm_password", "Toggle confirm password visibility")}
                      title={t("auth_toggle_confirm_password", "Toggle confirm password visibility")}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
                </div>
              )}

              {mode === "signup" && !isResetPassword && (
                <div className="flex items-center mt-2">
                  <input type="checkbox" required className="mr-2 accent-primary-600 rounded" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t("auth_terms_prefix", "By signing up you agree")}{" "}
                    <a href="#" className="underline">
                      {t("auth_terms_link", "Terms & Conditions")}
                    </a>
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow transition-colors duration-200 flex items-center justify-center"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : isResetPassword ? (
                  t("auth_cta_send_reset", "Send Reset Link")
                ) : mode === "signup" ? (
                  t("auth_cta_signup", "Sign Up")
                ) : (
                  t("auth_cta_signin", "Sign In")
                )}
                {!submitting && !isResetPassword && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">
                {t("auth_or", "or")}
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button
              type="button"
              onClick={signInWithGitHub}
              className="py-2 px-4 flex-1 min-w-[240px] flex justify-center items-center bg-gray-800 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-200 text-white transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
              aria-label={t("auth_oauth_github", "Sign in with GitHub")}
              title={t("auth_oauth_github", "Sign in with GitHub")}
            >
              <Github className="h-5 w-5 mr-2" />
              {t("auth_oauth_github", "Sign in with GitHub")}
            </button>

            <button
              type="button"
              onClick={signInWithDiscord}
              className="py-2 px-4 flex-1 min-w-[240px] flex justify-center items-center bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-lg"
              aria-label={t("auth_oauth_discord", "Continue with Discord")}
              title={t("auth_oauth_discord", "Continue with Discord")}
            >
              {/* discord svg unchanged */}
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 -28.5 256 256">
                <g>
                  <path
                    d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                    fill="#5865F2"
                    fillRule="nonzero"
                  />
                </g>
              </svg>
              <span>{t("auth_oauth_discord", "Continue with Discord")}</span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {!isResetPassword && (
              <button
                onClick={() => {
                  setIsResetPassword(true);
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                {t("auth_forgot_password", "Forgot your password?")}
              </button>
            )}
            <div className="text-sm text-gray-600">
              {isResetPassword ? (
                <button
                  onClick={() => {
                    setIsResetPassword(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {t("auth_back_to_signin", "Back to sign in")}
                </button>
              ) : mode === "signup" ? (
                <>
                  {t("auth_have_account", "Already have an account?")}{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {t("auth_signin", "Sign in")}
                  </button>
                </>
              ) : (
                <>
                  {t("auth_no_account", "Don't have an account?")}{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {t("auth_signup", "Sign up")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
