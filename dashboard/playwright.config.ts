import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testIgnore: '**/visual/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  reporter: 'list',
  outputDir: '../tmp/playwright/test-results',
  use: {
    baseURL: 'http://127.0.0.1:30000',
    timezoneId: 'Asia/Tokyo',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --strictPort',
    url: 'http://127.0.0.1:30000',
    reuseExistingServer: false,
  },
});
