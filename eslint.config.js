import antfu from '@antfu/eslint-config';

export default antfu(
  {
    formatters: true,
    vue: true,
    typescript: true,
    ignores: [
      'dist/**',
      'design/**',
      'artifacts/visual-qa/**',
      'node_modules/**',
      'typings/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['tests/tooling/*.test.mjs'],
    rules: {
      // Tooling checks run with Node's built-in test runner; Vitest is not a project dependency.
      'test/no-import-node-test': 'off',
    },
  },
  {
    rules: {
      'style/quotes': ['error', 'single'],
      'style/semi': ['error', 'always'],
      'style/indent': ['error', 2],
    },
  },
);
