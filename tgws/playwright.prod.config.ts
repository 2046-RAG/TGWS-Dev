import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://tgws.vercel.app',
    headless: true,
    launchOptions: {
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    },
  },
  projects: [
    {
      name: 'edge',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['list'], ['json', { outputFile: 'e2e/results.json' }]],
});
