import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Security: hide X-Powered-By header (PRD [S2.5])
  poweredByHeader: false,
  // React strict mode surfaces potential problems in development
  reactStrictMode: true,
  // Build date injected for legal pages "last updated" display (W4-4)
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  async redirects() {
    return [
      // TODO: 30天后删除此重定向（2026-07-12 + 30天 = 2026-08-11）
      {
        source: '/:locale/case-studies',
        destination: '/:locale/blog',
        permanent: true,
      },
      {
        source: '/:locale/case-studies/:slug',
        destination: '/:locale/blog',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // TODO: consider nonce-based CSP in future (see spec.md W4-7.2).
          // Currently uses 'unsafe-inline' for script-src/style-src because Next.js
          // injects inline runtime chunks. Nonce-based CSP requires middleware to
          // generate per-request nonce and replace 'unsafe-inline' with 'nonce-<value>'.
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://db.onlinewebfonts.com; img-src 'self' https: data: blob:; font-src 'self' https://db.onlinewebfonts.com; connect-src 'self' https://*.supabase.co https://*.sanity.io wss://*.supabase.co; media-src 'self' https://cdn.coverr.co https://d8j0ntlcm91z4.cloudfront.net; frame-ancestors 'none'"
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/logos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
