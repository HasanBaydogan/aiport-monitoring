import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { AuthProvider } from '@/contexts/AuthContext'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'Airport Monitoring Dashboard',
  description: 'Multi-Project Monitoring System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <ProjectProvider>
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </ProjectProvider>
      </body>
    </html>
  )
}

