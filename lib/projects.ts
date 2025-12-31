export interface Project {
  id: string
  name: string
  apiUrl: string
  description?: string
  color?: string
  enabled: boolean
}

// Vercel environment variables'den projeleri yükle
// Format: NEXT_PUBLIC_PROJECT_1_NAME, NEXT_PUBLIC_PROJECT_1_API_URL, vb.
export function getProjectsFromEnv(): Project[] {
  const projects: Project[] = []
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  
  for (let i = 1; i <= 5; i++) {
    const name = process.env[`NEXT_PUBLIC_PROJECT_${i}_NAME`]
    const apiUrl = process.env[`NEXT_PUBLIC_PROJECT_${i}_API_URL`]
    const description = process.env[`NEXT_PUBLIC_PROJECT_${i}_DESCRIPTION`]
    const enabled = process.env[`NEXT_PUBLIC_PROJECT_${i}_ENABLED`] !== 'false'
    
    if (name && apiUrl) {
      projects.push({
        id: `project-${i}`,
        name,
        apiUrl,
        description,
        color: colors[i - 1],
        enabled,
      })
    }
  }
  
  return projects
}

// Default projeler (development için)
export const defaultProjects: Project[] = [
  {
    id: 'project-1',
    name: 'SMT V1 Backend',
    apiUrl: 'https://test.flyai.tr:8080',
    description: 'Spring Boot Backend',
    color: '#3b82f6',
    enabled: true,
  },
  {
    id: 'project-2',
    name: 'Project 2',
    apiUrl: 'http://localhost:8081',
    description: 'Second Project',
    color: '#10b981',
    enabled: true,
  },
  {
    id: 'project-3',
    name: 'Project 3',
    apiUrl: 'http://localhost:8082',
    description: 'Third Project',
    color: '#f59e0b',
    enabled: true,
  },
  {
    id: 'project-4',
    name: 'Project 4',
    apiUrl: 'http://localhost:8083',
    description: 'Fourth Project',
    color: '#ef4444',
    enabled: true,
  },
  {
    id: 'project-5',
    name: 'Project 5',
    apiUrl: 'http://localhost:8084',
    description: 'Fifth Project',
    color: '#8b5cf6',
    enabled: true,
  },
]

export function getAllProjects(): Project[] {
  const envProjects = getProjectsFromEnv()
  if (envProjects.length > 0) {
    return envProjects
  }
  return defaultProjects
}

