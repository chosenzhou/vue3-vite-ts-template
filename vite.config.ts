import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPrefix = env.VITE_API_BASE_URL || '/api';
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

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
      port: Number(env.VITE_PORT || 5173),
      proxy: {
        [apiPrefix]: {
          target: apiTarget,
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^${apiPrefix}`), ''),
        },
      },
    },
  };
});
