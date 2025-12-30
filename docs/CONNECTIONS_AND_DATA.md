# Bağlantılar ve Toplanan Veriler Listesi

Bu dokümantasyon, frontend uygulamasının backend API'lerine yaptığı tüm bağlantıları ve toplanan verileri detaylı olarak listeler.

## 📡 Base URL Yapılandırması

### Varsayılan API URL
- **Development**: `http://localhost:8080`
- **Production**: `https://app.flyai.tr:8080`
- **Environment Variable**: `NEXT_PUBLIC_API_URL`

### Proje Bazlı URL Yönetimi
- Her proje kendi API URL'ine sahip olabilir
- Proje yapılandırması environment variable'lardan yüklenir
- Format: `NEXT_PUBLIC_PROJECT_{N}_API_URL`
- Maksimum 5 proje desteklenir

---

## 🔐 Authentication Endpoints

### 1. Login
**Endpoint**: `POST /api/v1/auth/login`  
**Authentication**: Gerekli değil  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Format** (Backend):
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": "12345",
    "isTwoFactorEnabled": false
  },
  "success": true,
  "message": "Login successful",
  "statusCode": 200
}
```

**Toplanan Veriler**:
- `accessToken` (JWT) - localStorage'a kaydedilir
- `refreshToken` (JWT) - localStorage'a kaydedilir
- `user` object:
  - `id`: Kullanıcı ID
  - `email`: Kullanıcı email
  - `role`: Kullanıcı rolü (USER, ADMIN, vb.)
  - `isTwoFactorEnabled`: 2FA durumu

**Kullanım Yeri**: `lib/auth.ts` - `login()` fonksiyonu

---

### 2. Refresh Token
**Endpoint**: `POST /api/v1/auth/refresh-token`  
**Authentication**: Gerekli değil (refresh token body'de gönderilir)  
**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response Format**:
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Toplanan Veriler**:
- `accessToken` (Yeni JWT token)

**Kullanım Yeri**: 
- `lib/auth.ts` - `refreshToken()` fonksiyonu
- `lib/api.ts` - Response interceptor (401 hatası durumunda otomatik çağrılır)

---

## 📊 Spring Boot Actuator Endpoints

### 1. Health Check
**Endpoint**: `GET /actuator/health`  
**Authentication**: Gerekli değil (Public endpoint)  
**Method**: `monitoringApi.getHealth()`

**Response Format**:
```json
{
  "status": "UP" | "DOWN" | "DEGRADED"
}
```

**Toplanan Veriler**:
- `status`: Sistem sağlık durumu
- `score`: Health score (100 = UP, 0 = DOWN)
- `timestamp`: Kontrol zamanı

**Kullanım Yeri**: 
- `components/Dashboard.tsx` - Ana dashboard'da sistem durumu gösterimi
- Her 10 saniyede bir otomatik güncellenir

---

### 2. Application Info
**Endpoint**: `GET /actuator/info`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getInfo()`

**Toplanan Veriler**:
- Uygulama bilgileri (versiyon, build info, vb.)

**Kullanım Yeri**: `app/actuator/page.tsx` - Actuator metrics sayfası

---

### 3. Metrics List
**Endpoint**: `GET /actuator/metrics`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getMetricsList()`

**Response Format**:
```json
{
  "names": [
    "http.server.requests",
    "jvm.memory.used",
    "jvm.threads.live",
    "process.uptime",
    ...
  ]
}
```

**Toplanan Veriler**:
- Tüm mevcut metrik isimlerinin listesi

**Kullanım Yeri**: `app/actuator/page.tsx` - Metrik listesi gösterimi

---

### 4. Specific Metric
**Endpoint**: `GET /actuator/metrics/{metricName}?tag={key}:{value}`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getMetric(metricName, tags?)`

