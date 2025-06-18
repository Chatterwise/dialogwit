import React from "react";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { useTokenUsage } from "../hooks/useTokenUsage";

interface TokenUsageWidgetProps {
  className?: string;
  showDetails?: boolean;
}

const TokenUsageWidget: React.FC<TokenUsageWidgetProps> = ({
  className = "",
  showDetails = true,
}) => {
  const { data, loading, error } = useTokenUsage();

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}
      >
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="text-sm">Unable to load token usage</span>
        </div>
      </div>
    );
  }

  const totalTokensUsed = Object.values(data.usage).reduce(
    (sum, metric) => sum + metric.current_usage,
    0
  );
  const totalTokensLimit = Object.values(data.usage).reduce(
    (sum, metric) => sum + metric.limit_value,
    0
  );
  const overallPercentage =
    totalTokensLimit > 0 ? (totalTokensUsed / totalTokensLimit) * 100 : 0;

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

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-gray-900">Token Usage</h3>
        </div>
        <span
          className={`text-sm font-medium ${getStatusColor(overallPercentage)}`}
        >
          {overallPercentage.toFixed(1)}%
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Used: {formatNumber(totalTokensUsed)}
          </span>
          <span className="text-gray-600">
            Limit: {formatNumber(totalTokensLimit)}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
              overallPercentage
            )}`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Cost:</span>
            <span className="font-medium">
              {formatCurrency(data.costs.current_month_total || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Projected:
            </span>
            <span className="font-medium text-blue-600">
              {formatCurrency(data.costs.projected_month_total || 0)}
            </span>
          </div>

          {data.costs.days_remaining && (
            <div className="text-xs text-gray-500 text-center">
              {Math.floor(data.costs.days_remaining)} days remaining in billing
              period
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenUsageWidget;
