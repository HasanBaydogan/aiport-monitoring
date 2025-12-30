# Airport Monitoring Frontend

Hafif ve modern bir multi-project monitoring dashboard'u. 5 farklı projeyi aynı anda monitörize edebilen, Spring Boot backend'lerinizin log, API sağlığı ve sistem metriklerini izlemek için tasarlanmıştır.

## Özellikler

- 📊 Real-time dashboard'lar (Ana, İş, Teknik)
- 📈 **Spring Boot Actuator** entegrasyonu
- 🔐 **JWT Authentication** desteği
- 🔍 Log viewer ve analiz
- 🚨 Alert yönetimi
- 📧 Email ve external servis izleme
- 🔄 RFQ → Quote → PI iş akışı izleme
- 🎯 **Multi-Project Support**: 5 farklı projeyi aynı anda izleyin
- 🔄 **Project Switcher**: Kolay proje değiştirme
- 💾 **Persistent Selection**: Seçili proje localStorage'da saklanır
- 📊 **Actuator Metrics Viewer**: Tüm Actuator metriklerini görüntüleme

## Kurulum

```bash
npm install
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Yapılandırma

### Local Development

`.env.local` dosyası oluşturun ve projelerinizi yapılandırın:

```env
# Default API URL (fallback)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Project 1 Configuration
NEXT_PUBLIC_PROJECT_1_NAME=SMT V1 Backend
NEXT_PUBLIC_PROJECT_1_API_URL=http://localhost:8080
NEXT_PUBLIC_PROJECT_1_DESCRIPTION=Spring Boot Backend
NEXT_PUBLIC_PROJECT_1_ENABLED=true

# Project 2 Configuration
NEXT_PUBLIC_PROJECT_2_NAME=Project 2
NEXT_PUBLIC_PROJECT_2_API_URL=http://localhost:8081
NEXT_PUBLIC_PROJECT_2_DESCRIPTION=Second Project
NEXT_PUBLIC_PROJECT_2_ENABLED=true

# Project 3-5 için benzer şekilde devam edin...
```

### Vercel Deployment

1. **Vercel'e Projeyi Bağlayın**
   ```bash
   # Vercel CLI ile
   npm i -g vercel
   vercel
   ```

   Veya GitHub'a push yapıp Vercel dashboard'dan import edin.

2. **Environment Variables Ayarlayın**

   Vercel Dashboard → Project Settings → Environment Variables bölümünden aşağıdaki değişkenleri ekleyin:

   ```
   NEXT_PUBLIC_PROJECT_1_NAME=Production Backend
   NEXT_PUBLIC_PROJECT_1_API_URL=https://api1.example.com
   NEXT_PUBLIC_PROJECT_1_DESCRIPTION=Production Environment
   NEXT_PUBLIC_PROJECT_1_ENABLED=true

   NEXT_PUBLIC_PROJECT_2_NAME=Staging Backend
   NEXT_PUBLIC_PROJECT_2_API_URL=https://api2.example.com
   NEXT_PUBLIC_PROJECT_2_DESCRIPTION=Staging Environment
   NEXT_PUBLIC_PROJECT_2_ENABLED=true

   # ... diğer projeler için devam edin
   ```

3. **Deploy**

   Vercel otomatik olarak deploy edecektir. Her commit'te otomatik deploy aktif olacaktır.

### Proje Yapılandırması

Her proje için şu environment variable'ları kullanabilirsiniz:

- `NEXT_PUBLIC_PROJECT_{N}_NAME`: Proje adı (zorunlu)
- `NEXT_PUBLIC_PROJECT_{N}_API_URL`: API URL'i (zorunlu)
- `NEXT_PUBLIC_PROJECT_{N}_DESCRIPTION`: Proje açıklaması (opsiyonel)
- `NEXT_PUBLIC_PROJECT_{N}_ENABLED`: Projeyi aktif/pasif yap (default: true)

`{N}` 1-5 arası bir sayıdır.

## Kullanım

1. Sidebar'daki proje seçiciyi kullanarak aktif projeyi değiştirin
2. Tüm dashboard'lar seçili projeye göre otomatik güncellenir
3. Seçili proje localStorage'da saklanır, sayfa yenilendiğinde korunur

## Teknolojiler

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Axios
- Vercel (Deployment)

## Backend API Gereksinimleri

### Spring Boot Actuator Endpoints

Proje Spring Boot Actuator endpoint'lerini kullanır:

- `GET /actuator/health` - Health check (public)
- `GET /actuator/metrics` - Metrics listesi (JWT required)
- `GET /actuator/metrics/{metric.name}` - Specific metric (JWT required)
- `GET /actuator/prometheus` - Prometheus format (JWT required)
- `GET /actuator/info` - Application info (JWT required)

### Authentication

- `POST /api/v1/auth/login` - Login endpoint
- `POST /api/v1/auth/refresh-token` - Token refresh

### CORS

Backend'de CORS yapılandırması gerekli:
- Allowed Origins: Frontend domain'leri
- Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Allowed Headers: `*`
- Credentials: `true`

Detaylı bilgi için `docs/API_ENDPOINTS.md` dosyasına bakın.

