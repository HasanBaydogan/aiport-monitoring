'use client'

import { ApiMetric } from '@/lib/types'

interface TopEndpointsTableProps {
  data: ApiMetric[]
}

export default function TopEndpointsTable({ data }: TopEndpointsTableProps) {
  const topEndpoints = [...data]
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 10)

  if (topEndpoints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Veri bulunamadı
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Endpoint
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İstek Sayısı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hata Sayısı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hata Oranı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ort. Yanıt (ms)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              P95 (ms)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {topEndpoints.map((metric, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {metric.endpoint}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded text-xs ${
                  metric.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                  metric.method === 'POST' ? 'bg-green-100 text-green-800' :
                  metric.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {metric.method}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {metric.requestCount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={metric.errorCount > 0 ? 'text-red-600 font-semibold' : ''}>
                  {metric.errorCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`font-semibold ${
                  metric.errorRate > 5 ? 'text-red-600' :
                  metric.errorRate > 1 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {metric.errorRate.toFixed(2)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {metric.avgResponseTime.toFixed(0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {metric.p95.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}




