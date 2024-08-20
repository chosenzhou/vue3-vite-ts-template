import type { PluginOption } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite';
import autoImport from 'unplugin-auto-import/vite';
import viteRestart from 'vite-plugin-restart';
import { visualizer } from 'rollup-plugin-visualizer';
import { WeappTailwindcssDisabled, isH5 } from './platform';

interface VitePluginConfig {
  isProd: boolean
}

export function createVitePlugins({ isProd }: VitePluginConfig): PluginOption[] {
  return [
    // @ts-expect-error TODO uni() 会报错：uni is not a function,暂时使用此方式解决
    uni?.default(),
    uvtw({
      rem2rpx: true,
      disabled: WeappTailwindcssDisabled,
      // 使用新的 ast-grep 来处理 js 资源，速度是 babel 的2倍左右
      // 需要先安装 `@ast-grep/napi`
      // jsAstTool: 'ast-grep'
    }),
    autoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      imports: [
        'vue',
        'uni-app',
        'pinia',
        {
          'uni-mini-router': ['useRouter', 'useRoute'],
        },
        {
          'alova/client': ['useRequest'],
        },
      ],
      dts: 'typings/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    viteRestart({
      restart: ['vite.config.ts', 'src/pages.json'],
    }),
    isH5 && isProd
    && visualizer({
      filename: './node_modules/.cache/visualizer/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ];
}
