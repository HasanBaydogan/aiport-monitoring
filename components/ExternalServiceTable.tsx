'use client'

import { ExternalServiceMetric } from '@/lib/types'
import { Globe, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface ExternalServiceTableProps {
  data: ExternalServiceMetric[]
}

export default function ExternalServiceTable({ data }: ExternalServiceTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-400">
        Veri bulunamadı
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Servis
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Başarı Oranı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ort. Yanıt Süresi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hata Sayısı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timeout Sayısı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Son Kontrol
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((service, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{service.service}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {service.successRate > 90 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Sağlıklı
                  </span>
                ) : service.successRate > 70 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Uyarı
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" />
                    Kritik
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-semibold ${
                  service.successRate > 90 ? 'text-green-600' :
                  service.successRate > 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {service.successRate.toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {service.avgResponseTime.toFixed(0)}ms
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {service.errorCount > 0 ? (
                  <span className="text-red-600 font-semibold">{service.errorCount}</span>
                ) : (
                  <span className="text-gray-500">0</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {service.timeoutCount > 0 ? (
                  <span className="text-orange-600 font-semibold">{service.timeoutCount}</span>
                ) : (
                  <span className="text-gray-500">0</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(service.lastCheck), 'dd.MM.yyyy HH:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}




