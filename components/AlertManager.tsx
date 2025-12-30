'use client'

import { useEffect, useState } from 'react'
import { createMonitoringApi } from '@/lib/api'
import { Alert } from '@/lib/types'
import { useProject } from '@/contexts/ProjectContext'
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { format } from 'date-fns'

export default function AlertManager() {
  const { currentProject } = useProject()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL')
  const [showResolved, setShowResolved] = useState(false)

  useEffect(() => {
    if (!currentProject) return
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [currentProject])

  const fetchAlerts = async () => {
    if (!currentProject) return
    try {
      const monitoringApi = createMonitoringApi(currentProject)
      const response = await monitoringApi.getAlerts().catch(() => ({ data: [] }))
      setAlerts(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200'
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200'
      case 'INFO':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'ALL' && alert.severity !== filter) return false
    if (!showResolved && alert.resolved) return false
    return true
  })

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length
  const warningCount = alerts.filter(a => a.severity === 'WARNING' && !a.resolved).length
  const infoCount = alerts.filter(a => a.severity === 'INFO' && !a.resolved).length

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alert Yönetimi</h1>
        <p className="text-gray-600 mt-2">
          {currentProject ? `${currentProject.name} - Sistem uyarılarını ve kritik durumları izleyin` : 'Proje seçilmedi'}
        </p>
      </div>

      {!currentProject && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Lütfen bir proje seçin.
        </div>
      )}

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Toplam Alert</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kritik</p>
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Uyarı</p>
              <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bilgi</p>
              <p className="text-2xl font-bold text-blue-600">{infoCount}</p>
            </div>
            <Info className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Tüm Severity</option>
            <option value="CRITICAL">Kritik</option>
            <option value="WARNING">Uyarı</option>
            <option value="INFO">Bilgi</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Çözülen Alertleri Göster</span>
          </label>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
            Yükleniyor...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
            Alert bulunamadı
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-lg shadow border-l-4 ${
                alert.severity === 'CRITICAL' ? 'border-red-500' :
                alert.severity === 'WARNING' ? 'border-yellow-500' :
                'border-blue-500'
              } ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        alert.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'WARNING' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-200 text-green-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Çözüldü
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{alert.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Oluşturulma: {format(new Date(alert.timestamp), 'dd.MM.yyyy HH:mm:ss')}</span>
                      {alert.resolved && alert.resolvedAt && (
                        <span>Çözülme: {format(new Date(alert.resolvedAt), 'dd.MM.yyyy HH:mm:ss')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

