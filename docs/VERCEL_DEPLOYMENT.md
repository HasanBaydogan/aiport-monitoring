# Vercel Deployment Rehberi

Bu dokümantasyon, Airport Monitoring Frontend projesini Vercel'e deploy etmek için adım adım talimatlar içerir.

## Ön Gereksinimler

1. Vercel hesabı ([vercel.com](https://vercel.com))
2. GitHub, GitLab veya Bitbucket hesabı (opsiyonel, otomatik deploy için)
3. Backend API URL'leri

## Deployment Yöntemleri

### Yöntem 1: Vercel CLI ile Deploy

1. **Vercel CLI'yi yükleyin**
   ```bash
   npm i -g vercel
   ```

2. **Projeyi deploy edin**
   ```bash
   cd aiport-monitoring-frontend
   vercel
   ```

3. **İlk deploy'da soruları yanıtlayın:**
   - Set up and deploy? **Yes**
   - Which scope? (Hesabınızı seçin)
   - Link to existing project? **No** (ilk deploy)
   - Project name? (Enter'a basın veya özel isim verin)
   - Directory? (Enter'a basın, zaten doğru dizindesiniz)
   - Override settings? **No**

4. **Production deploy için:**
   ```bash
   vercel --prod
   ```

### Yöntem 2: GitHub ile Otomatik Deploy

1. **GitHub'a push edin**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/aiport-monitoring-frontend.git
   git push -u origin main
   ```

2. **Vercel Dashboard'a gidin**
   - [vercel.com/new](https://vercel.com/new)
   - "Import Git Repository" seçin
   - GitHub hesabınızı bağlayın
   - Repository'yi seçin

3. **Project Settings'i yapılandırın**
   - Framework Preset: **Next.js** (otomatik algılanır)
   - Root Directory: **./** (boş bırakın)
   - Build Command: `npm run build` (otomatik)
   - Output Directory: `.next` (otomatik)

4. **Environment Variables ekleyin**
   - Settings → Environment Variables
   - Aşağıdaki değişkenleri ekleyin (her proje için)

## Environment Variables Yapılandırması

Vercel Dashboard → Project Settings → Environment Variables bölümünden aşağıdaki değişkenleri ekleyin:

### Production Environment

```
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

NEXT_PUBLIC_PROJECT_4_NAME=Project 4
NEXT_PUBLIC_PROJECT_4_API_URL=https://api4.example.com
NEXT_PUBLIC_PROJECT_4_DESCRIPTION=Fourth Project
NEXT_PUBLIC_PROJECT_4_ENABLED=true

NEXT_PUBLIC_PROJECT_5_NAME=Project 5
NEXT_PUBLIC_PROJECT_5_API_URL=https://api5.example.com
NEXT_PUBLIC_PROJECT_5_DESCRIPTION=Fifth Project
NEXT_PUBLIC_PROJECT_5_ENABLED=true
```

### Preview/Development Environment

Aynı değişkenleri Preview ve Development environment'ları için de ekleyebilirsiniz (farklı URL'lerle).

## Environment Variable Formatı

Her proje için şu format kullanılır:

```
NEXT_PUBLIC_PROJECT_{N}_NAME=Proje Adı
NEXT_PUBLIC_PROJECT_{N}_API_URL=https://api.example.com
NEXT_PUBLIC_PROJECT_{N}_DESCRIPTION=Açıklama (opsiyonel)
NEXT_PUBLIC_PROJECT_{N}_ENABLED=true (opsiyonel, default: true)
```

`{N}` 1-5 arası bir sayıdır.

## CORS Yapılandırması

Backend API'lerinizin CORS ayarlarını yapılandırdığınızdan emin olun:

```java
// Spring Boot örneği
@CrossOrigin(origins = {
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com"
})
```

## Custom Domain (Opsiyonel)

1. Vercel Dashboard → Project Settings → Domains
2. Domain'inizi ekleyin
3. DNS kayıtlarını yapılandırın (Vercel talimatları takip edin)

## Build ve Deploy Ayarları

Vercel otomatik olarak Next.js projelerini algılar ve şu ayarları kullanır:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

Bu ayarlar `vercel.json` dosyasında da tanımlanmıştır.

## Troubleshooting

### Build Hataları

1. **Environment variable'ları kontrol edin**
   - Tüm gerekli değişkenlerin eklendiğinden emin olun
   - `NEXT_PUBLIC_` prefix'inin olduğundan emin olun

2. **Node.js versiyonu**
   - Vercel otomatik olarak uygun versiyonu seçer
   - Gerekirse `package.json`'da `engines` belirtin:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

### API Bağlantı Hataları

1. **CORS kontrolü**
   - Backend API'lerinizin CORS ayarlarını kontrol edin
   - Vercel domain'inizi allow list'e ekleyin

2. **HTTPS kontrolü**
   - Production'da HTTPS kullanın
   - HTTP API URL'leri tarayıcılar tarafından bloklanabilir

### Proje Görünmüyor

1. **Environment variable kontrolü**
   - `NEXT_PUBLIC_PROJECT_{N}_ENABLED=true` olduğundan emin olun
   - `NEXT_PUBLIC_PROJECT_{N}_NAME` ve `NEXT_PUBLIC_PROJECT_{N}_API_URL` dolu olmalı

2. **Redeploy**
   - Environment variable değişikliklerinden sonra redeploy gerekebilir
   - Vercel Dashboard → Deployments → Redeploy

## Otomatik Deploy

GitHub'a push yaptığınızda Vercel otomatik olarak deploy eder:

- `main` branch → Production
- Diğer branch'ler → Preview

## Monitoring ve Analytics

Vercel Dashboard'dan:
- Deploy geçmişini görüntüleyin
- Build log'larını inceleyin
- Analytics ve performance metriklerini takip edin

## Güvenlik

1. **Environment Variables**
   - Hassas bilgileri environment variable olarak saklayın
   - `NEXT_PUBLIC_` prefix'i olan değişkenler client-side'da görünür olur
   - API key'ler gibi hassas bilgiler için server-side API route'ları kullanın

2. **API URL'leri**
   - Production API URL'lerini kullanın
   - Development URL'lerini production'da kullanmayın

## Destek

Sorun yaşarsanız:
1. Vercel Dashboard'daki build log'larını kontrol edin
2. Browser console'da hataları kontrol edin
3. Vercel dokümantasyonuna bakın: [vercel.com/docs](https://vercel.com/docs)