**Response Format**:
```json
{
  "name": "http.server.requests",
  "description": "HTTP server requests",
  "baseUnit": null,
  "measurements": [
    {
      "statistic": "COUNT",
      "value": 1234
    },
    {
      "statistic": "TOTAL_TIME",
      "value": 567890
    }
  ],
  "availableTags": [
    {
      "tag": "uri",
      "values": ["/api/v1/rfq/create", "/api/v1/quote/convert"]
    },
    {
      "tag": "method",
      "values": ["GET", "POST", "PUT"]
    },
    {
      "tag": "status",
      "values": ["200", "400", "500"]
    }
  ]
}
```

**Toplanan Veriler**:
- Metrik adı
- Açıklama
- Birim (baseUnit)
- Ölçümler (measurements):
  - COUNT: Toplam sayı
  - TOTAL_TIME: Toplam süre
  - MAX: Maksimum değer
  - vb.
- Mevcut tag'ler ve değerleri

**Kullanım Yeri**: `app/actuator/page.tsx` - Metrik detayları gösterimi

---

### 5. HTTP Server Requests
**Endpoint**: `GET /actuator/metrics/http.server.requests?tag={key}:{value}`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getHttpServerRequests(tags?)`

**Toplanan Veriler**:
- HTTP istek metrikleri
- URI bazlı istek sayıları
- Method bazlı dağılım
- Status code dağılımı

**Kullanım Yeri**: 
- `components/Dashboard.tsx` - API metrikleri gösterimi
- Her 10 saniyede bir otomatik güncellenir

---

### 6. JVM Memory Metrics
**Endpoints**:
- `GET /actuator/metrics/jvm.memory.used`
- `GET /actuator/metrics/jvm.memory.max`
- `GET /actuator/metrics/jvm.memory.committed`

**Authentication**: JWT Bearer Token gerekli  
**Methods**: 
- `monitoringApi.getJvmMemoryUsed()`
- `monitoringApi.getJvmMemoryMax()`
- `monitoringApi.getJvmMemoryCommitted()`

**Toplanan Veriler**:
- Kullanılan bellek (bytes)
- Maksimum bellek (bytes)
- Committed bellek (bytes)

---

### 7. JVM Thread Metrics
**Endpoints**:
- `GET /actuator/metrics/jvm.threads.live`
- `GET /actuator/metrics/jvm.threads.peak`

**Authentication**: JWT Bearer Token gerekli  
**Methods**: 
- `monitoringApi.getJvmThreadsLive()`
- `monitoringApi.getJvmThreadsPeak()`

**Toplanan Veriler**:
- Canlı thread sayısı
- Peak thread sayısı

---

### 8. Process Metrics
**Endpoints**:
- `GET /actuator/metrics/process.uptime`
- `GET /actuator/metrics/process.cpu.usage`

**Authentication**: JWT Bearer Token gerekli  
**Methods**: 
- `monitoringApi.getProcessUptime()`
- `monitoringApi.getProcessCpuUsage()`

**Toplanan Veriler**:
- Uptime (saniye)
- CPU kullanım yüzdesi

---

### 9. GC Metrics
**Endpoint**: `GET /actuator/metrics/jvm.gc.pause`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getJvmGcPause()`

**Toplanan Veriler**:
- GC pause süreleri
- GC sayıları

---

### 10. Prometheus Metrics
**Endpoint**: `GET /actuator/prometheus`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getPrometheusMetrics()`

**Response Format**: Plain text (Prometheus format)

**Toplanan Veriler**:
- Tüm metrikler Prometheus formatında

---

## 🔄 Legacy Monitoring Endpoints (Backward Compatibility)

Bu endpoint'ler backend'de implement edilmediğinde hata vermez, boş/null data döner.

### 1. System Metrics
**Endpoint**: `GET /api/v1/monitoring/system-metrics`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getSystemMetrics()`

**Beklenen Response**:
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

**Toplanan Veriler**:
- JVM metrikleri (bellek, GC, thread)
- Database metrikleri (connection pool, query time)

**Kullanım Yeri**: `components/TechnicalDashboard.tsx`

---

