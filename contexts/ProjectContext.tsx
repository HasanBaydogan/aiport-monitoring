'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Project, getAllProjects } from '@/lib/projects'

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  refreshProjects: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const refreshProjects = () => {
    const allProjects = getAllProjects()
    setProjects(allProjects)
    
    // Eğer seçili proje yoksa veya artık mevcut değilse, ilk aktif projeyi seç
    if (!currentProject || !allProjects.find(p => p.id === currentProject.id)) {
      const firstEnabled = allProjects.find(p => p.enabled) || allProjects[0]
      if (firstEnabled) {
        setCurrentProject(firstEnabled)
        // LocalStorage'a kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedProjectId', firstEnabled.id)
        }
      }
    }
  }

  useEffect(() => {
    refreshProjects()
  }, [])

  useEffect(() => {
    // LocalStorage'dan seçili projeyi yükle
    if (typeof window !== 'undefined' && projects.length > 0) {
      const savedProjectId = localStorage.getItem('selectedProjectId')
      if (savedProjectId) {
        const savedProject = projects.find(p => p.id === savedProjectId)
        if (savedProject && savedProject.enabled) {
          setCurrentProject(savedProject)
          return
        }
      }
      // Eğer kayıtlı proje yoksa veya aktif değilse, ilk aktif projeyi seç
      const firstEnabled = projects.find(p => p.enabled) || projects[0]
      if (firstEnabled) {
        setCurrentProject(firstEnabled)
        localStorage.setItem('selectedProjectId', firstEnabled.id)
      }
    }
  }, [projects])

  useEffect(() => {
    // Proje değiştiğinde localStorage'a kaydet
    if (currentProject && typeof window !== 'undefined') {
      localStorage.setItem('selectedProjectId', currentProject.id)
    }
  }, [currentProject])

  return (
    <ProjectContext.Provider value={{ projects, currentProject, setCurrentProject, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

