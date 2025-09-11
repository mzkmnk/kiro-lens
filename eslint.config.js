/**
 * ESLint設定 - ミニマム構成
 *
 * ベストプラクティスに沿った最小限のルール設定
 * - JavaScript/TypeScript推奨ルールのみ

 * - globalsパッケージによる環境別グローバル変数設定
 * - Prettierとの競合回避
 */

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

import globals from 'globals';

export default [
  // JavaScript推奨ルール
  js.configs.recommended,

  // TypeScript推奨ルール（共通環境）
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals['shared-node-browser'], // Node.js + ブラウザ共通のグローバル変数
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // 未使用変数の警告（アンダースコア始まりは除外）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Backend専用（Node.js環境）
  {
    files: ['packages/backend/**/*.ts', 'bin/**/*.ts', 'bin/**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js専用のグローバル変数
      },
    },
  },



  // 除外設定
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
      'coverage/**',
      '**/*.config.{js,ts}',
      '.eslintcache',
    ],
  },

  // Prettierとの競合回避
  prettierConfig,
];
