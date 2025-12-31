# Multi-Project Yapılandırma Rehberi

Bu dokümantasyon, 5 farklı projeyi monitörize etmek için yapılandırma talimatlarını içerir.

## Genel Bakış

Monitoring sistemi, aynı anda 5 farklı projeyi monitörize edebilir. Her proje kendi API URL'ine sahiptir ve bağımsız olarak izlenir.

## Yapılandırma Formatı

Her proje için aşağıdaki environment variable'lar kullanılır:

```
NEXT_PUBLIC_PROJECT_{N}_NAME=Proje Adı
NEXT_PUBLIC_PROJECT_{N}_API_URL=https://api.example.com
NEXT_PUBLIC_PROJECT_{N}_DESCRIPTION=Açıklama (opsiyonel)
NEXT_PUBLIC_PROJECT_{N}_ENABLED=true (opsiyonel, default: true)
```

`{N}` 1-5 arası bir sayıdır.

## Local Development

`.env.local` dosyası oluşturun:

```env
# Project 1
NEXT_PUBLIC_PROJECT_1_NAME=SMT V1 Backend
NEXT_PUBLIC_PROJECT_1_API_URL=http://localhost:8080
NEXT_PUBLIC_PROJECT_1_DESCRIPTION=Spring Boot Backend
NEXT_PUBLIC_PROJECT_1_ENABLED=true

# Project 2
NEXT_PUBLIC_PROJECT_2_NAME=Project 2
NEXT_PUBLIC_PROJECT_2_API_URL=http://localhost:8081
NEXT_PUBLIC_PROJECT_2_DESCRIPTION=Second Project
NEXT_PUBLIC_PROJECT_2_ENABLED=true

# Project 3
NEXT_PUBLIC_PROJECT_3_NAME=Project 3
NEXT_PUBLIC_PROJECT_3_API_URL=http://localhost:8082
NEXT_PUBLIC_PROJECT_3_DESCRIPTION=Third Project
NEXT_PUBLIC_PROJECT_3_ENABLED=true

# Project 4
NEXT_PUBLIC_PROJECT_4_NAME=Project 4
NEXT_PUBLIC_PROJECT_4_API_URL=http://localhost:8083
NEXT_PUBLIC_PROJECT_4_DESCRIPTION=Fourth Project
NEXT_PUBLIC_PROJECT_4_ENABLED=true

# Project 5
NEXT_PUBLIC_PROJECT_5_NAME=Project 5
NEXT_PUBLIC_PROJECT_5_API_URL=http://localhost:8084
NEXT_PUBLIC_PROJECT_5_DESCRIPTION=Fifth Project
NEXT_PUBLIC_PROJECT_5_ENABLED=true
```

## Vercel Deployment

Vercel Dashboard → Project Settings → Environment Variables bölümünden yukarıdaki değişkenleri ekleyin.

### Production Örneği

```env
NEXT_PUBLIC_PROJECT_1_NAME=Production Backend
NEXT_PUBLIC_PROJECT_1_API_URL=https://api1.production.com
NEXT_PUBLIC_PROJECT_1_DESCRIPTION=Production Environment
NEXT_PUBLIC_PROJECT_1_ENABLED=true

NEXT_PUBLIC_PROJECT_2_NAME=Staging Backend
NEXT_PUBLIC_PROJECT_2_API_URL=https://api2.staging.com
NEXT_PUBLIC_PROJECT_2_DESCRIPTION=Staging Environment
NEXT_PUBLIC_PROJECT_2_ENABLED=true

NEXT_PUBLIC_PROJECT_3_NAME=Development Backend
NEXT_PUBLIC_PROJECT_3_API_URL=https://api3.dev.com
NEXT_PUBLIC_PROJECT_3_DESCRIPTION=Development Environment
NEXT_PUBLIC_PROJECT_3_ENABLED=true

NEXT_PUBLIC_PROJECT_4_NAME=QA Backend
NEXT_PUBLIC_PROJECT_4_API_URL=https://api4.qa.com
NEXT_PUBLIC_PROJECT_4_DESCRIPTION=QA Environment
NEXT_PUBLIC_PROJECT_4_ENABLED=true

NEXT_PUBLIC_PROJECT_5_NAME=Test Backend
NEXT_PUBLIC_PROJECT_5_API_URL=https://api5.test.com
NEXT_PUBLIC_PROJECT_5_DESCRIPTION=Test Environment
NEXT_PUBLIC_PROJECT_5_ENABLED=true
```

## Proje Yönetimi

### Proje Seçme

1. Sidebar'daki proje seçiciyi kullanın
2. Dropdown'dan istediğiniz projeyi seçin
3. Seçili proje localStorage'da saklanır

### Proje Devre Dışı Bırakma

Bir projeyi geçici olarak devre dışı bırakmak için:

```env
NEXT_PUBLIC_PROJECT_3_ENABLED=false
```

Devre dışı bırakılan projeler sidebar'da görünmez ve seçilemez.

## Proje Özellikleri

Her proje için:

- **Renk Kodu**: Otomatik olarak atanır (mavi, yeşil, turuncu, kırmızı, mor)
- **Bağımsız API**: Her proje kendi API URL'ine bağlanır
- **Bağımsız Metrikler**: Her proje için ayrı metrikler toplanır
- **Persistent Selection**: Seçili proje localStorage'da saklanır

## Kullanım Senaryoları

### Senaryo 1: Environment Bazlı İzleme

- Production
- Staging
- Development
- QA
- Test

### Senaryo 2: Servis Bazlı İzleme

- Backend API
- Frontend API
- Microservice 1
- Microservice 2
- Worker Service

### Senaryo 3: Müşteri Bazlı İzleme

- Müşteri A
- Müşteri B
- Müşteri C
- Müşteri D
- Müşteri E

## API Gereksinimleri

Her proje için backend API'lerin aşağıdaki endpoint'leri sağlaması gerekir:

- `/api/v1/monitoring/health`
- `/api/v1/monitoring/system-metrics`
- `/api/v1/monitoring/api-metrics`
- `/api/v1/monitoring/business-metrics`
- `/api/v1/monitoring/logs`
- `/api/v1/monitoring/alerts`
- ... (tam liste için `docs/API_ENDPOINTS.md`)

## CORS Yapılandırması

Her backend API'nin CORS ayarlarında Vercel domain'inizi eklemeniz gerekir:

```java
// Spring Boot örneği
@CrossOrigin(origins = {
    "https://your-app.vercel.app",
    "https://your-custom-domain.com"
})
```

## Troubleshooting

### Proje Görünmüyor

1. Environment variable'ların doğru formatta olduğundan emin olun
2. `NEXT_PUBLIC_` prefix'inin olduğundan emin olun
3. `ENABLED` değerinin `true` olduğundan emin olun
4. Vercel'de environment variable değişikliklerinden sonra redeploy yapın

### API Bağlantı Hatası

1. API URL'inin doğru olduğundan emin olun
2. CORS ayarlarını kontrol edin
3. API'nin çalıştığından emin olun
4. Browser console'da hataları kontrol edin

### Proje Değişmiyor

1. Browser localStorage'ı temizleyin
2. Sayfayı yenileyin
3. Proje seçiciyi tekrar kullanın

## Best Practices

1. **İsimlendirme**: Proje isimlerini açıklayıcı yapın
2. **Açıklamalar**: Her proje için açıklama ekleyin
3. **URL'ler**: Production URL'lerini kullanın
4. **Güvenlik**: Hassas bilgileri environment variable olarak saklayın
5. **Dokümantasyon**: Her proje için API dokümantasyonu tutun




