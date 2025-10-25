import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import rxjsPlugin from 'eslint-plugin-rxjs';

const recommendedTypeScriptRules = tseslint.configs.recommended?.rules ?? {};
const recommendedRxjsRules = rxjsPlugin.configs?.recommended?.rules ?? {};

export default [
  {
    ignores: ['**/*.js'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.app.json', 'tsconfig.spec.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      rxjs: rxjsPlugin,
    },
    rules: {
      ...recommendedTypeScriptRules,
      ...recommendedRxjsRules,
      'rxjs/no-ignored-observable': 'error',
      'rxjs/no-ignored-subscription': 'error',
      'rxjs/no-ignored-replay-buffer': 'warn',
      'rxjs/no-unsafe-takeuntil': 'warn',
      'rxjs/finnish': [
        'warn',
        {
          parameters: true,
          properties: false,
        },
      ],
    },
  },
];
