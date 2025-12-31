/**
 * Actuator response parser utilities
 * Parses Spring Boot Actuator metrics into frontend format
 */

export interface ActuatorMetricResponse {
  name: string
  description: string | null
  baseUnit: string | null
  measurements: Array<{
    statistic: string
    value: number
  }>
  availableTags: Array<{
    tag: string
    values: string[]
  }>
}

export interface ParsedApiMetric {
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

/**
 * Parse Actuator http.server.requests metric response
 * Note: This requires multiple API calls (one per URI+method combination)
 * For better performance, use backend endpoint /api/v1/monitoring/api-metrics
 */
export async function parseHttpServerRequests(
  baseResponse: ActuatorMetricResponse,
  getMetricWithTags: (metricName: string, tags: Record<string, string>) => Promise<ActuatorMetricResponse>
): Promise<ParsedApiMetric[]> {
  const results: ParsedApiMetric[] = []
  
  // Get available URIs and methods
  const uriTag = baseResponse.availableTags.find(t => t.tag === 'uri')
  const methodTag = baseResponse.availableTags.find(t => t.tag === 'method')
  
  if (!uriTag || !methodTag) {
    return results
  }
  
  const uris = uriTag.values
  const methods = methodTag.values
  
  // For each URI and method combination, fetch detailed metrics
  for (const uri of uris) {
    for (const method of methods) {
      try {
        const metricResponse = await getMetricWithTags('http.server.requests', {
          uri,
          method,
        })
        
        // Extract measurements
        const countMeasurement = metricResponse.measurements.find(m => m.statistic === 'COUNT')
        const totalTimeMeasurement = metricResponse.measurements.find(m => m.statistic === 'TOTAL_TIME')
        const maxMeasurement = metricResponse.measurements.find(m => m.statistic === 'MAX')
        
        const requestCount = countMeasurement?.value || 0
        const totalTime = totalTimeMeasurement?.value || 0 // in seconds
        const avgResponseTime = requestCount > 0 ? (totalTime / requestCount) * 1000 : 0 // convert to ms
        
        // Get error count (status >= 400)
        let errorCount = 0
        try {
          const errorMetric = await getMetricWithTags('http.server.requests', {
            uri,
            method,
            status: '4xx', // or check for 400, 401, 403, 404, 500, etc.
          })
          const errorCountMeasurement = errorMetric.measurements.find(m => m.statistic === 'COUNT')
          errorCount = errorCountMeasurement?.value || 0
        } catch (e) {
          // Try to get error count by checking status codes
          const statusTag = baseResponse.availableTags.find(t => t.tag === 'status')
          if (statusTag) {
            for (const status of statusTag.values) {
              const statusCode = parseInt(status)
              if (statusCode >= 400) {
                try {
                  const statusMetric = await getMetricWithTags('http.server.requests', {
                    uri,
                    method,
                    status,
                  })
                  const statusCountMeasurement = statusMetric.measurements.find(m => m.statistic === 'COUNT')
                  errorCount += statusCountMeasurement?.value || 0
                } catch (e) {
                  // Status not available, skip
                }
              }
            }
          }
        }
        
        // Get status code distribution
        const statusCodeDistribution: Record<string, number> = {}
        const statusTag = baseResponse.availableTags.find(t => t.tag === 'status')
        if (statusTag) {
          for (const status of statusTag.values) {
            try {
              const statusMetric = await getMetricWithTags('http.server.requests', {
                uri,
                method,
                status,
              })
              const statusCountMeasurement = statusMetric.measurements.find(m => m.statistic === 'COUNT')
              if (statusCountMeasurement) {
                statusCodeDistribution[status] = statusCountMeasurement.value
              }
            } catch (e) {
              // Status not available, skip
            }
          }
        }
        
        const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0
        
        // Percentiles are not directly available in Actuator, would need histogram metrics
        // For now, use average as approximation
        const p50 = avgResponseTime
        const p95 = avgResponseTime * 1.5 // Approximation
        const p99 = avgResponseTime * 2 // Approximation
        
        if (requestCount > 0) {
          results.push({
            endpoint: uri,
            method,
            requestCount: Math.round(requestCount),
            errorCount: Math.round(errorCount),
            errorRate: parseFloat(errorRate.toFixed(2)),
            avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
            p50: parseFloat(p50.toFixed(2)),
            p95: parseFloat(p95.toFixed(2)),
            p99: parseFloat(p99.toFixed(2)),
            statusCodeDistribution,
          })
        }
      } catch (e) {
        // Skip this URI+method combination if metrics not available
        console.warn(`Failed to fetch metrics for ${method} ${uri}:`, e)
      }
    }
  }
  
  return results
}

/**
 * Simplified parser that uses only the base response (faster but less accurate)
 * This only provides endpoint list, not actual counts
 */
export function parseHttpServerRequestsSimple(
  baseResponse: ActuatorMetricResponse
): ParsedApiMetric[] {
  const results: ParsedApiMetric[] = []
  
  const uriTag = baseResponse.availableTags.find(t => t.tag === 'uri')
  const methodTag = baseResponse.availableTags.find(t => t.tag === 'method')
  
  if (!uriTag || !methodTag) {
    return results
  }
  
  // Get total count from base response
  const countMeasurement = baseResponse.measurements.find(m => m.statistic === 'COUNT')
  const totalCount = countMeasurement?.value || 0
  
  // Distribute total count across URIs (rough estimate)
  const uris = uriTag.values
  const methods = methodTag.values
  const estimatedCountPerEndpoint = totalCount / (uris.length * methods.length)
  
  for (const uri of uris) {
    for (const method of methods) {
      results.push({
        endpoint: uri,
        method,
        requestCount: Math.round(estimatedCountPerEndpoint),
        errorCount: 0,
        errorRate: 0,
        avgResponseTime: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        statusCodeDistribution: {},
      })
    }
  }
  
  return results
}



