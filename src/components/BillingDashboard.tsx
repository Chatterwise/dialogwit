import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  FileText,
  AlertCircle,
  Bot,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useBilling } from "../hooks/useBilling";
import SubscriptionStatus from "./SubscriptionStatus";
import { useTranslation } from "../hooks/useTranslation";
import { stripeConfig } from "../stripe-config";

export const BillingDashboard: React.FC = () => {
  // Locale-aware path helper (same logic used elsewhere)
  const { pathname } = useLocation();
  const match = pathname.match(/^\/([A-Za-z-]{2,5})(?=\/|$)/);
  const locale = match?.[1] ?? "en";
  const localePath = (to: string) => {
    const normalized = to.startsWith("/") ? to : `/${to}`;
    if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) return normalized;
    return `/${locale}${normalized}`;
  };

  const { t } = useTranslation();
  const { subscription, invoices, usage, isLoading } = useBilling();
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "usage">(
    "overview"
  );

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "open":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "void":
      case "uncollectible":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  // Debugging: Log subscription object
  console.log("Subscription object:", subscription);

  // Log plan_name and price being used for matching
  console.log("Looking for plan name:", subscription?.plan_name);
  console.log("Looking for plan price:", subscription?.subscription_plans?.price_monthly);

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

  const planKey = normalisePlanKey(subscription?.plan_name);

  console.log("Looking for plan key:", planKey);

  // ---------- plan resolution (logic stays UNtranslated) ----------
  // Try to match by plan key first; fall back to price comparison if needed.
  const currentPlan =
    stripeConfig.products.find(p => p.name === planKey) ??
    stripeConfig.products.find(p => t(p.name).toLowerCase() === (subscription?.display_name ?? "").toLowerCase()) ??
    null;

  // What we actually render (translated)
  const displayPlanName = currentPlan ? t(currentPlan.name) : t("Subscription plan not found");
  const displayPlanDescription = currentPlan ? t(currentPlan.description) : "";
  const displayPlanFeatures = currentPlan ? currentPlan.features.map(k => t(k)) : [];
  const monthlyPriceDisplay = currentPlan ? `$${currentPlan.price}` : "$0";

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("billing_title", "Billing & Usage")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t(
              "billing_subtitle",
              "Manage your subscription, view invoices, and monitor usage"
            )}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* (reserved for actions) */}
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: "overview",
              label: t("billing_tab_overview", "Overview"),
              icon: TrendingUp,
            },
            {
              id: "invoices",
              label: t("billing_tab_invoices", "Invoices"),
              icon: Download,
            },
            {
              id: "usage",
              label: t("billing_tab_usage", "Usage"),
              icon: AlertTriangle,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {activeTab === "overview" && (
          <>
            <SubscriptionStatus />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("billing_current_plan", "Current Plan")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {displayPlanName}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("billing_monthly_spend", "Monthly Spend")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {subscription?.plan_name === "free"
                        ? "$0"
                        : subscription?.plan_name === "starter"
                        ? "$19"
                        : subscription?.plan_name === "growth"
                        ? "$79"
                        : subscription?.plan_name === "business"
                        ? "$249"
                        : "$0"}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("billing_next_billing", "Next Billing")}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {subscription?.current_period_end
                        ? formatDate(subscription.current_period_end)
                        : t("billing_na", "N/A")}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Usage Metrics (Overview) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {t("billing_usage_metrics", "Usage Metrics")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {usage?.tokens_used?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("billing_tokens_used", "Tokens Used")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t("billing_this_month", "This month")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {usage?.chatbots_created || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("billing_chatbots_created", "Chatbots Created")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t("billing_total", "Total")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {usage?.documents_uploaded || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("billing_documents_uploaded", "Documents Uploaded")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t("billing_total", "Total")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {usage?.api_requests || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("billing_api_requests", "API Requests")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t("billing_this_month", "This month")}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t(
                    "billing_more_analytics_prompt",
                    "Need more detailed analytics?"
                  )}
                </div>
                <Link
                  to={localePath('/analytics')}
                  className="text-primary-600 dark:text-primary-400 font-medium text-sm hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
                >
                  {t(
                    "billing_view_detailed_analytics",
                    "View detailed analytics"
                  )}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          </>
        )}

        {activeTab === "invoices" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("billing_invoice_history", "Invoice History")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t(
                  "billing_invoice_history_desc",
                  "Download and view your billing history"
                )}
              </p>
            </div>
            <div className="overflow-x-auto">
              {invoices && invoices.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("billing_th_invoice", "Invoice")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("billing_th_date", "Date")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("billing_th_amount", "Amount")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("billing_th_status", "Status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("billing_th_actions", "Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{invoice.stripe_invoice_id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(invoice.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(
                            invoice.amount_paid,
                            invoice.currency
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {invoice.invoice_pdf && (
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {t("billing_action_download", "Download")}
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center">
                  <Download className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t("billing_no_invoices_title", "No invoices yet")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t(
                      "billing_no_invoices_desc",
                      "Your invoices will appear here once you start a paid subscription."
                    )}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "usage" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("billing_usage_details", "Usage Details")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t(
                      "billing_usage_details_desc",
                      "Detailed breakdown of your current usage"
                    )}
                  </p>
                </div>
                <button className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {t("billing_refresh", "Refresh")}
                </button>
              </div>
            </div>

            <div className="p-6">
              {usage ? (
                <div className="space-y-8">
                  {/* Usage Bars */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("billing_tokens", "Tokens")}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {usage.tokens_used?.toLocaleString() || 0} /{" "}
                          {(
                            subscription?.limits?.tokens_per_month ?? 0
                          ).toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        {subscription && (
                          <div
                            className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((usage.tokens_used || 0) /
                                  (subscription?.limits?.tokens_per_month ||
                                    1)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Usage Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {t("billing_token_usage", "Token Usage")}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("billing_current", "Current")}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {usage.tokens_used?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("billing_limit", "Limit")}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {(
                            subscription?.limits?.tokens_per_month ?? 0
                          ).toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Bot className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {t("billing_chatbots", "Chatbots")}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("billing_created", "Created")}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {(usage.chatbots_created || 0).toLocaleString(
                            "en-US"
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {t("billing_documents", "Documents")}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("billing_uploaded", "Uploaded")}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {usage.documents_uploaded || 0}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {t("billing_api_requests_title", "API Requests")}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("billing_used", "Used")}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {usage.api_requests || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("billing_rate_limit", "Rate Limit")}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          50/min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade CTA */}
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t("billing_need_more", "Need more resources?")}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {t(
                            "billing_upgrade_hint",
                            "Upgrade your plan to get more tokens, chatbots, and features."
                          )}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to={localePath('/pricing')}
                          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {t("billing_view_plans", "View Plans")}
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t("billing_no_usage_title", "No usage data")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t(
                      "billing_no_usage_desc",
                      "Start using ChatterWise to see your usage statistics here."
                    )}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
