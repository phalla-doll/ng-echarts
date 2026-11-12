import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  forbidOnly: Boolean(process.env['CI']),
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run serve:ssr',
    url: 'http://localhost:4173',
    env: { PORT: '4173' },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
