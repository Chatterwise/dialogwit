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
  Link,
} from "lucide-react";
import { useBilling } from "../hooks/useBilling";
import { useStripe } from "../hooks/useStripe";
import SubscriptionStatus from "./SubscriptionStatus";

export const BillingDashboard: React.FC = () => {
  const { subscription, invoices, usage, isLoading, refetch } = useBilling();
  const { createPortalSession, isLoading: stripeLoading } = useStripe();
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "usage">(
    "overview"
  );

  const handleManageBilling = async () => {
    await createPortalSession();
  };

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
            Billing & Usage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your subscription, view invoices, and monitor usage
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={handleManageBilling}
            disabled={stripeLoading}
            className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {stripeLoading ? "Loading..." : "Manage Billing"}
          </button>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "invoices", label: "Invoices", icon: Download },
            { id: "usage", label: "Usage", icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
                      Current Plan
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {subscription?.plan_name || "Free"}
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
                      Monthly Spend
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
                      Next Billing
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {subscription?.current_period_end
                        ? formatDate(subscription.current_period_end)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Usage Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Usage Metrics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {usage?.tokens_used?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tokens Used
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    This month
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {usage?.chatbots_created || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Chatbots Created
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {usage?.documents_uploaded || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Documents Uploaded
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {usage?.api_requests || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    API Requests
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    This month
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Need more detailed analytics?
                </div>
                <Link
                  to="/analytics"
                  className="text-primary-600 dark:text-primary-400 font-medium text-sm hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
                >
                  View detailed analytics
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
                Invoice History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Download and view your billing history
              </p>
            </div>
            <div className="overflow-x-auto">
              {invoices && invoices.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
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
                              Download
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
                    No invoices yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your invoices will appear here once you start a paid
                    subscription.
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
                    Usage Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Detailed breakdown of your current usage
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
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
                          Tokens
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {usage.tokens_used?.toLocaleString() || 0} / 100,000
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((usage.tokens_used || 0) / 100000) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Chatbots
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {usage.chatbots_created || 0} / 5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((usage.chatbots_created || 0) / 5) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Documents
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {usage.documents_uploaded || 0} / 50
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((usage.documents_uploaded || 0) / 50) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          Token Usage
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Current
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {usage.tokens_used?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Limit
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          100,000
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Bot className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          Chatbots
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Created
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {usage.chatbots_created || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Limit
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          5
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          Documents
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Uploaded
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {usage.documents_uploaded || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Limit
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          50
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          API Requests
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Used
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {usage.api_requests || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Rate Limit
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
                          Need more resources?
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          Upgrade your plan to get more tokens, chatbots, and
                          features.
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/pricing"
                          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          View Plans
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No usage data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start using ChatterWise to see your usage statistics here.
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
