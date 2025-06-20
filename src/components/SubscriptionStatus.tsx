import React from "react";
import {
  Crown,
  Zap,
  Building2,
  Sparkles,
  Calendar,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useBilling } from "../hooks/useBilling";
import { useStripe } from "../hooks/useStripe";
import { stripeConfig } from "../stripe-config";

const SubscriptionStatus: React.FC = () => {
  const { subscription, usage, isLoading } = useBilling();
  const {
    createCheckoutSession,
    createPortalSession,
    isLoading: stripeLoading,
  } = useStripe();

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "free":
        return <Sparkles className="w-6 h-6 text-gray-500" />;
      case "starter":
        return <Zap className="w-6 h-6 text-blue-500" />;
      case "growth":
        return <Crown className="w-6 h-6 text-purple-500" />;
      case "business":
        return <Building2 className="w-6 h-6 text-indigo-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPlanDetails = (planName: string) => {
    return stripeConfig.products.find((p) =>
      p.name.toLowerCase().includes(planName.toLowerCase())
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUsagePercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 bg-red-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const handleUpgrade = async () => {
    const currentPlan = getPlanDetails(subscription?.plan_name || "free");
    const currentIndex = stripeConfig.products.findIndex(
      (p) => p.name === currentPlan?.name
    );
    const nextPlan = stripeConfig.products[currentIndex + 1];
    if (nextPlan) {
      await createCheckoutSession(nextPlan.priceId);
    }
  };

  const handleDowngrade = async () => {
    const currentPlan = getPlanDetails(subscription?.plan_name || "free");
    const currentIndex = stripeConfig.products.findIndex(
      (p) => p.name === currentPlan?.name
    );
    const previousPlan = stripeConfig.products[currentIndex - 1];
    if (previousPlan) {
      await createCheckoutSession(previousPlan.priceId);
    }
  };

  const handleManageBilling = async () => {
    await createPortalSession();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = getPlanDetails(subscription?.plan_name || "free");
  const isFreePlan =
    subscription?.plan_name === "free" || !subscription?.plan_name;
  const isTrialing = subscription?.status === "trialing";
  const isCanceled = subscription?.cancel_at_period_end;

  const totalAvailableTokens =
    (usage?.available_tokens || 0) + (usage?.tokens_used || 0);
  const tokenUsagePercent = getUsagePercentage(
    usage?.tokens_used || 0,
    totalAvailableTokens
  );

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getPlanIcon(subscription?.plan_name || "free")}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentPlan?.name || "Free Plan"}
              </h3>
              <p className="text-sm text-gray-500">
                {currentPlan?.description ||
                  "Basic features to get you started"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${currentPlan?.price || 0}
            </div>
            <div className="text-sm text-gray-500">
              /{currentPlan?.interval || "month"}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-wrap gap-2 mb-6">
          {isTrialing && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Calendar className="w-3 h-3 mr-1" />
              Trial Period
            </span>
          )}
          {isCanceled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Cancels {formatDate(subscription?.current_period_end)}
            </span>
          )}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              subscription?.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {subscription?.status || "Free"}
          </span>
        </div>

        {/* Billing Info */}
        {subscription?.current_period_end && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isCanceled ? "Access until" : "Next billing date"}:
              </span>
              <span className="font-medium text-gray-900">
                {formatDate(subscription.current_period_end)}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          {isFreePlan ? (
            <button
              onClick={handleUpgrade}
              disabled={stripeLoading}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stripeLoading ? "Processing..." : "Upgrade Plan"}
            </button>
          ) : (
            <>
              <button
                onClick={handleManageBilling}
                disabled={stripeLoading}
                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                {stripeLoading ? "Processing..." : "Manage Billing"}
              </button>
              {!isCanceled && (
                <button
                  onClick={handleUpgrade}
                  disabled={stripeLoading}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stripeLoading ? "Processing..." : "Upgrade Plan"}
                </button>
              )}
              <button
                onClick={handleDowngrade}
                disabled={stripeLoading}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stripeLoading ? "Processing..." : "Downgrade Plan"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Usage Overview */}
      {usage && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Overview
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Tokens used</span>
              <span className="text-gray-500">
                {(usage.tokens_used || 0).toLocaleString()} /{" "}
                {totalAvailableTokens.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${tokenUsagePercent}%` }}
              />
            </div>
            <div
              className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${getUsageColor(
                tokenUsagePercent
              )}`}
            >
              {tokenUsagePercent.toFixed(1)}% used
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Recommendations */}
      {usage && currentPlan && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Optimization Recommendations
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            {getUsagePercentage(
              usage.tokens_used || 0,
              currentPlan.limits.tokens_per_month
            ) > 80 && (
              <p>
                • Consider upgrading for more tokens to avoid service
                interruption
              </p>
            )}
            {getUsagePercentage(
              usage.chatbots_created || 0,
              currentPlan.limits.max_chatbots
            ) > 80 && (
              <p>
                • You're approaching your chatbot limit - upgrade to create more
              </p>
            )}
            {getUsagePercentage(
              usage.documents_uploaded || 0,
              currentPlan.limits.max_documents
            ) > 80 && (
              <p>
                • Running low on document uploads - consider a higher tier plan
              </p>
            )}
            {isFreePlan && (
              <p>
                • Upgrade to unlock GPT-4, more tokens, and advanced features
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
