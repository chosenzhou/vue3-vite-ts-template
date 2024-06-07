/**
 * @description 获取当前平台
 */

const platform = PLATFORM;
const isH5 = platform === 'h5';
const isApp = platform === 'app';
const isMp = platform.startsWith('mp-');

export {
  platform,
  isH5,
  isApp,
  isMp,
};
