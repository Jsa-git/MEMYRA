import { defineConfig, devices } from '@playwright/test';

/** Read-only public smoke suite: never submits credentials or mutates data. */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'public-experience.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  },
  projects: [
    {
      name: 'public-mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    { name: 'public-desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm --filter @memyra/web dev --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/login',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
