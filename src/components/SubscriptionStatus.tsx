import React from "react";
import {
  Crown,
  Zap,
  Building2,
  Sparkles,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useBilling } from "../hooks/useBilling";
import { useStripe } from "../hooks/useStripe";
import { stripeConfig } from "../stripe-config";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

const SubscriptionStatus: React.FC = () => {
  const { t } = useTranslation();
  const { subscription, usage, isLoading } = useBilling();
  const { createCheckoutSession, isLoading: stripeLoading } = useStripe();
  const navigate = useNavigate();
  const { lang = "en" } = useParams<{ lang: string }>();
  const langPrefix = `/${lang}`;

  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    de: "de-DE",
    hu: "hu-HU",
  };
  const locale = localeMap[lang] ?? "en-US";

  // helper to normalise backend slugs to our i18n keys
  const normalisePlanKey = (name?: string) => {
    const n = (name ?? "").toLowerCase().trim();
    if (n.startsWith("plan_")) return n;
    switch (n) {
      case "free": return "plan_free";
      case "starter": return "plan_starter";
      case "growth": return "plan_growth";
      case "business": return "plan_business";
      default: return n; // unknown: leave as-is
    }
  };
  
  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "free":
        return (
          <Sparkles
            className="w-6 h-6 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
        );
      case "starter":
        return (
          <Zap
            className="w-6 h-6 text-blue-500 dark:text-blue-400"
            aria-hidden="true"
          />
        );
      case "growth":
        return (
          <Crown
            className="w-6 h-6 text-purple-500 dark:text-purple-400"
            aria-hidden="true"
          />
        );
      case "business":
        return (
          <Building2
            className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
            aria-hidden="true"
          />
        );
      default:
        return (
          <Sparkles
            className="w-6 h-6 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
        );
    }
  };

  const handlePricingNavigation = () => navigate(`${langPrefix}/pricing`);

  /** Resolve the current plan from config using key first, then display_name. */
  const planKey = normalisePlanKey(subscription?.plan_name);
  const currentPlan =
    stripeConfig.products.find(p => p.name === planKey) ??
    stripeConfig.products.find(
      p => t(p.name).toLowerCase() === (subscription?.display_name ?? "").toLowerCase()
    ) ??
    null;

  const getPlanDetails = (planName: string) => {
    return stripeConfig.products.find((p) =>
      p.name.toLowerCase().includes(planName.toLowerCase())
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getUsagePercentage = (current: number, limit: number) =>
    Math.min((current / limit) * 100, 100);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90)
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
    if (percentage >= 75)
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500 dark:bg-red-600";
    if (percentage >= 75) return "bg-yellow-500 dark:bg-yellow-600";
    return "bg-green-500 dark:bg-green-600";
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

  const handleManageBilling = async () => {
    const url = import.meta.env.VITE_STRIPE_BILLING_PORTAL_URL as string | undefined;
    if (!url) {
      console.warn("Missing VITE_STRIPE_BILLING_PORTAL_URL env var");
      return;
    }
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="animate-pulse" role="status">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          <span className="sr-only">
            {t("subscription.loading", "Loading")}
          </span>
        </div>
      </div>
    );
  }
  
  const isFreePlan = planKey === "plan_free" || !planKey;
  const isTrialing = subscription?.status === "trialing";
  const isCanceled = subscription?.cancel_at_period_end;

  // Translated values for rendering
  const displayName = currentPlan ? t(currentPlan.name) : t("plan_free");
  const displayDescription = currentPlan ? t(currentPlan.description) : t("subscription.freePlan.description", "Basic features to get you started");
  const displayFeatures = currentPlan ? currentPlan.features.map(k => t(k)) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Current Plan */}
      <section
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        aria-labelledby="current-plan-title"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 rounded-2xl">
                {getPlanIcon(subscription?.plan_name || "free")}
              </div>
              <div>
                <h3
                  id="current-plan-title"
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  {displayName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-md">
                  {displayDescription}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {isTrialing && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                      {t("subscription.badge.trial", "Trial Period")}
                    </span>
                  )}
                  {isCanceled && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                      <AlertTriangle
                        className="w-3 h-3 mr-1"
                        aria-hidden="true"
                      />
                      {t("subscription.badge.cancels", "Cancels")}{" "}
                      {subscription?.current_period_end
                        ? formatDate(subscription.current_period_end)
                        : ""}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscription?.status === "active"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    }`}
                    title={t(
                      "subscription.badge.status.tooltip",
                      "Current subscription status"
                    )}
                  >
                    {subscription?.status || t("subscription.free", "Free")}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ${currentPlan?.price || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t("subscription.price.per", "per")}{" "}
                {currentPlan?.interval ||
                  t("subscription.price.month", "month")}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-end">
                {!isFreePlan && (
                  <button
                    onClick={handleManageBilling}
                    disabled={stripeLoading}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    aria-label={t(
                      "subscription.actions.manageBilling.aria",
                      "Open billing portal"
                    )}
                    title={t(
                      "subscription.actions.manageBilling.title",
                      "Manage billing"
                    )}
                  >
                    <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t("subscription.actions.manageBilling", "Manage Billing")}
                  </button>
                )}
                <button
                  onClick={handlePricingNavigation}
                  className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  aria-label={t(
                    "subscription.actions.managePlan.aria",
                    "Manage subscription plan"
                  )}
                  title={t(
                    "subscription.actions.managePlan.title",
                    "Manage plan"
                  )}
                >
                  <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t("subscription.actions.managePlan", "Manage Plan")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("subscription.features.title", "Plan Features")}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {displayFeatures
                .slice(0, Math.ceil(displayFeatures.length / 2))
                .map((feature, index) => (
                  <div key={index} className="flex items-centre">
                    <CheckCircle
                      className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
            </div>

            <div className="space-y-2">
              {displayFeatures
                .slice(Math.ceil(displayFeatures.length / 2))
                .map((feature, index) => (
                  <div key={index} className="flex items-centre">
                    <CheckCircle
                      className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Usage Overview */}
      {usage && currentPlan && (
        <section
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6"
          aria-labelledby="usage-overview-title"
        >
          <h4
            id="usage-overview-title"
            className="text-lg font-semibold text-gray-900 dark:text-white mb-6"
          >
            {t("subscription.usage.title", "Usage Overview")}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Messages Usage (instead of Tokens) */}
            <div
              className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 p-4"
              aria-labelledby="usage-messages-title"
            >
              <div className="flex items-center mb-3">
                <FileText
                  className="w-5 h-5 text-primary-500 dark:text-primary-400 mr-2"
                  aria-hidden="true"
                />
                <h5
                  id="usage-messages-title"
                  className="font-medium text-gray-900 dark:text-white"
                >
                  {t("subscription.usage.messages.title", "Messages")}
                </h5>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t(
                    "subscription.usage.messages.subtitle",
                    "Used / Total this period"
                  )}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {(usage.estimated_chats_used || 0).toLocaleString()} /{" "}
                  {(usage.estimated_chats_total || 0).toLocaleString()}
                </span>
              </div>

              <div
                className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={getUsagePercentage(
                  usage.estimated_chats_used || 0,
                  usage.estimated_chats_total || 1
                )}
                aria-label={t(
                  "subscription.usage.messages.progressAria",
                  "Message usage"
                )}
                title={t(
                  "subscription.usage.messages.progressTitle",
                  "Message usage progress"
                )}
              >
                <div
                  className={`${getProgressColor(
                    getUsagePercentage(
                      usage.estimated_chats_used || 0,
                      usage.estimated_chats_total || 1
                    )
                  )} h-2 rounded-full transition-all duration-300`}
                  style={{
                    width: `${getUsagePercentage(
                      usage.estimated_chats_used || 0,
                      usage.estimated_chats_total || 1
                    )}%`,
                  }}
                ></div>
              </div>

              <div
                className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${getUsageColor(
                  getUsagePercentage(
                    usage.estimated_chats_used || 0,
                    usage.estimated_chats_total || 1
                  )
                )}`}
              >
                {getUsagePercentage(
                  usage.estimated_chats_used || 0,
                  usage.estimated_chats_total || 1
                ).toFixed(1)}
                {t("subscription.usage.percentSuffix", "% used")}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t(
                "subscription.usage.cta.copy",
                "Need more resources? Upgrade your plan or add more capacity."
              )}
            </div>
            <button
              onClick={() => navigate(`${langPrefix}/billing?tab=plans`)}
              className="text-primary-600 dark:text-primary-400 font-medium text-sm hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
              aria-label={t(
                "subscription.usage.cta.viewPlans.aria",
                "View all plans"
              )}
              title={t(
                "subscription.usage.cta.viewPlans.title",
                "View all plans"
              )}
            >
              {t("subscription.usage.cta.viewPlans", "View all plans")}
              <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Upgrade Recommendations */}
      {usage && currentPlan && (
        <section className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t("subscription.reco.title", "Optimization Recommendations")}
          </h4>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {getUsagePercentage(
              usage.tokens_used || 0,
              currentPlan.limits.tokens_per_month
            ) > 80 && (
              <p className="flex items-start">
                <AlertTriangle
                  className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                {t(
                  "subscription.reco.tokens",
                  "Consider upgrading for more tokens to avoid service interruption"
                )}
              </p>
            )}
            {getUsagePercentage(
              usage.chatbots_created || 0,
              currentPlan.limits.max_chatbots
            ) > 80 && (
              <p className="flex items-start">
                <AlertTriangle
                  className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                {t(
                  "subscription.reco.chatbots",
                  "You're approaching your chatbot limit - upgrade to create more"
                )}
              </p>
            )}
            {getUsagePercentage(
              usage.documents_uploaded || 0,
              currentPlan.limits.max_documents
            ) > 80 && (
              <p className="flex items-start">
                <AlertTriangle
                  className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                {t(
                  "subscription.reco.documents",
                  "Running low on document uploads - consider a higher tier plan"
                )}
              </p>
            )}
            {isFreePlan && (
              <p className="flex items-start">
                <Zap
                  className="w-4 h-4 text-primary-500 dark:text-primary-400 mt-0.5 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                {t(
                  "subscription.reco.free",
                  "Upgrade to unlock GPT-4, more tokens, and advanced features"
                )}
              </p>
            )}
          </div>

          {(isFreePlan ||
            getUsagePercentage(
              usage.tokens_used || 0,
              currentPlan.limits.tokens_per_month
            ) > 80) && (
            <div className="mt-4">
              <button
                onClick={handleUpgrade}
                disabled={stripeLoading}
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t(
                  "subscription.reco.upgrade.aria",
                  "Upgrade your plan"
                )}
                title={t("subscription.reco.upgrade.title", "Upgrade now")}
              >
                <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                {stripeLoading
                  ? t("subscription.reco.upgrade.processing", "Processing...")
                  : t("subscription.reco.upgrade.cta", "Upgrade Now")}
              </button>
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
};

export default SubscriptionStatus;
