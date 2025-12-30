'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { ConversionFunnel } from '@/lib/types'

interface ConversionFunnelChartProps {
  data: ConversionFunnel
}

export default function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const chartData = [
    { name: 'RFQ', value: data.rfq, color: '#3b82f6' },
    { name: 'Quote', value: data.quote, color: '#10b981' },
    { name: 'PI', value: data.pi, color: '#f59e0b' },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name="Count">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}


