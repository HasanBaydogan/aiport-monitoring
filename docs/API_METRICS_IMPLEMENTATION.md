# API Metrics Implementation Guide

## Problem

Frontend'de şu anda Actuator'dan gelen veriler düzgün parse edilmiyor. `requestCount`, `errorCount`, `avgResponseTime` gibi değerler 0 olarak gösteriliyor.

**Mevcut Durum (Frontend):**
```typescript
// components/Dashboard.tsx - Satır 51-62
httpMetrics = httpRes.data.availableTags?.find((tag: any) => tag.tag === 'uri')?.values?.map((uri: string) => ({
  endpoint: uri,
  method: 'GET', // ❌ Sabit değer
  requestCount: 0, // ❌ Her zaman 0
  errorCount: 0, // ❌ Her zaman 0
  errorRate: 0, // ❌ Her zaman 0
  avgResponseTime: 0, // ❌ Her zaman 0
  ...
})) || []
```

## Çözüm: Backend'de API Metrics Endpoint'i Implement Etmek

### Neden Backend'de?

1. **Performans**: Frontend'de her URI için ayrı API çağrısı yapmak yerine, backend'de tek seferde tüm verileri toplayıp döndürmek çok daha hızlı
2. **Veri Aggregation**: Backend'de Actuator metriklerini toplayıp, hesaplamaları yapıp, formatlanmış veri döndürmek daha mantıklı
3. **Karmaşıklık**: Frontend'de karmaşık parsing logic'i yerine, backend'de temiz bir API endpoint'i

## Backend Implementation

### Endpoint: `GET /api/v1/monitoring/api-metrics`

**Request:**
```
GET /api/v1/monitoring/api-metrics?timeRange=1h
```

**Query Parameters:**
- `timeRange` (optional): "1h", "24h", "7d" (default: "1h")

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
  },
  {
    "endpoint": "/api/v1/quote/convert/{rfqMailId}",
    "method": "POST",
    "requestCount": 850,
    "errorCount": 5,
    "errorRate": 0.59,
    "avgResponseTime": 320.2,
    "p50": 250,
    "p95": 520,
    "p99": 750,
    "statusCodeDistribution": {
      "200": 845,
      "400": 3,
      "500": 2
    }
  }
]
```

## Backend Implementation Steps

### 1. Actuator Metriklerini Toplama

Spring Boot Actuator'dan `http.server.requests` metriklerini toplayın:

```java
@Autowired
private MeterRegistry meterRegistry;

public List<ApiMetricDTO> getApiMetrics(String timeRange) {
    // 1. http.server.requests metriğini al
    Meter httpRequestsMeter = meterRegistry.find("http.server.requests").meter();
    
    // 2. Tüm URI'leri al
    List<String> uris = getAvailableUris();
    
    // 3. Her URI için metrikleri topla
    List<ApiMetricDTO> metrics = new ArrayList<>();
    
    for (String uri : uris) {
        ApiMetricDTO metric = new ApiMetricDTO();
        metric.setEndpoint(uri);
        
        // Her method için (GET, POST, vb.)
        for (String method : Arrays.asList("GET", "POST", "PUT", "DELETE")) {
            // Tag ile filtrele
            Measurement measurement = meterRegistry.find("http.server.requests")
                .tag("uri", uri)
                .tag("method", method)
                .meter()
                .measure()
                .iterator()
                .next();
            
            // COUNT statistic'ini al
            double count = measurement.getValue();
            
            // Error count (status >= 400)
            double errorCount = getErrorCount(uri, method);
            
            // Response time (TOTAL_TIME / COUNT)
            double totalTime = getTotalTime(uri, method);
            double avgResponseTime = count > 0 ? totalTime / count : 0;
            
            // Percentile'ları hesapla (p50, p95, p99)
            // Bu için histogram verilerine ihtiyaç var
            double p50 = calculatePercentile(uri, method, 50);
            double p95 = calculatePercentile(uri, method, 95);
            double p99 = calculatePercentile(uri, method, 99);
            
            metric.setMethod(method);
            metric.setRequestCount((long) count);
            metric.setErrorCount((long) errorCount);
            metric.setErrorRate(count > 0 ? (errorCount / count) * 100 : 0);
            metric.setAvgResponseTime(avgResponseTime);
            metric.setP50(p50);
            metric.setP95(p95);
            metric.setP99(p99);
            
            // Status code distribution
            Map<String, Long> statusDistribution = getStatusCodeDistribution(uri, method);
            metric.setStatusCodeDistribution(statusDistribution);
        }
        
        metrics.add(metric);
    }
    
    return metrics;
}
```

### 2. Alternatif: Micrometer ile Daha Kolay Yöntem

```java
@Service
public class ApiMetricsService {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    public List<ApiMetricDTO> getApiMetrics(String timeRange) {
        List<ApiMetricDTO> metrics = new ArrayList<>();
        
