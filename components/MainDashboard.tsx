'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { createMonitoringApi } from '@/lib/api'
import { useProject } from '@/contexts/ProjectContext'
import { Project } from '@/lib/projects'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProjectHealth {
  project: Project
  status: 'UP' | 'DOWN' | 'UNKNOWN'
  score: number
  timestamp: string
  totalRequests?: number
  errorRate?: number
  avgResponseTime?: number
  loading: boolean
  error?: string
}

export default function MainDashboard() {
  const { projects, setCurrentProject } = useProject()
  const router = useRouter()
  const [projectHealths, setProjectHealths] = useState<ProjectHealth[]>([])

  useEffect(() => {
    fetchAllProjectsHealth()
    const interval = setInterval(fetchAllProjectsHealth, 15000) // Her 15 saniyede bir güncelle
    return () => clearInterval(interval)
  }, [projects])

  const fetchAllProjectsHealth = async () => {
    const enabledProjects = projects.filter(p => p.enabled)
    
    const healthPromises = enabledProjects.map(async (project) => {
      const health: ProjectHealth = {
        project,
        status: 'UNKNOWN',
        score: 0,
        timestamp: new Date().toISOString(),
        loading: true,
      }

      try {
        const monitoringApi = createMonitoringApi(project)
        
        // Health check
        const healthRes = await monitoringApi.getHealth().catch(() => ({ 
          data: { status: 'DOWN' as const } 
        }))

        // Try to get API metrics from backend endpoint or Actuator
        let totalRequests = 0
        let totalErrors = 0
        let avgResponseTime = 0

        try {
          // Try backend endpoint first (preferred - most accurate)
          const apiMetricsRes = await monitoringApi.getApiMetrics('1h')
          if (apiMetricsRes.data && apiMetricsRes.data.length > 0) {
            totalRequests = apiMetricsRes.data.reduce((sum: number, m: any) => sum + (m.requestCount || 0), 0)
            totalErrors = apiMetricsRes.data.reduce((sum: number, m: any) => sum + (m.errorCount || 0), 0)
            const totalResponseTime = apiMetricsRes.data.reduce((sum: number, m: any) => sum + (m.avgResponseTime || 0), 0)
            avgResponseTime = apiMetricsRes.data.length > 0 ? totalResponseTime / apiMetricsRes.data.length : 0
          } else {
            // Fallback: Parse Actuator endpoint for real metrics
            const httpRes = await monitoringApi.getHttpServerRequests()
            const baseResponse = httpRes.data
            
            if (baseResponse && baseResponse.measurements) {
              const countMeasurement = baseResponse.measurements.find((m: any) => m.statistic === 'COUNT')
              const totalTimeMeasurement = baseResponse.measurements.find((m: any) => m.statistic === 'TOTAL_TIME')
              
              totalRequests = countMeasurement?.value || 0
              const totalTime = totalTimeMeasurement?.value || 0 // in seconds
              avgResponseTime = totalRequests > 0 ? (totalTime / totalRequests) * 1000 : 0 // convert to ms
              
              // Calculate error count from status codes
              const statusTag = baseResponse.availableTags?.find((tag: any) => tag.tag === 'status')
              if (statusTag && statusTag.values) {
                // Count error status codes (4xx, 5xx)
                for (const status of statusTag.values) {
                  const statusCode = parseInt(status)
                  if (statusCode >= 400) {
                    try {
                      const statusMetric = await monitoringApi.getMetric('http.server.requests', { status })
                      const statusCount = statusMetric.data.measurements?.find((m: any) => m.statistic === 'COUNT')?.value || 0
                      totalErrors += statusCount
                    } catch (e) {
                      // Status not available, skip
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          // Backend endpoint not implemented yet, metrics will be 0
          console.warn('API metrics endpoint not available:', e)
        }

        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0

        health.status = healthRes.data.status === 'UP' ? 'UP' : 'DOWN'
        health.score = health.status === 'UP' ? 100 : 0
        health.totalRequests = totalRequests
        health.errorRate = errorRate
        health.avgResponseTime = avgResponseTime
        health.loading = false
      } catch (err: any) {
        health.status = 'DOWN'
        health.score = 0
        health.error = err.message || 'Failed to fetch data'
        health.loading = false
      }

      return health
    })

    const healths = await Promise.all(healthPromises)
    setProjectHealths(healths)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UP':
        return 'bg-green-50 border-green-200'
      case 'DOWN':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'DOWN':
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <Activity className="w-6 h-6 text-gray-400" />
    }
  }

  const enabledProjects = projects.filter(p => p.enabled)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Main Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of all monitored projects - General information and status
        </p>
      </div>

      {enabledProjects.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Activity className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Projects Configured</h2>
          <p className="text-gray-600">Please configure projects in the Projects page.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projectHealths.map((health) => (
            <div
              key={health.project.id}
              onClick={() => {
                setCurrentProject(health.project)
                router.push('/dashboard')
              }}
              className="block"
            >
              <div className={`bg-white rounded-lg shadow-lg border-2 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer ${getStatusColor(health.status)}`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: health.project.color }}
                      ></div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {health.project.name} Dashboard
                        </h2>
                        {health.project.description && (
                          <p className="text-sm text-gray-600 mt-1">{health.project.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(health.status)}
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          health.status === 'UP' ? 'text-green-600' :
                          health.status === 'DOWN' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {health.status}
                        </div>
                        <div className="text-sm text-gray-500">
                          Score: {health.score.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Status</span>
                      </div>
                      <div className={`text-xl font-bold ${
                        health.status === 'UP' ? 'text-green-600' :
                        health.status === 'DOWN' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {health.status}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Total Requests</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {health.totalRequests?.toLocaleString() || 'N/A'}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Error Rate</span>
                      </div>
                      <div className={`text-xl font-bold ${
                        (health.errorRate || 0) > 5 ? 'text-red-600' :
                        (health.errorRate || 0) > 1 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {health.errorRate !== undefined ? `${health.errorRate.toFixed(2)}%` : 'N/A'}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Avg Response</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {health.avgResponseTime !== undefined ? `${health.avgResponseTime.toFixed(0)}ms` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* API URL */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium">API URL:</span>
                      <span className="font-mono">{health.project.apiUrl}</span>
                    </div>
                  </div>

                  {health.loading && (
                    <div className="mt-4 text-sm text-gray-500">Loading...</div>
                  )}

                  {health.error && (
                    <div className="mt-4 text-sm text-red-600">Error: {health.error}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

