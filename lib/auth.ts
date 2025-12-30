import axios from 'axios'
import { Project } from './projects'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      email: string
      role: string
    }
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string
  }
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

export const authService = {
  // Get tokens from localStorage
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    // Validate JWT format (should have 2 dots)
    if (token && token !== 'undefined' && token !== 'null' && (token.match(/\./g) || []).length === 2) {
      return token
    }
    return null
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem(REFRESH_TOKEN_KEY)
    // Validate JWT format (should have 2 dots)
    if (token && token !== 'undefined' && token !== 'null' && (token.match(/\./g) || []).length === 2) {
      return token
    }
    return null
  },

  getUser: () => {
    if (typeof window === 'undefined') return null
    try {
      const userStr = localStorage.getItem(USER_KEY)
      if (!userStr || userStr === 'undefined' || userStr === 'null') return null
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      // Clear invalid data
      localStorage.removeItem(USER_KEY)
      return null
    }
  },

  // Set tokens
  setTokens: (accessToken: string, refreshToken: string, user: any) => {
    if (typeof window === 'undefined') return
    
    // Validate tokens before storing
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      console.error('Invalid access token')
      return
    }
    
    // Validate JWT format (should have 2 dots)
    const accessTokenDots = (accessToken.match(/\./g) || []).length
    if (accessTokenDots !== 2) {
      console.error('Invalid JWT format for access token. Expected 2 dots, found:', accessTokenDots)
      return
    }
    
    if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
      const refreshTokenDots = (refreshToken.match(/\./g) || []).length
      if (refreshTokenDots !== 2) {
        console.warn('Invalid JWT format for refresh token')
      }
    }
    
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  // Clear tokens
  clearTokens: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authService.getAccessToken()
    const user = authService.getUser()
    return token !== null && user !== null && token !== 'undefined' && token !== 'null'
  },

  // Login
  login: async (project: Project | null, credentials: LoginRequest): Promise<LoginResponse> => {
    const baseURL = project?.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'https://app.flyai.tr:8080'
    try {
      const response = await axios.post(
        `${baseURL}/api/v1/auth/login`,
        credentials
      )
      
      // Debug: Log response to see actual structure
      console.log('Login response:', response.data)
      
      // Handle backend response format
      // Backend sends: { data: { access_token, refresh_token, userId, isTwoFactorEnabled }, success, message, statusCode }
      // We need to convert to: { data: { accessToken, refreshToken, user } }
      
      const backendData = response.data.data || response.data
      
      // Convert snake_case to camelCase and create user object
      const accessToken = backendData.access_token || backendData.accessToken
      const refreshToken = backendData.refresh_token || backendData.refreshToken
      const userId = backendData.userId || backendData.user?.id
      
      if (!accessToken) {
        throw new Error('Access token not found in response')
      }
      
      // Create user object from available data
      const user = {
        id: userId || '',
        email: credentials.email,
        role: backendData.role || backendData.user?.role || 'USER',
        isTwoFactorEnabled: backendData.isTwoFactorEnabled || false
      }
      
      const responseData: LoginResponse = {
        data: {
          accessToken,
          refreshToken: refreshToken || '',
          user
        }
      }
      
      return responseData
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  },

  // Refresh token
  refreshToken: async (project: Project | null, refreshToken: string): Promise<RefreshTokenResponse> => {
    const baseURL = project?.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'https://app.flyai.tr:8080'
    try {
      const response = await axios.post(
        `${baseURL}/api/v1/auth/refresh-token`,
        { refreshToken }
      )
      
      // Handle backend response format (snake_case)
      const backendData = response.data.data || response.data
      const accessToken = backendData.access_token || backendData.accessToken
      
      if (!accessToken) {
        throw new Error('Access token not found in refresh response')
      }
      
      return {
        data: {
          accessToken
        }
      }
    } catch (error: any) {
      console.error('Refresh token error:', error.response?.data || error.message)
      throw error
    }
  },

  // Logout
  logout: () => {
    authService.clearTokens()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
}


