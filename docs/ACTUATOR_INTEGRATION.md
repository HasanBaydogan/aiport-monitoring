# Spring Boot Actuator Entegrasyonu

Bu dokümantasyon, Frontend Monitoring Dashboard'un Spring Boot Actuator endpoint'lerini nasıl kullandığını açıklar.

## Actuator Endpoint'leri

### 1. Health Check

**Endpoint:** `GET /actuator/health`

**Authentication:** Gerekli değil (public endpoint)

**Kullanım:**
```typescript
const health = await monitoringApi.getHealth()
// Response: { status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN' }
```

### 2. Metrics List

**Endpoint:** `GET /actuator/metrics`

**Authentication:** Gerekli (JWT token)

**Kullanım:**
```typescript
const metricsList = await monitoringApi.getMetricsList()
// Response: { names: string[] }
```

### 3. Specific Metric

**Endpoint:** `GET /actuator/metrics/{metric.name}`

**Authentication:** Gerekli (JWT token)

**Query Parameters:**
- `tag`: Tag-based filtering (örn: `tag=method:GET,uri:/api/v1/rfq/create`)

**Kullanım:**
```typescript
// Basit kullanım
const metric = await monitoringApi.getMetric('http.server.requests')

// Tag ile filtreleme
const metric = await monitoringApi.getMetric('http.server.requests', {
  method: 'POST',
  uri: '/api/v1/rfq/create',
  status: '200'
})
```

**Response:**
```json
{
  "name": "http.server.requests",
  "description": "Total number of HTTP requests",
  "baseUnit": null,
  "measurements": [
    {
      "statistic": "COUNT",
      "value": 1234
    }
  ],
  "availableTags": [
    {
      "tag": "method",
      "values": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "tag": "uri",
      "values": ["/api/v1/rfq/create", "/api/v1/pi/wizard"]
    },
    {
      "tag": "status",
      "values": ["200", "400", "404", "500"]
    }
  ]
}
```

### 4. Prometheus Format

**Endpoint:** `GET /actuator/prometheus`

**Authentication:** Gerekli (JWT token)

**Kullanım:**
```typescript
const prometheusData = await monitoringApi.getPrometheusMetrics()
// Response: string (Prometheus text format)
```

**Örnek Çıktı:**
```
# HELP http_server_requests_seconds_count Total number of HTTP requests
# TYPE http_server_requests_seconds_count counter
http_server_requests_seconds_count{method="POST",uri="/api/v1/rfq/create",status="200"} 1234
```

### 5. Application Info

**Endpoint:** `GET /actuator/info`

**Authentication:** Gerekli (JWT token)

**Kullanım:**
```typescript
const info = await monitoringApi.getInfo()
// Response: { app: { name: string, version: string } }
```

## Önemli Metrikler

### HTTP Server Requests

- **Metric Name:** `http.server.requests`
- **Tags:** `method`, `uri`, `status`
- **Measurements:** `COUNT`, `TOTAL_TIME`, `MAX`

**Kullanım:**
```typescript
// Tüm HTTP istekleri
const allRequests = await monitoringApi.getHttpServerRequests()

// Sadece POST istekleri
const postRequests = await monitoringApi.getHttpServerRequests({ method: 'POST' })

// Belirli bir endpoint
const rfqRequests = await monitoringApi.getHttpServerRequests({ 
  uri: '/api/v1/rfq/create' 
})

// Başarılı istekler
const successRequests = await monitoringApi.getHttpServerRequests({ 
  status: '200' 
})
```

### JVM Memory

- **Metric Names:**
  - `jvm.memory.used` - Kullanılan bellek
  - `jvm.memory.max` - Maksimum bellek
  - `jvm.memory.committed` - Committed bellek

**Kullanım:**
```typescript
const memoryUsed = await monitoringApi.getJvmMemoryUsed()
const memoryMax = await monitoringApi.getJvmMemoryMax()
```

### JVM Threads

- **Metric Names:**
  - `jvm.threads.live` - Aktif thread sayısı
  - `jvm.threads.peak` - Peak thread sayısı

**Kullanım:**
```typescript
const threadsLive = await monitoringApi.getJvmThreadsLive()
```

### Process Metrics

- **Metric Names:**
  - `process.uptime` - Uptime (saniye)
  - `process.cpu.usage` - CPU kullanımı (0-1 arası)

**Kullanım:**
```typescript
const uptime = await monitoringApi.getProcessUptime()
const cpuUsage = await monitoringApi.getProcessCpuUsage()
```

## Frontend'de Kullanım

### Actuator Metrics Sayfası

`/actuator` sayfasında tüm metrikler listelenir ve detayları görüntülenebilir.

### Dashboard Entegrasyonu

Ana Dashboard'da Actuator health endpoint'i kullanılır:

```typescript
const health = await monitoringApi.getHealth()
```

### Prometheus Parsing

Prometheus format verilerini parse etmek için:

```typescript
import { parsePrometheusMetrics } from '@/lib/actuator'

const prometheusText = await monitoringApi.getPrometheusMetrics()
const parsed = parsePrometheusMetrics(prometheusText)
```

## Backend Yapılandırması

### application.yml

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
      cors:
        allowed-origins: 
          - http://localhost:3000
          - https://app.asparel.com.tr
        allowed-methods: GET,POST,OPTIONS
        allowed-headers: "*"
        allow-credentials: true
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true
```

### Security Configuration

Actuator endpoint'lerini korumak için:

```java
@Configuration
public class ActuatorSecurityConfig {
    
    @Bean
    public SecurityFilterChain actuatorSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .requestMatchers("/actuator/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());
        
        return http.build();
    }
}
```

## Troubleshooting

### 401 Unauthorized

- JWT token'ın geçerli olduğundan emin olun
- Token'ın `Authorization: Bearer <token>` formatında gönderildiğinden emin olun
- Token'ın expire olmadığından emin olun

### CORS Hatası

- Backend'de CORS yapılandırmasını kontrol edin
- Frontend domain'inin allowed origins listesinde olduğundan emin olun

### Metric Bulunamadı

- Metric adının doğru olduğundan emin olun
- Metric'in aktif olduğundan emin olun (Spring Boot Actuator'da bazı metrikler varsayılan olarak kapalı olabilir)

## Best Practices

1. **Health Check**: Public endpoint olarak bırakın (uptime monitoring için)
2. **Metrics**: JWT ile koruyun (sensitive bilgiler içerebilir)
3. **Caching**: Metrics verilerini cache'leyin (sık güncelleme gerekmeyebilir)
4. **Error Handling**: Actuator endpoint'leri için proper error handling yapın
5. **Tag Filtering**: Büyük metrikler için tag filtering kullanın




