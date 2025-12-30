'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useProject } from '@/contexts/ProjectContext'
import { Project } from '@/lib/projects'
import { CheckCircle, XCircle, Settings, Globe, Edit2 } from 'lucide-react'

export default function ProjectsPage() {
  const { projects, currentProject, setCurrentProject, refreshProjects } = useProject()
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [editedProjects, setEditedProjects] = useState<Project[]>([])

  useEffect(() => {
    setEditedProjects([...projects])
  }, [projects])

  const handleToggleEnabled = (projectId: string) => {
    setEditedProjects(prev =>
      prev.map(p =>
        p.id === projectId ? { ...p, enabled: !p.enabled } : p
      )
    )
  }

  const getStatusColor = (project: Project) => {
    if (!project.enabled) return 'bg-gray-100 text-gray-600'
    // Burada API health check yapılabilir
    return 'bg-green-100 text-green-800'
  }

  return (
    <ProtectedRoute>
      <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proje Yönetimi</h1>
        <p className="text-gray-600 mt-2">Monitörize edilen projeleri yönetin</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Not:</strong> Proje yapılandırması environment variable'lar üzerinden yapılır. 
          Değişiklikler için Vercel Dashboard'dan environment variable'ları güncelleyin ve yeniden deploy edin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editedProjects.map((project) => (
          <div
            key={project.id}
            className={`bg-white rounded-lg shadow-lg border-2 ${
              currentProject?.id === project.id
                ? 'border-blue-500'
                : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                {currentProject?.id === project.id && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                    Aktif
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 break-all">{project.apiUrl}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {project.enabled ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-400 font-medium">Pasif</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (project.enabled) {
                        setCurrentProject(project)
                      }
                    }}
                    disabled={!project.enabled}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      project.enabled
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {currentProject?.id === project.id ? 'Seçili' : 'Seç'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editedProjects.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz proje yapılandırılmamış
          </h3>
          <p className="text-gray-600 mb-4">
            Environment variable'ları yapılandırarak projelerinizi ekleyin.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left max-w-2xl mx-auto">
            <p className="text-sm text-gray-700 font-mono">
              NEXT_PUBLIC_PROJECT_1_NAME=Proje Adı<br />
              NEXT_PUBLIC_PROJECT_1_API_URL=https://api.example.com<br />
              NEXT_PUBLIC_PROJECT_1_DESCRIPTION=Açıklama<br />
              NEXT_PUBLIC_PROJECT_1_ENABLED=true
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Environment Variable Formatı
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Her proje için aşağıdaki format kullanılır (1-5 arası):
        </p>
        <div className="bg-white p-4 rounded border border-blue-200">
          <code className="text-sm text-gray-800">
            NEXT_PUBLIC_PROJECT_<strong>N</strong>_NAME=Proje Adı<br />
            NEXT_PUBLIC_PROJECT_<strong>N</strong>_API_URL=https://api.example.com<br />
            NEXT_PUBLIC_PROJECT_<strong>N</strong>_DESCRIPTION=Açıklama (opsiyonel)<br />
            NEXT_PUBLIC_PROJECT_<strong>N</strong>_ENABLED=true (opsiyonel, default: true)
          </code>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
