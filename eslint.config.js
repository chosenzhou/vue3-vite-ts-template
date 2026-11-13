import antfu from '@antfu/eslint-config';
import moduleBoundaries from './scripts/eslint/module-boundaries.mjs';

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
    files: ['src/services/**/*.ts'],
    plugins: {
      template: {
        meta: { name: 'template-boundaries', version: '1.0.0' },
        rules: { 'module-boundaries': moduleBoundaries },
      },
    },
    rules: { 'template/module-boundaries': 'error' },
  },
  {
    files: ['tests/tooling/**/*.test.mjs'],
    // Tooling regressions use Node's built-in runner, without adding a test framework.
    rules: { 'test/no-import-node-test': 'off' },
  },
  {
    rules: {
      'style/quotes': ['error', 'single'],
      'style/semi': ['error', 'always'],
      'style/indent': ['error', 2],
    },
  },
);
