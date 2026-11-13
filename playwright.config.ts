import { defineConfig, devices } from '@playwright/test';
const port = process.env['PLAYWRIGHT_PORT'] ?? '4173';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests/browser',
  forbidOnly: Boolean(process.env['CI']),
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run serve:ssr',
    url: baseURL,
    env: { PORT: port },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
