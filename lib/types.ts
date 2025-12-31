export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED'
  score: number
  timestamp: string
}

export interface ApiMetric {
  endpoint: string
  method: string
  requestCount: number
  errorCount: number
  errorRate: number
  avgResponseTime: number
  p50: number
  p95: number
  p99: number
  statusCodeDistribution: Record<string, number>
}

export interface SystemMetric {
  jvm: {
    memoryUsed: number
    memoryMax: number
    memoryUsagePercent: number
    gcPauseTime: number
    threadCount: number
  }
  database: {
    connectionPoolActive: number
    connectionPoolMax: number
    avgQueryTime: number
  }
}

export interface BusinessMetric {
  rfqCreationRate: number
  quoteConversionRate: number
  piCreationRate: number
  emailSendSuccessRate: number
  ilsApiSuccessRate: number
}

export interface ConversionFunnel {
  rfq: number
  quote: number
  pi: number
  conversionRates: {
    rfqToQuote: number
    quoteToPi: number
  }
}

export interface PIStatusDistribution {
  status: string
  count: number
  percentage: number
  color: string
}

export interface ExternalServiceMetric {
  service: string
  successRate: number
  avgResponseTime: number
  errorCount: number
  timeoutCount: number
  lastCheck: string
}

export interface LogEntry {
  timestamp: string
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG'
  logger: string
  message: string
  exception?: string
  correlationId?: string
}

export interface Alert {
  id: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  title: string
  message: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
}

export interface ErrorDistribution {
  errorCode: string
  count: number
  percentage: number
  lastOccurrence: string
}




