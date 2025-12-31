# Backend CORS ve Endpoint Sorunları - Çözüm Promptu

## 🔴 Tespit Edilen Sorunlar

1. **CORS Hatası:** `/actuator/metrics/{requiredMetricName}` - CORS policy blocked, preflight başarısız
2. **Health Endpoint Hatası:** `/actuator/health` - Mail health check başarısız (AuthenticationFailedException)
3. **Invalid URL Character:** URL'de geçersiz karakter - `{requiredMetricName}` placeholder değiştirilmemiş
4. **Kısmen Çalışan CORS:** Bazı endpoint'ler başarılı (200), bazıları başarısız (404, CORS)

**Frontend Origin:** `https://aiport-monitoring.vercel.app`  
**Backend:** `https://test.flyai.tr:8080`

## ✅ Gerekli Çözümler

### 1. Global CORS Configuration

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://aiport-monitoring.vercel.app", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 2. Actuator CORS (application.yml)

```yaml
management:
  endpoints:
    web:
      cors:
        allowed-origins:
          - https://aiport-monitoring.vercel.app
          - http://localhost:3000
        allowed-methods: GET,POST,OPTIONS
        allowed-headers: "*"
        allow-credentials: true
        max-age: 3600
```

### 3. Spring Security CORS (Eğer Security kullanılıyorsa)

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers("/actuator/**").authenticated()
            .anyRequest().authenticated());
    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("https://aiport-monitoring.vercel.app", "http://localhost:3000"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

### 4. Health Endpoint - Mail Health Check Sorunu

**Sorun:** `MailHealthIndicator` mail sunucusuna bağlanamıyor:
```
jakarta.mail.AuthenticationFailedException: 454 4.7.0 We do not AUTH flyai.tr
```

**Çözüm 1: Mail Health Check'i Devre Dışı Bırak (Önerilen)**

```yaml
management:
  health:
    mail:
      enabled: false
```

**Çözüm 2: Mail Yapılandırmasını Düzelt**

```yaml
spring:
  mail:
    host: smtp.example.com
    port: 587
    username: your-email@example.com
    password: your-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

### 5. Health Endpoint CORS
`/actuator/health` public (permitAll) olmalı ve CORS header'ları döndürmeli.

## ⚠️ Önemli Notlar
- Wildcard (*) + credentials çalışmaz, spesifik origin gerekli
- OPTIONS method zorunlu (preflight için)
- Hem global hem actuator CORS yapılandırılmalı
- Spring Security kullanılıyorsa SecurityConfig'de de CORS olmalı
- Mail health check `/actuator/health`'i DOWN yapabilir - devre dışı bırakılmalı
- URL'lerde geçersiz karakterler (boşluk, placeholder) olmamalı

## 📋 Kontrol Listesi
- [ ] Global CORS eklendi | [ ] Actuator CORS eklendi | [ ] Security CORS eklendi
- [ ] `/actuator/health` public + CORS headers | [ ] OPTIONS izinli
- [ ] Mail health check devre dışı veya düzeltildi | [ ] Backend restart

## 🔍 Test
Network Tab: OPTIONS → 200/204 + CORS headers | GET → 200 + `Access-Control-Allow-Origin`
