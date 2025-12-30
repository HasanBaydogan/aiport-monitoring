'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { createMonitoringApi } from '@/lib/api'
import { HealthStatus, ApiMetric } from '@/lib/types'
import { useProject } from '@/contexts/ProjectContext'
import MetricCard from './MetricCard'
import ApiMetricsChart from './ApiMetricsChart'
import ErrorRateChart from './ErrorRateChart'
import TopEndpointsTable from './TopEndpointsTable'

interface TimeSeriesDataPoint {
  timestamp: string
  successful: number
  failed: number
}

export default function Dashboard() {
  const { currentProject } = useProject()
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentProject) return
    fetchData()
    const interval = setInterval(fetchData, 10000) // Her 10 saniyede bir güncelle
    return () => clearInterval(interval)
  }, [currentProject])

  const fetchData = async () => {
    if (!currentProject) return
    try {
      setError(null)
      const monitoringApi = createMonitoringApi(currentProject)
      
      // Actuator health endpoint (public, no auth)
      const healthRes = await monitoringApi.getHealth().catch(() => ({ 
        data: { status: 'DOWN' as const } 
      }))
      
      // Try to get API metrics from backend endpoint
      let httpMetrics: ApiMetric[] = []
      try {
        // First try backend endpoint (preferred - fastest and most accurate)
        const apiMetricsRes = await monitoringApi.getApiMetrics('1h')
        if (apiMetricsRes.data && apiMetricsRes.data.length > 0) {
          httpMetrics = apiMetricsRes.data
        } else {
          // Fallback: Parse Actuator endpoint data
          const httpRes = await monitoringApi.getHttpServerRequests()
          const baseResponse = httpRes.data
          
          if (baseResponse && baseResponse.availableTags) {
            const uriTag = baseResponse.availableTags.find((tag: any) => tag.tag === 'uri')
            const methodTag = baseResponse.availableTags.find((tag: any) => tag.tag === 'method')
            const statusTag = baseResponse.availableTags.find((tag: any) => tag.tag === 'status')
            const outcomeTag = baseResponse.availableTags.find((tag: any) => tag.tag === 'outcome')
            const totalTimeMeasurement = baseResponse.measurements?.find((m: any) => m.statistic === 'TOTAL_TIME')
            const totalTime = totalTimeMeasurement?.value || 0 // in seconds
            
            if (uriTag && uriTag.values) {
              const uris = uriTag.values || []
              const methods = methodTag?.values || ['GET', 'POST', 'PUT', 'DELETE']
              
              // Fetch real count for each URI
              const uriMetricsPromises = uris.map(async (uri: string) => {
                try {
                  // Get count for this URI (all methods combined)
                  const uriMetric = await monitoringApi.getMetric('http.server.requests', { uri })
                  const countMeasurement = uriMetric.data.measurements?.find((m: any) => m.statistic === 'COUNT')
                  const uriTotalTimeMeasurement = uriMetric.data.measurements?.find((m: any) => m.statistic === 'TOTAL_TIME')
                  
                  const requestCount = countMeasurement?.value || 0
                  const uriTotalTime = uriTotalTimeMeasurement?.value || 0 // in seconds
                  const avgResponseTime = requestCount > 0 ? (uriTotalTime / requestCount) * 1000 : 0 // convert to ms
                  
                  // Get error count - check for error status codes (4xx, 5xx) or CLIENT_ERROR outcome
                  let errorCount = 0
                  const statusCodeDistribution: Record<string, number> = {}
                  
                  if (statusTag && statusTag.values) {
                    for (const status of statusTag.values) {
                      const statusCode = parseInt(status)
                      if (statusCode >= 400) {
                        try {
                          const statusMetric = await monitoringApi.getMetric('http.server.requests', { uri, status })
                          const statusCountMeasurement = statusMetric.data.measurements?.find((m: any) => m.statistic === 'COUNT')
                          const statusCount = statusCountMeasurement?.value || 0
                          if (statusCount > 0) {
                            statusCodeDistribution[status] = Math.round(statusCount)
                            errorCount += statusCount
                          }
                        } catch (e) {
                          // Status not available for this URI, skip
                        }
                      } else {
                        // Success status codes
                        try {
                          const statusMetric = await monitoringApi.getMetric('http.server.requests', { uri, status })
                          const statusCountMeasurement = statusMetric.data.measurements?.find((m: any) => m.statistic === 'COUNT')
                          const statusCount = statusCountMeasurement?.value || 0
                          if (statusCount > 0) {
                            statusCodeDistribution[status] = Math.round(statusCount)
                          }
                        } catch (e) {
                          // Status not available, skip
                        }
                      }
                    }
                  }
                  
                  // Also check CLIENT_ERROR outcome if available
                  if (outcomeTag && outcomeTag.values.includes('CLIENT_ERROR')) {
                    try {
                      const errorOutcomeMetric = await monitoringApi.getMetric('http.server.requests', { uri, outcome: 'CLIENT_ERROR' })
                      const errorOutcomeCount = errorOutcomeMetric.data.measurements?.find((m: any) => m.statistic === 'COUNT')?.value || 0
                      // Use the higher value between status-based and outcome-based error count
                      errorCount = Math.max(errorCount, errorOutcomeCount)
                    } catch (e) {
                      // Outcome not available, skip
                    }
                  }
                  
                  const errorRate = requestCount > 0 ? parseFloat(((errorCount / requestCount) * 100).toFixed(2)) : 0
                  
                  return {
                    endpoint: uri,
                    method: methods[0] || 'GET', // Representative method
                    requestCount: Math.round(requestCount),
                    errorCount: Math.round(errorCount),
                    errorRate,
                    avgResponseTime: Math.round(avgResponseTime),
                    p50: Math.round(avgResponseTime),
                    p95: Math.round(avgResponseTime * 1.5),
                    p99: Math.round(avgResponseTime * 2),
                    statusCodeDistribution,
                  }
                } catch (e) {
                  // If fetching individual URI metric fails, return 0
                  console.warn(`Failed to fetch metrics for URI ${uri}:`, e)
                  return {
                    endpoint: uri,
                    method: methods[0] || 'GET',
                    requestCount: 0,
                    errorCount: 0,
                    errorRate: 0,
                    avgResponseTime: 0,
                    p50: 0,
                    p95: 0,
                    p99: 0,
                    statusCodeDistribution: {},
                  }
                }
              })
              
              // Wait for all URI metrics to be fetched
              const uriMetrics = await Promise.all(uriMetricsPromises)
              httpMetrics = uriMetrics.filter(m => m.requestCount > 0) // Only show URIs with requests
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch API metrics:', e)
      }
      
      setHealth({
        status: healthRes.data.status === 'UP' ? 'UP' : 'DOWN',
        score: healthRes.data.status === 'UP' ? 100 : 0,
        timestamp: new Date().toISOString(),
      })
      setApiMetrics(httpMetrics)
      
      // Calculate total successful and failed requests for time series
      const totalSuccessful = httpMetrics.reduce((sum, m) => sum + (m.requestCount - m.errorCount), 0)
      const totalFailed = httpMetrics.reduce((sum, m) => sum + m.errorCount, 0)
      
      // Add new data point to time series (keep last 30 points)
      // Only add if we have real data (not all zeros)
      if (totalSuccessful > 0 || totalFailed > 0) {
        setTimeSeriesData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toISOString(),
            successful: totalSuccessful,
            failed: totalFailed,
          }]
          // Keep only last 30 data points
          return newData.slice(-30)
        })
      }
    } catch (err) {
      setError('Error loading data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalRequests = apiMetrics.reduce((sum, m) => sum + m.requestCount, 0)
  const totalErrors = apiMetrics.reduce((sum, m) => sum + m.errorCount, 0)
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
  const avgResponseTime = apiMetrics.length > 0
    ? apiMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / apiMetrics.length
    : 0

  if (!currentProject) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Activity className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project from the sidebar.</p>
        </div>
      </div>
    )
  }

  if (loading && !health) {
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
        <h1 className="text-3xl font-bold text-gray-900">
          {currentProject ? `${currentProject.name} Dashboard` : 'Project Dashboard'}
        </h1>
        <p className="text-gray-600 mt-2">
          {currentProject ? 'System health and API performance metrics' : 'No project selected'}
        </p>
      </div>

      {!currentProject && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Please select a project.
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Health Status */}
      {health && (
        <div className="mb-6">
          <div className={`p-6 rounded-lg ${
            health.status === 'UP' ? 'bg-green-50 border-2 border-green-200' :
            health.status === 'DEGRADED' ? 'bg-yellow-50 border-2 border-yellow-200' :
            'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity className={`w-8 h-8 ${
                  health.status === 'UP' ? 'text-green-600' :
                  health.status === 'DEGRADED' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <div>
                  <h2 className="text-xl font-semibold">System Status: {health.status}</h2>
                  <p className="text-sm text-gray-600">Health Score: {health.score.toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(health.timestamp).toLocaleString('en-US')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Requests"
          value={totalRequests.toLocaleString()}
          icon={TrendingUp}
          trend={null}
        />
        <MetricCard
          title="Error Rate"
          value={`${errorRate.toFixed(2)}%`}
          icon={AlertTriangle}
          trend={errorRate > 5 ? 'up' : 'down'}
          trendColor={errorRate > 5 ? 'red' : 'green'}
        />
        <MetricCard
          title="Average Response Time"
          value={`${avgResponseTime.toFixed(0)}ms`}
          icon={Clock}
          trend={null}
        />
        <MetricCard
          title="Active Endpoints"
          value={apiMetrics.length.toString()}
          icon={Activity}
          trend={null}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">API Request Rate</h3>
          <ApiMetricsChart timeSeriesData={timeSeriesData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Error Rate Trend</h3>
          <ErrorRateChart data={apiMetrics} />
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Most Used Endpoints</h3>
        <TopEndpointsTable data={apiMetrics} />
      </div>
    </div>
  )
}

