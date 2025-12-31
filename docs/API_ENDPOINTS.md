# Backend API Endpoint Gereksinimleri

Frontend'in çalışması için backend'de aşağıdaki API endpoint'lerinin implement edilmesi gerekmektedir.

## Base URL
Tüm endpoint'ler `/api/v1/monitoring` prefix'i ile başlamalıdır.

## Health & System Metrics

### GET /api/v1/monitoring/health
Sistem sağlık durumunu döner.

**Response:**
```json
{
  "status": "UP" | "DOWN" | "DEGRADED",
  "score": 95.5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /api/v1/monitoring/system-metrics
JVM ve Database metriklerini döner.

**Response:**
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

## API Metrics

### GET /api/v1/monitoring/api-metrics
API endpoint metriklerini döner.

**Query Parameters:**
- `timeRange` (optional): "1h", "24h", "7d"

**Response:**
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

### GET /api/v1/monitoring/endpoint-metrics
Belirli bir endpoint'in detaylı metriklerini döner.

**Query Parameters:**
- `endpoint` (optional): Endpoint path

## Business Metrics

### GET /api/v1/monitoring/business-metrics
İş metriklerini döner.

**Response:**
```json
{
  "rfqCreationRate": 25.5,
  "quoteConversionRate": 65.2,
  "piCreationRate": 18.3,
  "emailSendSuccessRate": 94.5,
  "ilsApiSuccessRate": 88.2
}
```

### GET /api/v1/monitoring/conversion-funnel
RFQ → Quote → PI conversion funnel verilerini döner.

**Response:**
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

### GET /api/v1/monitoring/pi-status-distribution
PI status dağılımını döner.

**Response:**
```json
[
  {
    "status": "TRADE_CONFIRMED",
    "count": 150,
    "percentage": 33.3,
    "color": "#3b82f6"
  }
]
```

## Technical Metrics

### GET /api/v1/monitoring/jvm-metrics
JVM metriklerini döner (system-metrics içinde de mevcut).

### GET /api/v1/monitoring/database-metrics
Database metriklerini döner (system-metrics içinde de mevcut).

### GET /api/v1/monitoring/external-service-metrics
External servis metriklerini döner.

**Response:**
```json
[
  {
    "service": "ILS SOAP API",
    "successRate": 88.5,
    "avgResponseTime": 1250.5,
    "errorCount": 15,
    "timeoutCount": 3,
    "lastCheck": "2024-01-15T10:30:00Z"
  },
  {
    "service": "SMTP Email",
    "successRate": 94.2,
    "avgResponseTime": 350.2,
    "errorCount": 8,
    "timeoutCount": 1,
    "lastCheck": "2024-01-15T10:30:00Z"
  },
  {
    "service": "OpenAI API",
    "successRate": 96.8,
    "avgResponseTime": 2100.5,
    "errorCount": 3,
    "timeoutCount": 0,
    "lastCheck": "2024-01-15T10:30:00Z"
  }
]
```

## Logs

### GET /api/v1/monitoring/logs
Log kayıtlarını döner.

**Query Parameters:**
- `level` (optional): "ERROR", "WARN", "INFO", "DEBUG"
- `limit` (optional): Kayıt sayısı (default: 100)
- `search` (optional): Arama terimi

**Response:**
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "ERROR",
    "logger": "com.example.service.RFQService",
    "message": "RFQ creation failed",
    "exception": "java.lang.RuntimeException: ...",
    "correlationId": "abc123-def456-ghi789"
  }
]
```

### GET /api/v1/monitoring/log-stats
Log istatistiklerini döner.

## Alerts

### GET /api/v1/monitoring/alerts
Aktif alert'leri döner.

**Response:**
```json
[
  {
    "id": "alert-123",
    "severity": "CRITICAL",
    "title": "High Error Rate",
    "message": "Error rate exceeded 5% threshold",
    "timestamp": "2024-01-15T10:30:00Z",
    "resolved": false
  }
]
```

### GET /api/v1/monitoring/alert-history
Alert geçmişini döner.

## Error Analysis

### GET /api/v1/monitoring/error-distribution
Error code dağılımını döner.

**Response:**
```json
[
  {
    "errorCode": "404",
    "count": 45,
    "percentage": 35.2,
    "lastOccurrence": "2024-01-15T10:30:00Z"
  }
]
```

### GET /api/v1/monitoring/error-trends
Error trend analizini döner.

## Notlar

- Tüm endpoint'ler CORS desteği sağlamalıdır.
- Response formatı JSON olmalıdır.
- Hata durumlarında uygun HTTP status code'ları dönülmelidir (400, 500, vb.).
- Tüm timestamp'ler ISO 8601 formatında olmalıdır.




