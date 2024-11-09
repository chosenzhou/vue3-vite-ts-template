import process from 'node:process';

const currentPlatform = process.env.UNI_PLATFORM;
const isH5 = currentPlatform === 'h5';
const isApp = currentPlatform === 'app';
const WeappTailwindcssDisabled = isH5 || isApp;
const isMp = !isH5 && !isApp;

export {
  currentPlatform,
  isApp,
  isH5,
  isMp,
  WeappTailwindcssDisabled,
};
