'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useProject } from '@/contexts/ProjectContext'
import { createMonitoringApi } from '@/lib/api'
import { ActuatorMetricsListResponse, ActuatorMetricResponse } from '@/lib/actuator'
import { Database, Cpu, Activity, Server } from 'lucide-react'

export default function ActuatorPage() {
  const { currentProject } = useProject()
  const [metricsList, setMetricsList] = useState<string[]>([])
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [metricData, setMetricData] = useState<ActuatorMetricResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMetric, setLoadingMetric] = useState(false)

  useEffect(() => {
    if (!currentProject) return
    fetchMetricsList()
  }, [currentProject])

  const fetchMetricsList = async () => {
    if (!currentProject) return
    try {
      const monitoringApi = createMonitoringApi(currentProject)
      const response = await monitoringApi.getMetricsList()
      setMetricsList(response.data.names || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetric = async (metricName: string) => {
    if (!currentProject) return
    setLoadingMetric(true)
    try {
      const monitoringApi = createMonitoringApi(currentProject)
      const response = await monitoringApi.getMetric(metricName)
      setMetricData(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMetric(false)
    }
  }

  const handleMetricClick = (metricName: string) => {
    setSelectedMetric(metricName)
    fetchMetric(metricName)
  }

  const getMetricIcon = (name: string) => {
    if (name.includes('jvm') || name.includes('memory')) return <Cpu className="w-5 h-5" />
    if (name.includes('http')) return <Activity className="w-5 h-5" />
    if (name.includes('database') || name.includes('jdbc')) return <Database className="w-5 h-5" />
    return <Server className="w-5 h-5" />
  }

  const categorizedMetrics = {
    http: metricsList.filter(m => m.includes('http')),
    jvm: metricsList.filter(m => m.includes('jvm')),
    process: metricsList.filter(m => m.includes('process')),
    system: metricsList.filter(m => !m.includes('http') && !m.includes('jvm') && !m.includes('process')),
  }

  return (
    <ProtectedRoute>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Actuator Metrics</h1>
          <p className="text-gray-600 mt-2">Spring Boot Actuator metriklerini görüntüleyin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Mevcut Metrikler</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* HTTP Metrics */}
                  {categorizedMetrics.http.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">HTTP</h3>
                      <div className="space-y-1">
                        {categorizedMetrics.http.map((metric) => (
                          <button
                            key={metric}
                            onClick={() => handleMetricClick(metric)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedMetric === metric
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getMetricIcon(metric)}
                            <span className="ml-2">{metric}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* JVM Metrics */}
                  {categorizedMetrics.jvm.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">JVM</h3>
                      <div className="space-y-1">
                        {categorizedMetrics.jvm.map((metric) => (
                          <button
                            key={metric}
                            onClick={() => handleMetricClick(metric)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedMetric === metric
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getMetricIcon(metric)}
                            <span className="ml-2">{metric}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process Metrics */}
                  {categorizedMetrics.process.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Process</h3>
                      <div className="space-y-1">
                        {categorizedMetrics.process.map((metric) => (
                          <button
                            key={metric}
                            onClick={() => handleMetricClick(metric)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedMetric === metric
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getMetricIcon(metric)}
                            <span className="ml-2">{metric}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Metrics */}
                  {categorizedMetrics.system.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Diğer</h3>
                      <div className="space-y-1">
                        {categorizedMetrics.system.map((metric) => (
                          <button
                            key={metric}
                            onClick={() => handleMetricClick(metric)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedMetric === metric
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getMetricIcon(metric)}
                            <span className="ml-2">{metric}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metric Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {selectedMetric ? (
                <>
                  <h2 className="text-lg font-semibold mb-4">{selectedMetric}</h2>
                  {loadingMetric ? (
                    <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
                  ) : metricData ? (
                    <div className="space-y-6">
                      {/* Description */}
                      {metricData.description && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Açıklama</h3>
                          <p className="text-gray-600">{metricData.description}</p>
                        </div>
                      )}

                      {/* Base Unit */}
                      {metricData.baseUnit && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Birim</h3>
                          <p className="text-gray-600">{metricData.baseUnit}</p>
                        </div>
                      )}

                      {/* Measurements */}
                      {metricData.measurements.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Ölçümler</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Statistic</th>
                                  <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {metricData.measurements.map((measurement, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="py-2 px-4 text-sm text-gray-600">{measurement.statistic}</td>
                                    <td className="py-2 px-4 text-sm text-gray-900 text-right font-mono">
                                      {measurement.value.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Available Tags */}
                      {metricData.availableTags.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Kullanılabilir Tag'ler</h3>
                          <div className="space-y-3">
                            {metricData.availableTags.map((tag, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="font-semibold text-gray-700 mb-2">{tag.tag}</div>
                                <div className="flex flex-wrap gap-2">
                                  {tag.values.map((value, vIndex) => (
                                    <span
                                      key={vIndex}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    >
                                      {value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">Metrik verisi bulunamadı</div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Bir metrik seçin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}