### 2. API Metrics
**Endpoint**: `GET /api/v1/monitoring/api-metrics?timeRange={range}`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getApiMetrics(timeRange?)`

**Query Parameters**:
- `timeRange` (optional): "1h", "24h", "7d"

**Beklenen Response**:
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

**Toplanan Veriler**:
- Endpoint bazlı metrikler
- İstek sayıları
- Hata sayıları ve oranları
- Response time metrikleri (avg, p50, p95, p99)
- Status code dağılımı

---

### 3. Business Metrics
**Endpoint**: `GET /api/v1/monitoring/business-metrics`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getBusinessMetrics()`

**Beklenen Response**:
```json
{
  "rfqCreationRate": 25.5,
  "quoteConversionRate": 65.2,
  "piCreationRate": 18.3,
  "emailSendSuccessRate": 94.5,
  "ilsApiSuccessRate": 88.2
}
```

**Toplanan Veriler**:
- RFQ oluşturma hızı (saat başına)
- Quote dönüşüm oranı (%)
- PI oluşturma hızı (saat başına)
- Email gönderme başarı oranı (%)
- ILS API başarı oranı (%)

**Kullanım Yeri**: `components/BusinessDashboard.tsx`  
**Güncelleme Sıklığı**: Her 15 saniyede bir

---

### 4. Conversion Funnel
**Endpoint**: `GET /api/v1/monitoring/conversion-funnel`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getConversionFunnel()`

**Beklenen Response**:
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

**Toplanan Veriler**:
- RFQ sayısı
- Quote sayısı
- PI sayısı
- Dönüşüm oranları

**Kullanım Yeri**: `components/BusinessDashboard.tsx`

---

### 5. PI Status Distribution
**Endpoint**: `GET /api/v1/monitoring/pi-status-distribution`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getPIStatusDistribution()`

**Beklenen Response**:
```json
[
  {
    "status": "PAYMENT_RECEIVED_FROM_CLIENT_FULLY",
    "count": 150,
    "percentage": 33.3,
    "color": "#10b981"
  },
  {
    "status": "PAID_TO_SUPPLIER_FULLY",
    "count": 100,
    "percentage": 22.2,
    "color": "#3b82f6"
  }
]
```

**Toplanan Veriler**:
- PI status dağılımı
- Her status için sayı ve yüzde
- Renk bilgisi (görselleştirme için)

**Kullanım Yeri**: `components/BusinessDashboard.tsx`

---

### 6. JVM Metrics
**Endpoint**: `GET /api/v1/monitoring/jvm-metrics`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getJvmMetrics()`

**Toplanan Veriler**: JVM detaylı metrikleri

---

### 7. Database Metrics
**Endpoint**: `GET /api/v1/monitoring/database-metrics`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getDatabaseMetrics()`

**Toplanan Veriler**: Database detaylı metrikleri

---

### 8. External Service Metrics
**Endpoint**: `GET /api/v1/monitoring/external-service-metrics`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getExternalServiceMetrics()`

**Beklenen Response**:
```json
[
  {
    "service": "ILS SOAP API",
    "successRate": 92.5,
    "avgResponseTime": 1250,
    "errorCount": 15,
    "timeoutCount": 3,
    "lastCheck": "2024-01-15T10:30:00Z"
  },
  {
    "service": "SMTP Email Service",
    "successRate": 96.8,
    "avgResponseTime": 450,
    "errorCount": 8,
    "timeoutCount": 1,
    "lastCheck": "2024-01-15T10:30:00Z"
  }
]
```

**Toplanan Veriler**:
- Servis adı
- Başarı oranı (%)
- Ortalama response time (ms)
- Hata sayısı
- Timeout sayısı
- Son kontrol zamanı

**Kullanım Yeri**: `components/TechnicalDashboard.tsx` - External Service Table

---

### 9. Logs
**Endpoint**: `GET /api/v1/monitoring/logs?level={level}&limit={limit}&search={search}`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getLogs(params?)`

**Query Parameters**:
- `level` (optional): "ERROR", "WARN", "INFO", "DEBUG"
- `limit` (optional): Maksimum log sayısı (default: 100)
- `search` (optional): Arama terimi

**Beklenen Response**:
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

**Toplanan Veriler**:
- Timestamp
- Log seviyesi
- Logger adı
- Mesaj
- Exception stack trace (varsa)
- Correlation ID

