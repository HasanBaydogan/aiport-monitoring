import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: 'up' | 'down' | null
  trendColor?: 'red' | 'green' | 'blue' | 'yellow'
}

export default function MetricCard({ title, value, icon: Icon, trend, trendColor = 'blue' }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${
          trendColor === 'red' ? 'bg-red-100' :
          trendColor === 'green' ? 'bg-green-100' :
          trendColor === 'yellow' ? 'bg-yellow-100' :
          'bg-blue-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            trendColor === 'red' ? 'text-red-600' :
            trendColor === 'green' ? 'text-green-600' :
            trendColor === 'yellow' ? 'text-yellow-600' :
            'text-blue-600'
          }`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-red-500' : 'text-green-500'}>
            {trend === 'up' ? 'Artış' : 'Azalış'}
          </span>
        </div>
      )}
    </div>
  )
}

