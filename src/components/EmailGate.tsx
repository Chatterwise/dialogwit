// EmailGate.tsx
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";

type Props = {
  email: string;
  onResend?: () => Promise<void>;
};

export const EmailGate: React.FC<Props> = ({ email, onResend }) => (
  <motion.div
    key="email-gate"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.4 }}
    className={`
      w-full max-w-md mx-auto text-center rounded-2xl shadow-xl p-10
      flex flex-col items-center
      bg-white  border border-gray-200            /* light mode */
      dark:bg-gray-800 dark:border-gray-700       /* dark mode  */
    `}
  >
    {/* icon */}
    <Mail className="h-12 w-12 mb-6 text-primary-600 dark:text-primary-400" />

    {/* heading */}
    <h1 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
      Confirm your e-mail address
    </h1>

    {/* body text */}
    <p className="mb-6 text-gray-600 dark:text-gray-300">
      We’ve sent a verification link to <strong>{email}</strong>.
      <br />
      Click it to activate your account, then come back here.
    </p>

    {/* resend button */}
    {onResend && (
      <button
        onClick={onResend}
        className="
          inline-flex items-center px-4 py-2 rounded-lg font-medium
          bg-primary-600 hover:bg-primary-700 text-white transition-colors
        "
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Resend e-mail
      </button>
    )}
  </motion.div>
);
