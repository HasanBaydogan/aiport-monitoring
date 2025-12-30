# Backend API Requirements for Monitoring Frontend

## Base Configuration
- Base URL: `https://app.flyai.tr:8080` (or configurable per project)
- All endpoints under `/api/v1/monitoring` require JWT Bearer Token authentication
- CORS must be enabled for frontend domain
- Response format: JSON

## Required Endpoints

### 1. Authentication (Already exists, verify format)
**POST** `/api/v1/auth/login`
- Request: `{ "email": string, "password": string }`
- Response: `{ "data": { "access_token": string, "refresh_token": string, "userId": string, "isTwoFactorEnabled": boolean }, "success": boolean, "message": string, "statusCode": number }`

**POST** `/api/v1/auth/refresh-token`
- Request: `{ "refreshToken": string }`
- Response: `{ "data": { "access_token": string } }`

### 2. System Health
**GET** `/api/v1/monitoring/system-metrics`
- Response:
```json
{
  "jvm": {
    "memoryUsed": 2147483648,
    "memoryMax": 4294967296,
    "memoryUsagePercent": 50.0,
    "gcPauseTime": 150.5,
    "threadCount": 45
  },
  "database": {
    "connectionPoolActive": 5,
    "connectionPoolMax": 20,
    "avgQueryTime": 125.3
  }
}
```

### 3. API Metrics
**GET** `/api/v1/monitoring/api-metrics?timeRange={1h|24h|7d}`
- Response:
```json
[
  {
    "endpoint": "/api/v1/rfq/create",
    "method": "POST",
    "requestCount": 1250,
    "errorCount": 12,
    "errorRate": 0.96,
    "avgResponseTime": 245.5,
    "p50": 180,
    "p95": 450,
    "p99": 680,
    "statusCodeDistribution": {
      "200": 1238,
      "400": 8,
      "500": 4
    }
  }
]
```

### 4. Business Metrics
**GET** `/api/v1/monitoring/business-metrics`
- Response:
```json
{
  "rfqCreationRate": 25.5,
  "quoteConversionRate": 65.2,
  "piCreationRate": 18.3,
  "emailSendSuccessRate": 94.5,
  "ilsApiSuccessRate": 88.2
}
```

### 5. Conversion Funnel
**GET** `/api/v1/monitoring/conversion-funnel`
- Response:
```json
{
  "rfq": 1000,
  "quote": 650,
  "pi": 450,
  "conversionRates": {
    "rfqToQuote": 65.0,
    "quoteToPi": 69.2
  }
}
```

### 6. PI Status Distribution
**GET** `/api/v1/monitoring/pi-status-distribution`
- Response:
```json
[
  {
    "status": "PAYMENT_RECEIVED_FROM_CLIENT_FULLY",
    "count": 150,
    "percentage": 33.3,
    "color": "#10b981"
  }
]
```

### 7. External Service Metrics
**GET** `/api/v1/monitoring/external-service-metrics`
- Response:
```json
[
  {
    "service": "ILS SOAP API",
    "successRate": 92.5,
    "avgResponseTime": 1250,
    "errorCount": 15,
    "timeoutCount": 3,
    "lastCheck": "2024-01-15T10:30:00Z"
  }
]
```

### 8. Logs
**GET** `/api/v1/monitoring/logs?level={ERROR|WARN|INFO|DEBUG}&limit={number}&search={string}`
- Response:
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "ERROR",
    "logger": "com.example.service.RFQService",
    "message": "Failed to create RFQ",
    "exception": "java.lang.RuntimeException: ...",
    "correlationId": "abc123def456"
  }
]
```

### 9. Alerts
**GET** `/api/v1/monitoring/alerts`
- Response:
```json
[
  {
    "id": "alert-123",
    "severity": "CRITICAL",
    "title": "High Error Rate",
    "message": "Error rate exceeded 5% threshold",
    "timestamp": "2024-01-15T10:30:00Z",
    "resolved": false,
    "resolvedAt": null
  }
]
```

## Spring Boot Actuator Endpoints (Optional but Recommended)

Frontend also uses Actuator endpoints. Ensure these are enabled:
- `/actuator/health` (public, no auth)
- `/actuator/metrics` (JWT required)
- `/actuator/metrics/{metricName}` (JWT required)
- `/actuator/info` (JWT required)
- `/actuator/prometheus` (JWT required)

## Implementation Notes

1. **Error Handling**: Return proper HTTP status codes. Frontend handles errors gracefully.
2. **Performance**: Endpoints should respond within 2-3 seconds for good UX.
3. **Data Aggregation**: Calculate metrics from existing database/logs (RFQ, Quote, PI, Logs, etc.).
4. **Real-time Updates**: Frontend polls every 5-15 seconds, so data should be relatively fresh.
5. **Null Safety**: If data is not available, return empty arrays `[]` or `null` for objects.

## Priority Order

1. **High Priority**: `/system-metrics`, `/api-metrics`, `/business-metrics`, `/logs`, `/alerts`
2. **Medium Priority**: `/conversion-funnel`, `/pi-status-distribution`, `/external-service-metrics`
3. **Low Priority**: Actuator endpoints (if not already enabled)

## Example Implementation Approach

- Use Spring Boot Actuator for system/JVM metrics
- Aggregate API metrics from request logs/interceptors
- Calculate business metrics from RFQ/Quote/PI entities
- Parse application logs for log viewer
- Implement alert rules based on thresholds (error rate > 5%, etc.)

