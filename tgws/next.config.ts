import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Vercel may load next.config.ts with cwd = repo root (even with
// rootDirectory=tgws), so './src/i18n/request.ts' can miss. Probe for the
// file relative to the current working directory and fall back to the
// tgws-prefixed location when running from the repo root.
const requestConfig = ['./src/i18n/request.ts', './tgws/src/i18n/request.ts']
  .find((p) => existsSync(path.resolve(process.cwd(), p)));
const withNextIntl = createNextIntlPlugin(requestConfig ?? './src/i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://db.onlinewebfonts.com; img-src 'self' data: blob: https://cdn.sanity.io https://*.supabase.co; font-src 'self' https://db.onlinewebfonts.com; connect-src 'self' https://*.supabase.co https://*.sanity.io wss://*.supabase.co; media-src 'self' https://cdn.coverr.co https://d8j0ntlcm91z4.cloudfront.net; frame-src 'self' https://www.openstreetmap.org https://www.google.com https://maps.google.com; frame-ancestors 'none'"
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
