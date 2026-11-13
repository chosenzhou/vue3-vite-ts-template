import process from 'node:process';
import { defineConfig } from '@playwright/test';

const port = Number(process.env.E2E_PORT || 5180);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('E2E_PORT 必须是 1 到 65535 之间的整数。');
}
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `pnpm dev --port ${port} --strictPort`,
    url: baseURL,
    env: {
      VITE_API_BASE_URL: '',
      VITE_API_PROXY_TARGET: 'http://localhost:8080',
      VITE_PORT: String(port),
    },
    reuseExistingServer: !process.env.CI && process.env.E2E_REUSE_SERVER === '1',
  },
});
