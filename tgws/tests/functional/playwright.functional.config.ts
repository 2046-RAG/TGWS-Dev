/**
 * Functional test configuration — local production server.
 *
 * Usage:
 *   1. Build & start: `npx next build --webpack` then `npx next start -p 3000`
 *      (from the tgws app root).  DO NOT use `npm run dev` (AGENTS.md #32).
 *   2. Run:  npx playwright test --config=tests/functional/playwright.functional.config.ts
 *
 * Edge-only browser is enforced per AGENTS.md rule #27 — no Chrome/Chromium.
 * The existing root playwright.config.ts targets the live site (./e2e) and is
 * intentionally left untouched; this config is for local functional validation.
 */
import { defineConfig, devices } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './',
  testMatch: '*.spec.ts',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'functional-report' }]],
  use: {
    baseURL: BASE,
    headless: true,
    viewport: { width: 1366, height: 900 },
    // Edge-only, per AGENTS.md #27. No Chromium download required.
    launchOptions: {
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      channel: 'msedge',
    },
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'edge-desktop',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'edge-mobile',
      use: { ...devices['Pixel 7'], channel: 'msedge' },
    },
  ],
});