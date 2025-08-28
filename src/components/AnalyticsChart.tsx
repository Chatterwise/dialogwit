import { BarChart3 } from "lucide-react";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "../hooks/useTranslation";

interface ChartData {
  date: string;
  messages: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  title: string; // pass a translated title from the parent (e.g., t("analytics_chart_message_volume"))
  loading?: boolean;
}

export const AnalyticsChart = ({
  data,
  title,
  loading = false,
}: AnalyticsChartProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-display">
            {title}
          </h3>
          <BarChart3 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-600">
          {t("chart_loading", "Loading chart...")}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-display">
          {title}
        </h3>
        <BarChart3 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("chart_no_data", "No data available yet")}
          </p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  border: "1px solid #e5e7eb",
                }}
                labelStyle={{ color: "#6b7280" }}
                formatter={(value: any) => [
                  value,
                  t("chart_series_messages", "Messages"),
                ]}
              />
              <Bar
                dataKey="messages"
                fill="url(#gradient)"
                radius={[6, 6, 0, 0]}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </RBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
