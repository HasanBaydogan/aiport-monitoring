'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Briefcase, Cpu, FileText, Bell, Activity, Settings, LogOut, User } from 'lucide-react'
import clsx from 'clsx'
import ProjectSelector from './ProjectSelector'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'Project Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Actuator Metrics', href: '/actuator', icon: Activity },
  { name: 'Business Dashboard', href: '/business', icon: Briefcase },
  { name: 'Technical Dashboard', href: '/technical', icon: Cpu },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Projects', href: '/projects', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">Monitoring</h1>
        </div>
      </div>
      
      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-white truncate">{user.email}</p>
              <p className="text-gray-400 text-xs truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Dashboard Link - Above Project Selector */}
      <div className="p-4 border-b border-gray-800">
        <Link
          href="/"
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
            pathname === '/'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Main Dashboard</span>
        </Link>
      </div>
      
      {/* Project Selector */}
      <div className="border-b border-gray-800">
        <ProjectSelector />
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.filter(item => item.href !== '/').map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
      
      <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
        <p>Multi-Project</p>
        <p className="mt-1">Monitoring System</p>
      </div>
    </div>
  )
}

