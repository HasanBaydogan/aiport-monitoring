'use client'

import { useEffect, useState } from 'react'
import { createMonitoringApi } from '@/lib/api'
import { SystemMetric, ExternalServiceMetric } from '@/lib/types'
import { useProject } from '@/contexts/ProjectContext'
import MetricCard from './MetricCard'
import { Cpu, Database, Globe, Activity } from 'lucide-react'
import JvmMetricsChart from './JvmMetricsChart'
import ExternalServiceTable from './ExternalServiceTable'

export default function TechnicalDashboard() {
  const { currentProject } = useProject()
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric | null>(null)
  const [externalServices, setExternalServices] = useState<ExternalServiceMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentProject) return
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [currentProject])

  const fetchData = async () => {
    if (!currentProject) return
    try {
      const monitoringApi = createMonitoringApi(currentProject)
      const [systemRes, externalRes] = await Promise.all([
        monitoringApi.getSystemMetrics().catch(() => ({ data: null })),
        monitoringApi.getExternalServiceMetrics().catch(() => ({ data: [] })),
      ])
      setSystemMetrics(systemRes.data)
      setExternalServices(externalRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !systemMetrics) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Technical Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {currentProject ? `${currentProject.name} - JVM, Database and External Service metrics` : 'No project selected'}
        </p>
      </div>

      {!currentProject && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Please select a project.
        </div>
      )}

      {/* JVM Metrics */}
      {systemMetrics && systemMetrics.jvm ? (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">JVM Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard
                title="Memory Usage"
                value={`${(systemMetrics.jvm.memoryUsagePercent || 0).toFixed(1)}%`}
                icon={Activity}
                trendColor={(systemMetrics.jvm.memoryUsagePercent || 0) > 80 ? 'red' : 'green'}
              />
              <MetricCard
                title="Used Memory"
                value={`${((systemMetrics.jvm.memoryUsed || 0) / 1024 / 1024 / 1024).toFixed(2)} GB`}
                icon={Cpu}
              />
              <MetricCard
                title="Maximum Memory"
                value={`${((systemMetrics.jvm.memoryMax || 0) / 1024 / 1024 / 1024).toFixed(2)} GB`}
                icon={Cpu}
              />
              <MetricCard
                title="Thread Count"
                value={(systemMetrics.jvm.threadCount || 0).toString()}
                icon={Activity}
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <JvmMetricsChart data={systemMetrics.jvm} />
            </div>
          </div>

          {/* Database Metrics */}
          {systemMetrics.database && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Database Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Active Connections"
                  value={`${systemMetrics.database.connectionPoolActive || 0}/${systemMetrics.database.connectionPoolMax || 0}`}
                  icon={Database}
                  trendColor={
                    systemMetrics.database.connectionPoolMax > 0 &&
                    (systemMetrics.database.connectionPoolActive || 0) / systemMetrics.database.connectionPoolMax > 0.8
                      ? 'red' : 'green'
                  }
                />
                <MetricCard
                  title="Maximum Connections"
                  value={(systemMetrics.database.connectionPoolMax || 0).toString()}
                  icon={Database}
                />
                <MetricCard
                  title="Average Query Time"
                  value={`${(systemMetrics.database.avgQueryTime || 0).toFixed(0)}ms`}
                  icon={Database}
                  trendColor={(systemMetrics.database.avgQueryTime || 0) > 1000 ? 'red' : 'green'}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-800">
          System metrics not available. Backend endpoint /api/v1/monitoring/system-metrics needs to be implemented.
        </div>
      )}

      {/* External Services */}
      <div>
        <h2 className="text-xl font-semibold mb-4">External Service Metrics</h2>
        <ExternalServiceTable data={externalServices} />
      </div>
    </div>
  )
}

