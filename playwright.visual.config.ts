import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig(base, {
  testDir: 'tests/visual',
  timeout: 120000,
  retries: 0,
  workers: 1,
  outputDir: 'test-results/visual',
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: 'test-results/visual-results.json' },
    ],
  ],
});
