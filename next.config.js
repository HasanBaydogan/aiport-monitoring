/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app.flyai.tr:8080',
  },
  // Vercel için optimize edilmiş ayarlar
  swcMinify: true,
  // Image optimization için external domains (gerekirse)
  images: {
    domains: [],
  },
}

module.exports = nextConfig

