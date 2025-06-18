import { BarChart3 } from "lucide-react";

interface ChartData {
  date: string;
  messages: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  title: string;
  loading?: boolean;
}

export const AnalyticsChart = ({
  data,
  title,
  loading = false,
}: AnalyticsChartProps) => {
  const maxValue = Math.max(...data.map((d) => d.messages), 1);

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-display">
            {title}
          </h3>
          <BarChart3 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse w-full">
            <div className="flex items-end space-x-2 h-32">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-t"
                    style={{ height: `${Math.random() * 80 + 20}px` }}
                  />
                  <div className="mt-2 w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-display">
          {title}
        </h3>
        <BarChart3 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No data available yet
            </p>
          </div>
        ) : (
          <div className="flex items-end space-x-2 h-40">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative">
                  <div
                    className="bg-primary-500 dark:bg-primary-600 rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max(
                        (item.messages / maxValue) * 120,
                        4
                      )}px`,
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {item.messages}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
