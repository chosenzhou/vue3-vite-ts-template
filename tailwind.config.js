import { getIconCollections, iconsPlugin } from '@egoist/tailwindcss-icons';
import { isMp } from './build/platform';

const spacing = {
  0: '0px',
};

let i = 0;

while (i <= 750) {
  spacing[`${i}px`] = `${i}px`;
  spacing[`${i}rpx`] = `${i}rpx`;
  i++;
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      spacing,
    },
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
