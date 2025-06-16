import React from 'react'
import { BarChart3 } from 'lucide-react'

interface ChartData {
  date: string
  messages: number
}

interface AnalyticsChartProps {
  data: ChartData[]
  title: string
}

export const AnalyticsChart = ({ data, title }: AnalyticsChartProps) => {
  const maxValue = Math.max(...data.map(d => d.messages), 1)

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No data available yet</p>
          </div>
        ) : (
          <div className="flex items-end space-x-2 h-40">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t relative">
                  <div
                    className="bg-blue-600 rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max((item.messages / maxValue) * 120, 4)}px`,
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-900">{item.messages}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}