# Backend Monitoring API Implementation Prompt

## Task
Implement REST API endpoints for a monitoring dashboard frontend. All endpoints must be under `/api/v1/monitoring` and require JWT Bearer Token authentication (except where noted).

## Required Endpoints

### 1. GET `/api/v1/monitoring/system-metrics`
Return JVM and database metrics:
```json
{
  "jvm": {
    "memoryUsed": number (bytes),
    "memoryMax": number (bytes),
    "memoryUsagePercent": number (0-100),
    "gcPauseTime": number (ms),
    "threadCount": number
  },
  "database": {
    "connectionPoolActive": number,
    "connectionPoolMax": number,
    "avgQueryTime": number (ms)
  }
}
```

### 2. GET `/api/v1/monitoring/api-metrics?timeRange={1h|24h|7d}`
Return API endpoint metrics aggregated by endpoint:
```json
[
  {
    "endpoint": string (e.g., "/api/v1/rfq/create"),
    "method": string ("GET", "POST", etc.),
    "requestCount": number,
    "errorCount": number,
    "errorRate": number (percentage),
    "avgResponseTime": number (ms),
    "p50": number (ms),
    "p95": number (ms),
    "p99": number (ms),
    "statusCodeDistribution": { "200": number, "400": number, "500": number, ... }
  }
]
```

### 3. GET `/api/v1/monitoring/business-metrics`
Return business process metrics:
```json
{
  "rfqCreationRate": number (per hour),
  "quoteConversionRate": number (percentage),
  "piCreationRate": number (per hour),
  "emailSendSuccessRate": number (percentage),
  "ilsApiSuccessRate": number (percentage)
}
```

### 4. GET `/api/v1/monitoring/conversion-funnel`
Return RFQ → Quote → PI conversion data:
```json
{
  "rfq": number,
  "quote": number,
  "pi": number,
  "conversionRates": {
    "rfqToQuote": number (percentage),
    "quoteToPi": number (percentage)
  }
}
```

### 5. GET `/api/v1/monitoring/pi-status-distribution`
Return PI status distribution:
```json
[
  {
    "status": string,
    "count": number,
    "percentage": number (0-100),
    "color": string (hex color)
  }
]
```

### 6. GET `/api/v1/monitoring/external-service-metrics`
Return external service health metrics:
```json
[
  {
    "service": string (e.g., "ILS SOAP API", "SMTP Email Service"),
    "successRate": number (percentage),
    "avgResponseTime": number (ms),
    "errorCount": number,
    "timeoutCount": number,
    "lastCheck": string (ISO 8601 timestamp)
  }
]
```

### 7. GET `/api/v1/monitoring/logs?level={ERROR|WARN|INFO|DEBUG}&limit={number}&search={string}`
Return filtered application logs:
```json
[
  {
    "timestamp": string (ISO 8601),
    "level": string ("ERROR", "WARN", "INFO", "DEBUG"),
    "logger": string (class name),
    "message": string,
    "exception": string (optional, stack trace),
    "correlationId": string (optional)
  }
]
```

### 8. GET `/api/v1/monitoring/alerts`
Return system alerts:
```json
[
  {
    "id": string,
    "severity": string ("CRITICAL", "WARNING", "INFO"),
    "title": string,
    "message": string,
    "timestamp": string (ISO 8601),
    "resolved": boolean,
    "resolvedAt": string (ISO 8601, optional)
  }
]
```

## Implementation Guidelines

1. **Data Sources**: Aggregate from existing entities (RFQ, Quote, PI, Logs) and Spring Boot Actuator metrics
2. **Performance**: Optimize queries, use caching if needed, target <2s response time
3. **Error Handling**: Return proper HTTP status codes, empty arrays `[]` or `null` if no data
4. **Authentication**: All endpoints require `Authorization: Bearer {token}` header (verify JWT)
5. **CORS**: Enable CORS for frontend domain
6. **Real-time**: Data should be relatively fresh (frontend polls every 5-15 seconds)

## Priority
1. High: system-metrics, api-metrics, business-metrics, logs, alerts
2. Medium: conversion-funnel, pi-status-distribution, external-service-metrics

## Spring Boot Actuator (Optional)
If Actuator is enabled, ensure `/actuator/health` is public and other endpoints require JWT.



