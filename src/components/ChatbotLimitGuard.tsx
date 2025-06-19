import React, { useState, useEffect } from "react";
import { AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSubscriptionStatus } from "../hooks/useStripe";
import { useUsageLimitCheck } from "../hooks/useUsageLimitCheck";

interface ChatbotLimitGuardProps {
  children: React.ReactNode;
  onLimitReached?: () => void;
}

export const ChatbotLimitGuard: React.FC<ChatbotLimitGuardProps> = ({
  children,
  onLimitReached,
}) => {
  const { user } = useAuth();
  const { checkLimit, isLoading } = useUsageLimitCheck();
  const { hasActiveSubscription } = useSubscriptionStatus();
  const [chatbotsAllowed, setChatbotsAllowed] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkChatbotLimit = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const allowed = await checkLimit("chatbots");
        setChatbotsAllowed(allowed);

        if (!allowed) {
          onLimitReached?.();
        }
      } catch (error) {
        console.error("Failed to check chatbot limit:", error);
        setChatbotsAllowed(true); // Allow by default on error to prevent blocking
      } finally {
        setChecking(false);
      }
    };

    if (user) {
      checkChatbotLimit();
    } else {
      setChecking(false);
    }
  }, [user, checkLimit, onLimitReached]);

  if (checking || isLoading) {
    return <>{children}</>;
  }

  if (chatbotsAllowed === false) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-1 mr-3" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-900">
              Chatbot limit reached
            </h3>
            <p className="text-red-700 mt-1">
              You've reached the maximum number of chatbots allowed on your
              current plan. Upgrade to create more chatbots.
            </p>

            <div className="mt-4">
              <Link
                to="/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
