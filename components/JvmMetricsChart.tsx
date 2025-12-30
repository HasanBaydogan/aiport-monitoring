'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface JvmData {
  memoryUsed: number
  memoryMax: number
  memoryUsagePercent: number
  gcPauseTime: number
  threadCount: number
}

interface JvmMetricsChartProps {
  data: JvmData
}

export default function JvmMetricsChart({ data }: JvmMetricsChartProps) {
  const chartData = [
    {
      name: 'Bellek',
      kullanılan: (data.memoryUsed / 1024 / 1024 / 1024).toFixed(2),
      maksimum: (data.memoryMax / 1024 / 1024 / 1024).toFixed(2),
      kullanımYüzdesi: data.memoryUsagePercent,
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">GC Pause Time</p>
          <p className="text-2xl font-bold">{data.gcPauseTime.toFixed(2)}ms</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Thread Count</p>
          <p className="text-2xl font-bold">{data.threadCount}</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Memory Usage</p>
          <p className="text-2xl font-bold">{data.memoryUsagePercent.toFixed(1)}%</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="kullanılan" fill="#3b82f6" name="Kullanılan (GB)" />
          <Bar dataKey="maksimum" fill="#10b981" name="Maksimum (GB)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


