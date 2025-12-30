'use client'

import { useProject } from '@/contexts/ProjectContext'
import { ChevronDown, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function ProjectSelector() {
  const { projects, currentProject, setCurrentProject } = useProject()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const enabledProjects = projects.filter(p => p.enabled)

  if (enabledProjects.length <= 1) {
    return (
      <div className="px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentProject?.color || '#3b82f6' }}
          ></div>
          <span className="font-medium">{currentProject?.name || 'No Project'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentProject?.color || '#3b82f6' }}
          ></div>
          <span className="font-medium">{currentProject?.name || 'Select Project'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
          {enabledProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                setCurrentProject(project)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: project.color }}
                ></div>
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-gray-500">{project.description}</div>
                  )}
                </div>
              </div>
              {currentProject?.id === project.id && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

