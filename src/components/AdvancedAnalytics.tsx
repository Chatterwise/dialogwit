import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  Clock,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Loader,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import { useRealTimeAnalytics } from "../hooks/useRealTimeAnalytics";
import { useTranslation } from "../hooks/useTranslation";

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<any>;
  color: string;
  darkColor: string;
}

export const AdvancedAnalytics = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: chatbots = [] } = useChatbots(user?.id || "");
  const [selectedChatbot, setSelectedChatbot] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: analytics,
    isLoading,
    refetch,
  } = useRealTimeAnalytics(selectedChatbot, dateRange);

  const handleExport = async (format: "csv" | "json") => {
    if (!analytics) return;
    setIsExporting(true);
    try {
      const exportData = analytics.exportData || [];
      if (format === "csv") {
        const csv = convertToCSV(exportData);
        downloadFile(csv, `analytics-${dateRange}.csv`, "text/csv");
      } else {
        const json = JSON.stringify(exportData, null, 2);
        downloadFile(json, `analytics-${dateRange}.json`, "application/json");
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) => (typeof value === "string" ? `"${value}"` : value))
          .join(",")
      )
      .join("\n");
    return `${headers}\n${rows}`;
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("analytics_loading", "Loading analytics data...")}
          </p>
        </div>
      </div>
    );
  }

  const metrics: MetricCard[] = [
    {
      title: t("analytics_metric_total_conversations", "Total Conversations"),
      value: analytics.totalConversations,
      change: `${analytics.conversationGrowth >= 0 ? "+" : ""}${
        analytics.conversationGrowth
      }%`,
      trend: analytics.conversationGrowth >= 0 ? "up" : "down",
      icon: MessageCircle,
      color: "text-blue-600 bg-blue-100",
      darkColor: "text-blue-400 bg-blue-900/20",
    },
    {
      title: t("analytics_metric_unique_users", "Unique Users"),
      value: analytics.uniqueUsers,
      change: `${analytics.userGrowth >= 0 ? "+" : ""}${analytics.userGrowth}%`,
      trend: analytics.userGrowth >= 0 ? "up" : "down",
      icon: Users,
      color: "text-green-600 bg-green-100",
      darkColor: "text-green-400 bg-green-900/20",
    },
    {
      title: t("analytics_metric_avg_response_time", "Avg Response Time"),
      value: `${analytics.avgResponseTime}${t("analytics_unit_ms", "ms")}`,
      change: `${analytics.responseTimeImprovement >= 0 ? "-" : "+"}${Math.abs(
        analytics.responseTimeImprovement
      )}%`,
      trend: analytics.responseTimeImprovement >= 0 ? "up" : "down",
      icon: Clock,
      color: "text-purple-600 bg-purple-100",
      darkColor: "text-purple-400 bg-purple-900/20",
    },
    {
      title: t("analytics_metric_satisfaction_rate", "Satisfaction Rate"),
      value: `${analytics.satisfactionRate}%`,
      change: `${analytics.satisfactionGrowth >= 0 ? "+" : ""}${
        analytics.satisfactionGrowth
      }%`,
      trend: analytics.satisfactionGrowth >= 0 ? "up" : "down",
      icon: ThumbsUp,
      color: "text-emerald-600 bg-emerald-100",
      darkColor: "text-emerald-400 bg-emerald-900/20",
    },
    {
      title: t("analytics_metric_resolution_rate", "Resolution Rate"),
      value: `${analytics.resolutionRate}%`,
      change: `${analytics.resolutionGrowth >= 0 ? "+" : ""}${
        analytics.resolutionGrowth
      }%`,
      trend: analytics.resolutionGrowth >= 0 ? "up" : "down",
      icon: Zap,
      color: "text-orange-600 bg-orange-100",
      darkColor: "text-orange-400 bg-orange-900/20",
    },
    {
      title: t("analytics_metric_peak_usage_hour", "Peak Usage Hour"),
      value: analytics.peakHour || t("analytics_value_na", "N/A"),
      change: t("analytics_peak_most_active", "Most active"),
      trend: "neutral",
      icon: TrendingUp,
      color: "text-indigo-600 bg-indigo-100",
      darkColor: "text-indigo-400 bg-indigo-900/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 font-display tracking-tight mb-1">
            {t("analytics_title", "Advanced Analytics")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t(
              "analytics_subtitle",
              "Comprehensive insights into your chatbot performance and user engagement."
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={t("analytics_refresh", "Refresh")}
            aria-label={t("analytics_refresh", "Refresh")}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("analytics_refresh", "Refresh")}
          </button>

          {/* Chatbot Filter */}
          <div className="relative">
            <select
              value={selectedChatbot}
              onChange={(e) => setSelectedChatbot(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={t("analytics_filter_chatbot_label", "Filter by bot")}
            >
              <option value="all">
                {t("analytics_filter_all_bots", "All Chatbots")}
              </option>
              {chatbots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
          </div>

          {/* Date Range */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={t("analytics_filter_date_label", "Date range")}
            >
              <option value="7d">
                {t("analytics_range_7d", "Last 7 days")}
              </option>
              <option value="30d">
                {t("analytics_range_30d", "Last 30 days")}
              </option>
              <option value="90d">
                {t("analytics_range_90d", "Last 90 days")}
              </option>
            </select>
            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-xl p-3 ${metric.color} dark:${metric.darkColor}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {metric.value}
                  </p>
                  <p
                    className={`text-sm ${
                      metric.trend === "up"
                        ? "text-green-600 dark:text-green-400"
                        : metric.trend === "down"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {metric.change}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume Chart */}
        <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t("analytics_chart_message_volume", "Message Volume")}
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="relative">
            <div className="absolute  flex items-center justify-between pointer-events-none">
              <div className="bg-gradient-to-r from-white dark:from-gray-800 to-transparent w-8 h-full" />
              <div className="bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full" />
            </div>
            <div className="h-64 flex items-center justify-center">
              {analytics.messageVolumeChart &&
              analytics.messageVolumeChart.length > 0 ? (
                <div className="w-full h-full overflow-x-auto">
                  <div className="flex items-end space-x-2 h-full min-w-max">
                    {analytics.messageVolumeChart.map((data, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center min-w-[2rem]"
                      >
                        <div
                          className={`w-full bg-primary-500 dark:bg-primary-400 rounded-t transition-all duration-300 ${
                            data.value > 0
                              ? "ring-1 ring-primary-700 dark:ring-primary-600"
                              : ""
                          }`}
                          style={{
                            height: `${
                              (data.value /
                                Math.max(
                                  ...analytics.messageVolumeChart.map(
                                    (d) => d.value
                                  ),
                                  1
                                )) *
                              200
                            }px`,
                          }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {data.label.split(" ")[1]} {/* Just day number */}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("analytics_no_data", "No data available")}
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1">
              {t("analytics_scroll_hint", "← Scroll to see more →")}
            </p>
          </div>
        </div>

        {/* User Satisfaction Chart */}
        <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t("analytics_chart_user_satisfaction", "User Satisfaction")}
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-2">
                    <ThumbsUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analytics.positiveRating}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("analytics_positive", "Positive")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-2">
                    <ThumbsDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analytics.negativeRating}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("analytics_negative", "Negative")}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.positiveRating}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t("analytics_export_title", "Export Data")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t(
                "analytics_export_sub",
                "Download your analytics data and chat logs"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={() => handleExport("csv")}
              disabled={isExporting || !analytics.exportData.length}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              aria-label={t("analytics_export_csv", "Export CSV")}
              title={t("analytics_export_csv", "Export CSV")}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("analytics_export_csv", "Export CSV")}
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={isExporting || !analytics.exportData.length}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 transition-colors"
              aria-label={t("analytics_export_json", "Export JSON")}
              title={t("analytics_export_json", "Export JSON")}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("analytics_export_json", "Export JSON")}
            </button>
          </div>
        </div>

        {isExporting && (
          <div className="flex items-center justify-center py-4">
            <Loader className="h-6 w-6 text-primary-600 dark:text-primary-400 animate-spin mr-3" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("analytics_export_preparing", "Preparing export...")}
            </span>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t("analytics_recent_activity", "Recent Activity")}
        </h3>
        <div className="space-y-4">
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.message}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.timestamp}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.type === "success"
                        ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                        : activity.type === "warning"
                        ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {t(
                      `analytics_activity_type_${activity.type}`,
                      activity.type
                    )}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("analytics_no_recent", "No recent activity")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
