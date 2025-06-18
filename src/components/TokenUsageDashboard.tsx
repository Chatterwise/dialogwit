import React from "react";
import {
  TrendingUp,
  DollarSign,
  Zap,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Clock,
  Target,
  Cpu,
} from "lucide-react";
import { useTokenUsage } from "../hooks/useTokenUsage";

export const TokenUsageDashboard: React.FC = () => {
  const { data, trends, loading, error, refreshUsage } = useTokenUsage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-red-800">
                Error Loading Token Usage
              </h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={refreshUsage}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Cpu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Token Usage Data
            </h3>
            <p className="text-gray-500">
              Start using your chatbots to see token consumption data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 bg-red-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Calculate totals
  const totalTokensUsed = Object.values(data.usage).reduce(
    (sum, metric) => sum + metric.current_usage,
    0
  );
  const totalTokensLimit = Object.values(data.usage).reduce(
    (sum, metric) => sum + metric.limit_value,
    0
  );
  const totalOverageAmount = Object.values(data.usage).reduce(
    (sum, metric) => sum + metric.overage_amount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Token Usage Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor your AI token consumption and costs in real-time
            </p>
          </div>
          <button
            onClick={refreshUsage}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Tokens Used
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(totalTokensUsed)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Remaining Tokens
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(
                    Math.max(0, totalTokensLimit - totalTokensUsed)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Current Month Cost
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.costs.current_month_total || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Projected Cost
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.costs.projected_month_total || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Period Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Billing Period
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.subscription.status === "active"
                  ? "bg-green-100 text-green-800"
                  : data.subscription.status === "trialing"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {data.subscription.plan_name} - {data.subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-medium">
                {new Date(data.billing_period.start).toLocaleDateString()} -{" "}
                {new Date(data.billing_period.end).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Elapsed</p>
              <p className="font-medium">
                {Math.floor(data.billing_period.days_elapsed)} of{" "}
                {Math.floor(data.billing_period.days_total)} days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Remaining</p>
              <p className="font-medium">
                {Math.floor(data.costs.days_remaining || 0)} days
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Usage Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Token Usage by Feature
            </h2>
            <div className="space-y-6">
              {Object.entries(data.usage).map(([metricName, metric]) => {
                const displayName = metricName
                  .replace(/_/g, " ")
                  .replace(/per month/g, "")
                  .trim();
                const percentage = metric.percentage_used;

                return (
                  <div key={metricName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {displayName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatNumber(metric.current_usage)} /{" "}
                          {formatNumber(metric.limit_value)} tokens
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUsageColor(
                          percentage
                        )}`}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                          percentage
                        )}`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    {metric.overage_amount > 0 && (
                      <p className="text-sm text-red-600">
                        Overage: {formatCurrency(metric.overage_amount)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Cost Breakdown
            </h2>

            <div className="space-y-4 mb-6">
              {Object.entries(data.costs.breakdown || {}).map(
                ([metricName, cost]) => {
                  const displayName = metricName
                    .replace(/_/g, " ")
                    .replace(/per month/g, "")
                    .trim();

                  return (
                    <div
                      key={metricName}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {displayName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatNumber(cost.tokens)} tokens
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(cost.cost)}
                      </p>
                    </div>
                  );
                }
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Month Total:</span>
                <span className="font-semibold">
                  {formatCurrency(data.costs.current_month_total || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projected Month Total:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(data.costs.projected_month_total || 0)}
                </span>
              </div>
              {totalOverageAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-600">Overage Charges:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(totalOverageAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Trends Chart */}
        {trends.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Usage Trends (Last 30 Days)
              </h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>

            <div className="h-64 flex items-end space-x-1">
              {trends.slice(-14).map((trend, index) => {
                const maxTokens = Math.max(
                  ...trends.map((t) => t.total_tokens)
                );
                const height =
                  maxTokens > 0 ? (trend.total_tokens / maxTokens) * 100 : 0;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                      title={`${new Date(
                        trend.date
                      ).toLocaleDateString()}: ${formatNumber(
                        trend.total_tokens
                      )} tokens`}
                    />
                    <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(trend.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {new Date(data.last_updated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
