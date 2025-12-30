'use client'

import { useProject } from '@/contexts/ProjectContext'
import { CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function ProjectsPage() {
  const { projects, currentProject, setCurrentProject, refreshProjects } = useProject()
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})

  const testConnection = async (projectId: string, apiUrl: string) => {
    setTesting(prev => ({ ...prev, [projectId]: true }))
    try {
      const response = await fetch(`${apiUrl}/api/v1/monitoring/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResults(prev => ({
          ...prev,
          [projectId]: { success: true, message: `Connected - Status: ${data.status || 'OK'}` },
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [projectId]: { success: false, message: `HTTP ${response.status}` },
        }))
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [projectId]: { 
          success: false, 
          message: error.name === 'AbortError' ? 'Timeout' : error.message || 'Connection failed' 
        },
      }))
    } finally {
      setTesting(prev => ({ ...prev, [projectId]: false }))
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proje Yönetimi</h1>
          <p className="text-gray-600 mt-2">Monitörize edilen projeleri görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={refreshProjects}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`bg-white rounded-lg shadow p-6 border-2 ${
              currentProject?.id === project.id
                ? 'border-blue-500'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                ></div>
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              </div>
              {currentProject?.id === project.id && (
                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                  Aktif
                </span>
              )}
            </div>

            {project.description && (
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">API URL</label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                    {project.apiUrl}
                  </code>
                  <a
                    href={project.apiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase">Durum:</span>
                {project.enabled ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Aktif
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    Pasif
                  </span>
                )}
              </div>

              {testResults[project.id] && (
                <div
                  className={`p-2 rounded text-xs ${
                    testResults[project.id].success
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {testResults[project.id].message}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {currentProject?.id !== project.id && project.enabled && (
                  <button
                    onClick={() => setCurrentProject(project)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Seç
                  </button>
                )}
                <button
                  onClick={() => testConnection(project.id, project.apiUrl)}
                  disabled={testing[project.id]}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  {testing[project.id] ? 'Test Ediliyor...' : 'Bağlantı Testi'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">Henüz proje yapılandırılmamış.</p>
          <p className="text-sm text-gray-400">
            Vercel environment variables ile projeleri yapılandırın veya development için default projeler kullanılacaktır.
          </p>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Vercel Environment Variables</h3>
        <p className="text-sm text-blue-800 mb-4">
          Vercel dashboard'unda aşağıdaki environment variable'ları ekleyerek projelerinizi yapılandırabilirsiniz:
        </p>
        <div className="bg-white rounded p-4 font-mono text-xs space-y-2">
          <div>NEXT_PUBLIC_PROJECT_1_NAME=Project 1</div>
          <div>NEXT_PUBLIC_PROJECT_1_API_URL=https://api1.example.com</div>
          <div>NEXT_PUBLIC_PROJECT_1_DESCRIPTION=First Project</div>
          <div>NEXT_PUBLIC_PROJECT_1_ENABLED=true</div>
          <div className="pt-2 border-t">...</div>
          <div>NEXT_PUBLIC_PROJECT_5_NAME=Project 5</div>
          <div>NEXT_PUBLIC_PROJECT_5_API_URL=https://api5.example.com</div>
          <div>NEXT_PUBLIC_PROJECT_5_DESCRIPTION=Fifth Project</div>
          <div>NEXT_PUBLIC_PROJECT_5_ENABLED=true</div>
        </div>
      </div>
    </div>
  )
}

