import { getIconCollections, iconsPlugin } from '@egoist/tailwindcss-icons';
import { isMp } from './build/platform';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {},
  },
  corePlugins: {
    // 小程序去使用 h5 的 preflight 和响应式 container 没有意义
    preflight: !isMp,
    container: !isMp,
  },
  plugins: [iconsPlugin({
    collections: getIconCollections(['mdi', 'svg-spinners']),
  })],
};
