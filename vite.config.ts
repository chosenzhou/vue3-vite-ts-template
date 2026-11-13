import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import { resolveApiBaseURL } from './src/config.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPrefix = resolveApiBaseURL(env.VITE_API_BASE_URL);
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
  const port = Number(env.VITE_PORT || 5173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('VITE_PORT 必须是 1 到 65535 之间的整数。');
  }
  const proxyURL = new URL(apiTarget);
  if (!['http:', 'https:'].includes(proxyURL.protocol) || proxyURL.username || proxyURL.password) {
    throw new Error('VITE_API_PROXY_TARGET 必须是不含凭证的 HTTP(S) 地址。');
  }

  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      quasar({
        autoImportComponentCase: 'pascal',
        sassVariables: join(import.meta.dirname, 'src/quasar-variables.scss'),
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port,
      proxy: apiPrefix.startsWith('/')
        ? {
          [apiPrefix]: {
            target: apiTarget,
            changeOrigin: true,
            rewrite: path => path.slice(apiPrefix.length),
          },
        }
        : undefined,
    },
  };
});
