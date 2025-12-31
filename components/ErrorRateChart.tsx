'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ApiMetric } from '@/lib/types'

interface ErrorRateChartProps {
  data: ApiMetric[]
}

export default function ErrorRateChart({ data }: ErrorRateChartProps) {
  const chartData = data
    .filter(m => m.errorCount > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 10)
    .map(metric => ({
      name: metric.endpoint.length > 15 ? metric.endpoint.substring(0, 15) + '...' : metric.endpoint,
      errorRate: parseFloat(metric.errorRate.toFixed(2)),
      errors: metric.errorCount,
    }))

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Hata verisi bulunamadı
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="errorRate" fill="#ef4444" name="Hata Oranı (%)" />
      </BarChart>
    </ResponsiveContainer>
  )
}




