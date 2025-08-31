/**
 * ESLint Flat Config設定
 *
 * kiro-lensプロジェクト用のESLint設定ファイル
 * モノレポ構成でパッケージ別に最適化されたルールを適用
 *
 * 設定方針:
 * - 最小限のルールで開発体験を重視
 * - TypeScript型チェックを活用してJSルールを簡素化
 * - パッケージ別（frontend/backend/shared）の特化ルール
 * - Prettierとの競合を回避
 */

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  // 基本的なJavaScript推奨ルール
  js.configs.recommended,

  // 全TypeScriptファイル共通設定
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      // TypeScript固有ルール（最小限）
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // 開発中は許可
      '@typescript-eslint/no-var-requires': 'off',

      // インポート管理
      'import/order': 'off', // 一時的に無効化
      'import/no-unresolved': 'off', // TypeScriptが解決するため
      'import/no-duplicates': 'off', // 一時的に無効化
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './packages/*/tsconfig.json'],
        },
      },
    },
  },

  // Frontend（React）専用設定
  {
    files: ['packages/frontend/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './packages/frontend/tsconfig.json',
      },
      globals: {
        React: 'readonly',
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
    },
    rules: {
      // React固有ルール
      'react/react-in-jsx-scope': 'off', // React 17+では不要
      'react/prop-types': 'off', // TypeScriptで型チェック
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSXアクセシビリティ（最小限）
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Backend（Node.js）専用設定
  {
    files: ['packages/backend/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './packages/backend/tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      // Backend固有ルール（Node.jsプラグインは互換性問題のため除外）
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'off', // TypeScriptが型チェックするため
    },
  },

  // Shared（共通型定義）専用設定
  {
    files: ['packages/shared/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './packages/shared/tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      // 共通型定義固有ルール
      '@typescript-eslint/no-empty-interface': 'off', // 拡張用の空インターフェース許可
      '@typescript-eslint/ban-types': 'off', // 汎用型定義のため
      'import/no-default-export': 'off', // 開発中は許可
    },
  },

  // 除外設定
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.d.ts',
      'coverage/**',
      '.next/**',
      '.nuxt/**',
      '.output/**',
      '.vite/**',
      '**/dist/**',
      '**/build/**',
      'bin/**',
      '**/*.config.ts',
      '**/*.config.js',
      'vitest.config.ts',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      // 動作確認用ファイルを除外
      'packages/frontend/src/components/**',
      'packages/frontend/src/hooks/**',
      'packages/backend/src/plugins/**',
      'packages/backend/src/routes/**',
      'packages/backend/src/services/**',
    ],
  },

  // Prettierとの競合回避
  prettierConfig,
];
