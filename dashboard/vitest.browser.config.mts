import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const browser = () => ({
  enabled: true,
  headless: true,
  provider: playwright(),
  instances: [{ browser: 'chromium' as const }],
});

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.{test,spec,stories}.{ts,tsx}',
        'src/mocks/**',
        'src/testSetup.ts',
        'src/**/*TestUtils.{ts,tsx}',
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage/ui',
    },
    projects: [
      {
        plugins: [
          storybookTest({
            configDir: fileURLToPath(new URL('./.storybook', import.meta.url)),
          }),
        ],
        test: { name: 'storybook', browser: browser() },
      },
      {
        plugins: [react()],
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: browser(),
        },
      },
    ],
  },
});