        // http.server.requests metriğini al
        Counter counter = meterRegistry.counter("http.server.requests");
        
        // Tüm tag kombinasyonlarını al
        List<Tag> allTags = getAvailableTags();
        
        for (Tag tag : allTags) {
            String uri = tag.getValue("uri");
            String method = tag.getValue("method");
            
            if (uri == null || method == null) continue;
            
            // Bu tag kombinasyonu için metrikleri al
            Counter uriCounter = meterRegistry.counter("http.server.requests", 
                "uri", uri, 
                "method", method);
            
            Timer uriTimer = meterRegistry.timer("http.server.requests",
                "uri", uri,
                "method", method);
            
            ApiMetricDTO metric = new ApiMetricDTO();
            metric.setEndpoint(uri);
            metric.setMethod(method);
            metric.setRequestCount((long) uriCounter.count());
            metric.setAvgResponseTime(uriTimer.mean(TimeUnit.MILLISECONDS));
            
            // Error count (status >= 400)
            Counter errorCounter = meterRegistry.counter("http.server.requests",
                "uri", uri,
                "method", method,
                "status", "4xx", "5xx"); // veya her status code için ayrı ayrı
            
            metric.setErrorCount((long) errorCounter.count());
            metric.setErrorRate(metric.getRequestCount() > 0 
                ? (metric.getErrorCount() / metric.getRequestCount()) * 100 
                : 0);
            
            // Percentile'lar
            DistributionSummary summary = meterRegistry.summary("http.server.requests",
                "uri", uri,
                "method", method);
            
            metric.setP50(summary.percentile(0.5));
            metric.setP95(summary.percentile(0.95));
            metric.setP99(summary.percentile(0.99));
            
            // Status code distribution
            Map<String, Long> statusDist = getStatusDistribution(uri, method);
            metric.setStatusCodeDistribution(statusDist);
            
            metrics.add(metric);
        }
        
        return metrics;
    }
}
```

### 3. DTO Sınıfı

```java
public class ApiMetricDTO {
    private String endpoint;
    private String method;
    private Long requestCount;
    private Long errorCount;
    private Double errorRate;
    private Double avgResponseTime;
    private Double p50;
    private Double p95;
    private Double p99;
    private Map<String, Long> statusCodeDistribution;
    
    // Getters and Setters
}
```

### 4. Controller

```java
@RestController
@RequestMapping("/api/v1/monitoring")
public class MonitoringController {
    
    @Autowired
    private ApiMetricsService apiMetricsService;
    
    @GetMapping("/api-metrics")
    public ResponseEntity<List<ApiMetricDTO>> getApiMetrics(
            @RequestParam(required = false, defaultValue = "1h") String timeRange) {
        List<ApiMetricDTO> metrics = apiMetricsService.getApiMetrics(timeRange);
        return ResponseEntity.ok(metrics);
    }
}
```

## Frontend'de Kullanım

Backend endpoint'i implement edildikten sonra, frontend'de sadece bu endpoint'i çağırmak yeterli:

```typescript
// components/Dashboard.tsx
const fetchData = async () => {
  const monitoringApi = createMonitoringApi(currentProject)
  
  // Backend endpoint'ini kullan
  const apiMetricsRes = await monitoringApi.getApiMetrics('1h')
  setApiMetrics(apiMetricsRes.data) // Artık gerçek veriler gelecek
}
```

## Özet

✅ **Backend'de implement edilmeli** çünkü:
- Daha performanslı (tek API çağrısı)
- Daha temiz kod (frontend'de karmaşık parsing yok)
- Daha kolay maintain (backend'de logic toplanmış)

❌ **Frontend'de parse etmek** zor çünkü:
- Her URI için ayrı API çağrısı gerekir (yavaş)
- Karmaşık parsing logic
- Actuator response format'ını anlamak gerekir

## Sonuç

Backend'de `/api/v1/monitoring/api-metrics` endpoint'ini implement edin. Frontend zaten bu endpoint'i çağırmaya hazır (`lib/api.ts` - satır 141-142).

