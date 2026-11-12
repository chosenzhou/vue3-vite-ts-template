import antfu from '@antfu/eslint-config';

export default antfu(
  {
    formatters: true,
    vue: true,
    typescript: true,
    ignores: [
      'dist/**',
      'node_modules/**',
      'typings/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    rules: {
      'style/quotes': ['error', 'single'],
      'style/semi': ['error', 'always'],
      'style/indent': ['error', 2],
    },
  },
);