**Kullanım Yeri**: `components/LogViewer.tsx`  
**Güncelleme Sıklığı**: Her 5 saniyede bir (auto-refresh açıksa)

---

### 10. Log Stats
**Endpoint**: `GET /api/v1/monitoring/log-stats`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getLogStats()`

**Toplanan Veriler**: Log istatistikleri

---

### 11. Alerts
**Endpoint**: `GET /api/v1/monitoring/alerts`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getAlerts()`

**Beklenen Response**:
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

**Toplanan Veriler**:
- Alert ID
- Severity (CRITICAL, WARNING, INFO)
- Başlık
- Mesaj
- Oluşturulma zamanı
- Çözülme durumu
- Çözülme zamanı (varsa)

**Kullanım Yeri**: `components/AlertManager.tsx`  
**Güncelleme Sıklığı**: Her 10 saniyede bir

---

### 12. Alert History
**Endpoint**: `GET /api/v1/monitoring/alert-history`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getAlertHistory()`

**Toplanan Veriler**: Geçmiş alert kayıtları

---

### 13. Error Distribution
**Endpoint**: `GET /api/v1/monitoring/error-distribution`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getErrorDistribution()`

**Toplanan Veriler**: Hata kodlarına göre dağılım

---

### 14. Error Trends
**Endpoint**: `GET /api/v1/monitoring/error-trends`  
**Authentication**: JWT Bearer Token gerekli  
**Method**: `monitoringApi.getErrorTrends()`

**Toplanan Veriler**: Hata trend analizi

---

## 📦 Frontend'de Toplanan ve Saklanan Veriler

### LocalStorage'da Saklanan Veriler

1. **Access Token** (`accessToken`)
   - JWT token
   - Her API isteğinde Authorization header'ında gönderilir
   - Otomatik refresh mekanizması var

2. **Refresh Token** (`refreshToken`)
   - JWT token
   - Access token expire olduğunda kullanılır

3. **User Data** (`user`)
   - Kullanıcı bilgileri (JSON formatında)
   - İçerik: `{ id, email, role, isTwoFactorEnabled }`

### State'de Tutulan Veriler

1. **Health Status** (`components/Dashboard.tsx`)
   - Sistem sağlık durumu
   - Health score
   - Timestamp

2. **API Metrics** (`components/Dashboard.tsx`)
   - Endpoint bazlı metrikler
   - İstek sayıları
   - Hata sayıları
   - Response time metrikleri

3. **Time Series Data** (`components/Dashboard.tsx`)
   - Zaman bazlı başarılı/başarısız istek sayıları
   - Son 30 veri noktası tutulur
   - Her 10 saniyede bir güncellenir

4. **Business Metrics** (`components/BusinessDashboard.tsx`)
   - RFQ, Quote, PI metrikleri
   - Conversion funnel verileri
   - PI status dağılımı

5. **System Metrics** (`components/TechnicalDashboard.tsx`)
   - JVM metrikleri
   - Database metrikleri
   - External service metrikleri

6. **Logs** (`components/LogViewer.tsx`)
   - Sistem logları
   - Filtrelenmiş ve aranabilir

7. **Alerts** (`components/AlertManager.tsx`)
   - Sistem uyarıları
   - Severity bazlı filtreleme

---

## 🔄 Otomatik Güncelleme Sıklıkları

| Component | Endpoint | Güncelleme Sıklığı |
|-----------|----------|-------------------|
| Dashboard | `/actuator/health` | 10 saniye |
| Dashboard | `/actuator/metrics/http.server.requests` | 10 saniye |
| Business Dashboard | `/api/v1/monitoring/business-metrics` | 15 saniye |
| Business Dashboard | `/api/v1/monitoring/conversion-funnel` | 15 saniye |
| Business Dashboard | `/api/v1/monitoring/pi-status-distribution` | 15 saniye |
| Technical Dashboard | `/api/v1/monitoring/system-metrics` | 10 saniye |
| Technical Dashboard | `/api/v1/monitoring/external-service-metrics` | 10 saniye |
| Log Viewer | `/api/v1/monitoring/logs` | 5 saniye (auto-refresh açıksa) |
| Alert Manager | `/api/v1/monitoring/alerts` | 10 saniye |

