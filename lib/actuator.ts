// Spring Boot Actuator response types

export interface ActuatorHealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN'
  components?: {
    [key: string]: {
      status: string
      details?: any
    }
  }
}

export interface ActuatorInfoResponse {
  app?: {
    name: string
    version: string
    description?: string
  }
  build?: {
    version: string
    artifact?: string
    name?: string
    group?: string
    time?: string
  }
}

export interface ActuatorMetricsListResponse {
  names: string[]
}

export interface ActuatorMetricMeasurement {
  statistic: string
  value: number
}

export interface ActuatorMetricTag {
  tag: string
  values: string[]
}

export interface ActuatorMetricResponse {
  name: string
  description: string
  baseUnit: string | null
  measurements: ActuatorMetricMeasurement[]
  availableTags: ActuatorMetricTag[]
}

// Prometheus format parser
export function parsePrometheusMetrics(prometheusText: string): Record<string, any> {
  const lines = prometheusText.split('\n')
  const metrics: Record<string, any> = {}
  let currentMetric: any = null

  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    // Parse metric line: metric_name{labels} value
    const match = trimmed.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s*\{([^}]*)\}\s*([0-9.]+)$/)
    if (match) {
      const [, name, labelsStr, value] = match
      const labels: Record<string, string> = {}
      
      if (labelsStr) {
        labelsStr.split(',').forEach(label => {
          const [key, val] = label.split('=')
          if (key && val) {
            labels[key.trim()] = val.trim().replace(/^"|"$/g, '')
          }
        })
      }

      if (!metrics[name]) {
        metrics[name] = []
      }
      metrics[name].push({
        labels,
        value: parseFloat(value),
      })
    } else {
      // Try without labels: metric_name value
      const simpleMatch = trimmed.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s+([0-9.]+)$/)
      if (simpleMatch) {
        const [, name, value] = simpleMatch
        if (!metrics[name]) {
          metrics[name] = []
        }
        metrics[name].push({
          labels: {},
          value: parseFloat(value),
        })
      }
    }
  }

  return metrics
}

// Helper functions to extract specific metrics
export function extractHttpServerRequests(metrics: ActuatorMetricResponse) {
  const result: any = {
    total: 0,
    byMethod: {} as Record<string, number>,
    byUri: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  }

  // Extract from measurements
  const countMeasurement = metrics.measurements.find(m => m.statistic === 'COUNT')
  if (countMeasurement) {
    result.total = countMeasurement.value
  }

  // Extract from tags
  metrics.availableTags.forEach(tag => {
    if (tag.tag === 'method') {
      tag.values.forEach(method => {
        result.byMethod[method] = 0 // Will need to fetch with tag filter for actual values
      })
    } else if (tag.tag === 'uri') {
      tag.values.forEach(uri => {
        result.byUri[uri] = 0
      })
    } else if (tag.tag === 'status') {
      tag.values.forEach(status => {
        result.byStatus[status] = 0
      })
    }
  })

  return result
}

export function extractJvmMemory(usedMetric: ActuatorMetricResponse, maxMetric: ActuatorMetricResponse) {
  const used = usedMetric.measurements.find(m => m.statistic === 'VALUE')?.value || 0
  const max = maxMetric.measurements.find(m => m.statistic === 'VALUE')?.value || 0
  const percentage = max > 0 ? (used / max) * 100 : 0

  return {
    used,
    max,
    percentage,
    free: max - used,
  }
}




