import { resolve } from 'node:path';

import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';

// Keep local secrets centralized at the monorepo root. Provider-managed
// environment variables retain precedence in preview and production.
loadEnvConfig(resolve(import.meta.dirname, '../..'), process.env.NODE_ENV !== 'production');

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS?.split(',').filter(Boolean) ?? [],
  poweredByHeader: false,
  reactStrictMode: true,
  headers() {
    return Promise.resolve([
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]);
  },
};

export default nextConfig;
