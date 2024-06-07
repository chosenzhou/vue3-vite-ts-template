/** @type {import('eslint').Linter.Config} */

import antfu from '@antfu/eslint-config';
import process from 'node:process';

/**
 * @see https://github.com/antfu/eslint-config
 */

export default antfu({
  formatters: true,
  vue: true,
  jsx: true,
  unocss: true,
  rules: {
    'style/indent': ['error', 2, { SwitchCase: 2 }],
    'style/quotes': ['error', 'single'],
    'style/semi': ['error', 'always'],
    'style/semi-style': ['error', 'last'],
    'style/max-len': ['error', { code: 160, tabWidth: 2 }],
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'vue/script-indent': ['error', 2, { baseIndent: 0 }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  env: {
    node: true,
  },
  ignores: [
    './dist/*',
    './.vscode/*',
    './.idea/*',
    './README.md',
  ],
});
