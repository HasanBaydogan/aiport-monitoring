import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { Project } from './projects'
import { authService } from './auth'

// Dynamic API instance factory with JWT token support
export function createApiInstance(project: Project | null): AxiosInstance {
  const baseURL = project?.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'https://test.flyai.tr:8080'
  
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - JWT token ekleme
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = authService.getAccessToken()
      if (token && config.headers) {
        // Validate token format before sending
        const tokenDots = (token.match(/\./g) || []).length
        if (tokenDots === 2) {
          config.headers.Authorization = `Bearer ${token}`
        } else {S
          console.warn('Invalid JWT token format, not adding to request')
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor - Token refresh and error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // CORS Error Detection
      if (!error.response && error.message) {
        const isCorsError = 
          error.message.includes('CORS') ||
          error.message.includes('Access-Control') ||
          error.message.includes('blocked by CORS policy') ||
          error.code === 'ERR_NETWORK' ||
          error.code === 'ECONNABORTED'
        
        if (isCorsError) {
          console.error('CORS Error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            message: 'CORS policy blocked the request. Please check backend CORS configuration.',
            suggestion: 'Backend should allow origin: ' + (typeof window !== 'undefined' ? window.location.origin : 'frontend origin')
          })
        }
      }

      // 401 Unauthorized - Token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = authService.getRefreshToken()
          if (!refreshToken) {
            throw new Error('No refresh token')
          }

          const response = await authService.refreshToken(project, refreshToken)
          const { accessToken } = response.data
          
          // Update token in storage
          const user = authService.getUser()
          const oldRefreshToken = authService.getRefreshToken()
          if (user && oldRefreshToken) {
            authService.setTokens(accessToken, oldRefreshToken, user)
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          return instance(originalRequest)
        } catch (refreshError) {
          // Refresh token da geçersiz, logout yap
          authService.logout()
          return Promise.reject(refreshError)
        }
      }

      // Enhanced error logging for debugging
      if (error.response) {
        const status = error.response.status
        const url = originalRequest?.url || 'unknown'
        
        // Log specific error types
        if (status === 503) {
          console.warn(`Service Unavailable (503) for ${url}. Backend service may be down or overloaded.`)
        } else if (status === 404) {
          console.warn(`Not Found (404) for ${url}. Endpoint may not exist or path is incorrect.`)
        } else if (status >= 500) {
          console.error(`Server Error (${status}) for ${url}. Backend server error.`)
        } else if (status >= 400) {
          console.warn(`Client Error (${status}) for ${url}.`)
        }
      }

      return Promise.reject(error)
    }
  )

  return instance
}

// Default instance (will be overridden by project context)
const api = createApiInstance(null)

// Spring Boot Actuator API endpoints factory
export function createMonitoringApi(project: Project | null) {
  const apiInstance = createApiInstance(project)
  
  return {
    // Health Check (Public - no auth required)
    getHealth: () => apiInstance.get('/actuator/health'),
    
    // Application Info
    getInfo: () => apiInstance.get('/actuator/info'),
    
    // Metrics List
    getMetricsList: () => apiInstance.get('/actuator/metrics'),
    
    // Specific Metric
    getMetric: (metricName: string, tags?: Record<string, string>) => {
      // Validate and encode metric name
      if (!metricName || metricName.includes('{') || metricName.includes('}')) {
        throw new Error(`Invalid metric name: ${metricName}`)
      }
      let url = `/actuator/metrics/${encodeURIComponent(metricName)}`
      if (tags) {
        const tagParams = Object.entries(tags)
          .map(([key, value]) => {
            // Validate tag values - no placeholders or invalid characters
            if (value && (value.includes('{') || value.includes('}'))) {
              console.warn(`Invalid tag value detected: ${key}=${value}`)
              return null
            }
            return `${key}:${value}`
          })
          .filter(Boolean)
          .join(',')
        if (tagParams) {
          url += `?tag=${encodeURIComponent(tagParams)}`
        }
      }
      return apiInstance.get(url.trim()) // Remove any trailing whitespace
    },
    
    // Prometheus Format
    getPrometheusMetrics: () => 
      apiInstance.get('/actuator/prometheus', {
        headers: {
          'Accept': 'text/plain',
        },
      }),
    
    // HTTP Server Requests (with tags)
    getHttpServerRequests: (tags?: { method?: string; uri?: string; status?: string }) => 
      apiInstance.get('/actuator/metrics/http.server.requests', {
        params: tags ? { tag: Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(',') } : undefined,
      }),
    
    // JVM Memory
    getJvmMemoryUsed: () => apiInstance.get('/actuator/metrics/jvm.memory.used'),
    getJvmMemoryMax: () => apiInstance.get('/actuator/metrics/jvm.memory.max'),
    getJvmMemoryCommitted: () => apiInstance.get('/actuator/metrics/jvm.memory.committed'),
    
    // JVM Threads
    getJvmThreadsLive: () => apiInstance.get('/actuator/metrics/jvm.threads.live'),
    getJvmThreadsPeak: () => apiInstance.get('/actuator/metrics/jvm.threads.peak'),
    
    // Process Metrics
    getProcessUptime: () => apiInstance.get('/actuator/metrics/process.uptime'),
    getProcessCpuUsage: () => apiInstance.get('/actuator/metrics/process.cpu.usage'),
    
    // GC Metrics
    getJvmGcPause: () => apiInstance.get('/actuator/metrics/jvm.gc.pause'),
    
    // Legacy endpoints (for backward compatibility - can be removed if not needed)
    getSystemMetrics: () => apiInstance.get('/api/v1/monitoring/system-metrics').catch(() => ({ data: null })),
    getApiMetrics: (timeRange?: string) => 
      apiInstance.get('/api/v1/monitoring/api-metrics', { params: { timeRange } }).catch(() => ({ data: [] })),
    getBusinessMetrics: () => apiInstance.get('/api/v1/monitoring/business-metrics').catch(() => ({ data: null })),
    getConversionFunnel: () => apiInstance.get('/api/v1/monitoring/conversion-funnel').catch(() => ({ data: null })),
    getPIStatusDistribution: () => apiInstance.get('/api/v1/monitoring/pi-status-distribution').catch(() => ({ data: [] })),
    getJvmMetrics: () => apiInstance.get('/api/v1/monitoring/jvm-metrics').catch(() => ({ data: null })),
    getDatabaseMetrics: () => apiInstance.get('/api/v1/monitoring/database-metrics').catch(() => ({ data: null })),
    getExternalServiceMetrics: () => apiInstance.get('/api/v1/monitoring/external-service-metrics').catch(() => ({ data: [] })),
    getLogs: (params?: { level?: string; limit?: number; search?: string }) => 
      apiInstance.get('/api/v1/monitoring/logs', { params }).catch(() => ({ data: [] })),
    getLogStats: () => apiInstance.get('/api/v1/monitoring/log-stats').catch(() => ({ data: null })),
    getAlerts: () => apiInstance.get('/api/v1/monitoring/alerts').catch(() => ({ data: [] })),
    getAlertHistory: () => apiInstance.get('/api/v1/monitoring/alert-history').catch(() => ({ data: [] })),
    getErrorDistribution: () => apiInstance.get('/api/v1/monitoring/error-distribution').catch(() => ({ data: [] })),
    getErrorTrends: () => apiInstance.get('/api/v1/monitoring/error-trends').catch(() => ({ data: [] })),
  }
}

// Default instance for backward compatibility
export const monitoringApi = createMonitoringApi(null)

export default api

