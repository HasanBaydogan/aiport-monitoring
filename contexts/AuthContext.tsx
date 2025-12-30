'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, LoginRequest } from '@/lib/auth'
import { useProject } from './ProjectContext'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProject()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      try {
        const authenticated = authService.isAuthenticated()
        const userData = authService.getUser()
        setIsAuthenticated(authenticated && userData !== null)
        setUser(userData)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(currentProject, credentials)
      
      // Response is already normalized by authService.login
      const { accessToken, refreshToken, user: userData } = response.data
      
      if (!accessToken) {
        throw new Error('Access token not found in response')
      }
      
      // Validate token format
      const tokenDots = (accessToken.match(/\./g) || []).length
      if (tokenDots !== 2) {
        throw new Error(`Invalid JWT token format. Expected 2 dots, found: ${tokenDots}`)
      }
      
      authService.setTokens(accessToken, refreshToken || '', userData)
      setIsAuthenticated(true)
      setUser(userData)
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


