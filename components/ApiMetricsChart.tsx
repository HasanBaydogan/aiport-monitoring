'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface TimeSeriesDataPoint {
  timestamp: string
  successful: number
  failed: number
}

interface ApiMetricsChartProps {
  timeSeriesData: TimeSeriesDataPoint[]
}

export default function ApiMetricsChart({ timeSeriesData }: ApiMetricsChartProps) {
  // Format data for chart: convert timestamp to readable time format
  const chartData = timeSeriesData.map(point => ({
    time: format(new Date(point.timestamp), 'HH:mm:ss'),
    timestamp: point.timestamp,
    successful: point.successful,
    failed: point.failed,
  }))

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No data found
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          fontSize={12}
        />
        <YAxis 
          label={{ value: 'Request Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [value, name]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="successful" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Successful Requests" 
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="failed" 
          stroke="#ef4444" 
          strokeWidth={2}
          name="Failed Requests" 
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}


