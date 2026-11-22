import { defineConfig } from '@playwright/test';

const capture = process.env.VISUAL_CAPTURE === '1';
if (capture && !process.env.VISUAL_BASELINE_DIST) {
  throw new Error(
    'Capture requires a separately built oracle. Use bash e2e/visual/docker.sh capture.'
  );
}

export default defineConfig({
  testDir: './e2e/visual',
  testMatch: 'screens.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  updateSnapshots: capture ? 'all' : 'none',
  // Both capture and comparison run in the pinned Docker image, never per host OS.
  snapshotPathTemplate: '{testDir}/snapshots/{projectName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0,
      maxDiffPixels: 0,
    },
    toMatchAriaSnapshot: { children: 'deep-equal' },
  },
  outputDir: '../tmp/playwright-visual/test-results',
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: '../tmp/playwright-visual/report', open: 'never' },
    ],
  ],
  use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:30000',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    // The capture wrapper builds the old source into this fixed container path.
    command: capture
      ? 'npm run preview -- --strictPort --outDir /tmp/visual-oracle/dashboard/dist'
      : 'npm run preview -- --strictPort',
    url: 'http://127.0.0.1:30000',
    reuseExistingServer: false,
  },
});
