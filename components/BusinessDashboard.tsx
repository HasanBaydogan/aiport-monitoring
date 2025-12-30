'use client'

import { useEffect, useState } from 'react'
import { createMonitoringApi } from '@/lib/api'
import { BusinessMetric, ConversionFunnel, PIStatusDistribution } from '@/lib/types'
import { useProject } from '@/contexts/ProjectContext'
import MetricCard from './MetricCard'
import { TrendingUp, Mail, Package, ShoppingCart } from 'lucide-react'
import ConversionFunnelChart from './ConversionFunnelChart'
import PIStatusChart from './PIStatusChart'

export default function BusinessDashboard() {
  const { currentProject } = useProject()
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric | null>(null)
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null)
  const [piStatus, setPiStatus] = useState<PIStatusDistribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentProject) return
    fetchData()
    const interval = setInterval(fetchData, 15000) // Her 15 saniyede bir güncelle
    return () => clearInterval(interval)
  }, [currentProject])

  const fetchData = async () => {
    if (!currentProject) return
    try {
      const monitoringApi = createMonitoringApi(currentProject)
      const [metricsRes, funnelRes, statusRes] = await Promise.all([
        monitoringApi.getBusinessMetrics().catch(() => ({ data: null })),
        monitoringApi.getConversionFunnel().catch(() => ({ data: null })),
        monitoringApi.getPIStatusDistribution().catch(() => ({ data: [] })),
      ])
      setBusinessMetrics(metricsRes.data)
      setFunnel(funnelRes.data)
      setPiStatus(statusRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !businessMetrics) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {currentProject ? `${currentProject.name} - Business metrics and conversion funnel analysis` : 'No project selected'}
        </p>
      </div>

      {!currentProject && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Please select a project.
        </div>
      )}

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {businessMetrics ? (
          <>
            <MetricCard
              title="RFQ Creation Rate"
              value={`${(businessMetrics.rfqCreationRate || 0).toFixed(1)}/hour`}
              icon={TrendingUp}
            />
            <MetricCard
              title="Quote Conversion Rate"
              value={`${(businessMetrics.quoteConversionRate || 0).toFixed(1)}%`}
              icon={ShoppingCart}
              trendColor={(businessMetrics.quoteConversionRate || 0) > 50 ? 'green' : 'yellow'}
            />
            <MetricCard
              title="PI Creation Rate"
              value={`${(businessMetrics.piCreationRate || 0).toFixed(1)}/hour`}
              icon={Package}
            />
            <MetricCard
              title="Email Success Rate"
              value={`${(businessMetrics.emailSendSuccessRate || 0).toFixed(1)}%`}
              icon={Mail}
              trendColor={(businessMetrics.emailSendSuccessRate || 0) > 90 ? 'green' : 'red'}
            />
            <MetricCard
              title="ILS API Success Rate"
              value={`${(businessMetrics.ilsApiSuccessRate || 0).toFixed(1)}%`}
              icon={TrendingUp}
              trendColor={(businessMetrics.ilsApiSuccessRate || 0) > 90 ? 'green' : 'red'}
            />
          </>
        ) : (
          <div className="col-span-5 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-800">
            Business metrics not available. Backend endpoint /api/v1/monitoring/business-metrics needs to be implemented.
          </div>
        )}
      </div>

      {/* Conversion Funnel */}
      {funnel && funnel.conversionRates ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">RFQ → Quote → PI Conversion Funnel</h3>
            <ConversionFunnelChart data={funnel} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Conversion Rates</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">RFQ → Quote</span>
                  <span className="text-sm font-semibold">{(funnel.conversionRates?.rfqToQuote || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(funnel.conversionRates?.rfqToQuote || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Quote → PI</span>
                  <span className="text-sm font-semibold">{(funnel.conversionRates?.quoteToPi || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(funnel.conversionRates?.quoteToPi || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{funnel.rfq || 0}</p>
                    <p className="text-sm text-gray-600">RFQ</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{funnel.quote || 0}</p>
                    <p className="text-sm text-gray-600">Quote</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{funnel.pi || 0}</p>
                    <p className="text-sm text-gray-600">PI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* PI Status Distribution */}
      {piStatus.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">PI Status Dağılımı</h3>
          <PIStatusChart data={piStatus} />
        </div>
      )}
    </div>
  )
}