---

## 🔒 Authentication Mekanizması

### JWT Token Yönetimi

1. **Token Format Validation**
   - JWT token'ların 2 nokta (`.`) içermesi kontrol edilir
   - Geçersiz token'lar localStorage'dan temizlenir

2. **Automatic Token Refresh**
   - 401 Unauthorized hatası alındığında otomatik refresh yapılır
   - Refresh token ile yeni access token alınır
   - Orijinal istek yeni token ile tekrar denenir

3. **Request Interceptor**
   - Her API isteğinde Authorization header'ına token eklenir
   - Token format kontrolü yapılır

4. **Response Interceptor**
   - 401 hatalarında otomatik token refresh
   - Refresh başarısız olursa logout yapılır

---

## 📊 Veri Akışı

### Dashboard Veri Akışı

```
Dashboard Component
  ↓
fetchData() (her 10 saniyede)
  ↓
createMonitoringApi(currentProject)
  ↓
├─ getHealth() → /actuator/health
└─ getHttpServerRequests() → /actuator/metrics/http.server.requests
  ↓
State Update
  ├─ health (HealthStatus)
  ├─ apiMetrics (ApiMetric[])
  └─ timeSeriesData (TimeSeriesDataPoint[])
  ↓
UI Render
  ├─ Health Status Card
  ├─ Metric Cards
  ├─ API Request Rate Chart
  ├─ Error Rate Chart
  └─ Top Endpoints Table
```

### Business Dashboard Veri Akışı

```
BusinessDashboard Component
  ↓
fetchData() (her 15 saniyede)
  ↓
createMonitoringApi(currentProject)
  ↓
├─ getBusinessMetrics() → /api/v1/monitoring/business-metrics
├─ getConversionFunnel() → /api/v1/monitoring/conversion-funnel
└─ getPIStatusDistribution() → /api/v1/monitoring/pi-status-distribution
  ↓
State Update
  ├─ businessMetrics (BusinessMetric)
  ├─ funnel (ConversionFunnel)
  └─ piStatus (PIStatusDistribution[])
  ↓
UI Render
  ├─ Business Metric Cards
  ├─ Conversion Funnel Chart
  └─ PI Status Distribution Chart
```

---

## 🛠️ Hata Yönetimi

### Error Handling Stratejisi

1. **Actuator Endpoints**
   - Hata durumunda `.catch()` ile boş/null data döner
   - UI'da hata mesajı gösterilir

2. **Legacy Endpoints**
   - Backend'de implement edilmemişse hata vermez
   - `.catch(() => ({ data: null }))` ile güvenli fallback

3. **Network Errors**
   - Timeout: 30 saniye
   - Connection errors UI'da gösterilir

4. **Authentication Errors**
   - 401: Otomatik token refresh
   - Refresh başarısız: Logout ve login sayfasına yönlendirme

---

## 📝 Notlar

1. **CORS**: Backend'de CORS yapılandırması gerekli
2. **HTTPS**: Production'da HTTPS kullanılmalı
3. **Token Security**: JWT token'lar localStorage'da saklanıyor (XSS riski var, production'da httpOnly cookie önerilir)
4. **Rate Limiting**: Backend'de rate limiting uygulanmalı
5. **Error Logging**: Frontend'de console.error ile loglama yapılıyor, production'da error tracking servisi önerilir

---

## 🔗 İlgili Dosyalar

- `lib/api.ts` - API client yapılandırması
- `lib/auth.ts` - Authentication servisi
- `lib/projects.ts` - Proje yapılandırması
- `lib/types.ts` - TypeScript interface'leri
- `components/Dashboard.tsx` - Ana dashboard
- `components/BusinessDashboard.tsx` - İş dashboard'u
- `components/TechnicalDashboard.tsx` - Teknik dashboard
- `components/LogViewer.tsx` - Log görüntüleyici
- `components/AlertManager.tsx` - Alert yöneticisi

