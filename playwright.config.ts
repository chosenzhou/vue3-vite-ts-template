import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results/e2e',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [
      process.env.CI ? 'github' : 'list',
    ],
    [
      'json',
      { outputFile: 'test-results/e2e-results.json' },
    ],
  ],
  use: {
    // Keep screenshots independent of compositor-specific LCD text rendering on Linux.
    launchOptions: {
      args: ['--disable-lcd-text'],
    },
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
});
