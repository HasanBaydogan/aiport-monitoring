'use client'

import { useEffect, useState } from 'react'
import { createMonitoringApi } from '@/lib/api'
import { LogEntry } from '@/lib/types'
import { useProject } from '@/contexts/ProjectContext'
import { Search, Filter, Download } from 'lucide-react'
import { format } from 'date-fns'

export default function LogViewer() {
  const { currentProject } = useProject()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('ALL')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!currentProject) return
    fetchLogs()
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000) // Her 5 saniyede bir güncelle
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, levelFilter, searchTerm, currentProject])

  const fetchLogs = async () => {
    if (!currentProject) return
    try {
      const monitoringApi = createMonitoringApi(currentProject)
      const params: any = { limit: 100 }
      if (levelFilter !== 'ALL') {
        params.level = levelFilter
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const response = await monitoringApi.getLogs(params).catch(() => ({ data: [] }))
      setLogs(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Viewer</h1>
          <p className="text-gray-600 mt-2">
            {currentProject ? `${currentProject.name} - Sistem loglarını görüntüleyin ve filtreleyin` : 'Proje seçilmedi'}
          </p>
        </div>
      </div>

      {!currentProject && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Lütfen bir proje seçin.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Log mesajında ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Tüm Seviyeler</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Otomatik Yenile</span>
          </label>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zaman
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seviye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesaj
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correlation ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Log bulunamadı
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={log.logger}>
                        {log.logger}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-2xl">
                        <div className="whitespace-pre-wrap break-words">{log.message}</div>
                        {log.exception && (
                          <details className="mt-2">
                            <summary className="text-red-600 cursor-pointer text-xs">Exception Detayları</summary>
                            <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-x-auto">
                              {log.exception}
                            </pre>
                          </details>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.correlationId ? (
                        <span className="font-mono text-xs">{log.correlationId.substring(0, 8)}...</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

