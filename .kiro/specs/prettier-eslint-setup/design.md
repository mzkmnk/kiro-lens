# Design Document

## Overview

kiro-lensプロジェクトにPrettierとESLintを導入し、モノレポ構成における統一されたコード品質管理システムを構築します。ルートレベルで統一された設定ファイルを配置し、パッケージごとに最適化されたルールを適用する設計とします。

## Architecture

### 設定ファイル構成

```
kiro-lens/
├── eslint.config.js             # ESLint Flat Config統一設定（ルート）
├── .prettierrc.js               # Prettier統一設定（ルート）
├── .prettierignore              # Prettierの除外設定
├── .vscode/
│   └── settings.json            # VS Code統合設定
└── packages/
    ├── frontend/                # React専用ルール適用
    ├── backend/                 # Node.js専用ルール適用
    └── shared/                  # 共通TypeScriptルール適用
```

### 設定の階層構造

1. **Flat Config配列**: ESLint 9.x標準のFlat Config形式
2. **パッケージ別設定**: files指定による特化ルール適用
3. **エディタ統合**: VS Code設定による開発体験向上

## Components and Interfaces

### ESLint設定コンポーネント

#### 基本設定

- **TypeScript**: `@typescript-eslint/parser`と`@typescript-eslint/eslint-plugin`
- **共通ルール**: コード品質、セキュリティ、パフォーマンス関連
- **インポート管理**: `eslint-plugin-import`による依存関係チェック

#### パッケージ別特化設定

- **Frontend**: React専用ルール（`eslint-plugin-react`, `eslint-plugin-react-hooks`）
- **Backend**: Node.js専用ルール（`eslint-plugin-node`）
- **Shared**: 純粋TypeScript環境向けルール

### Prettier設定コンポーネント

#### フォーマット設定

- **インデント**: 2スペース（既存コードベースに合わせる）
- **行幅**: 100文字（可読性とモニタ幅のバランス）
- **セミコロン**: 必須（TypeScriptベストプラクティス）
- **クォート**: シングルクォート（JavaScript慣例）
- **末尾カンマ**: ES5準拠（互換性重視）

#### ファイル対象

- TypeScript/JavaScript: `.ts`, `.tsx`, `.js`, `.jsx`
- 設定ファイル: `.json`, `.md`, `.yml`, `.yaml`
- 除外対象: `node_modules`, `dist`, `build`

## Data Models

### 設定ファイル構造

```typescript
// ESLint Flat Config型定義
interface ESLintFlatConfig {
  files?: string[];
  ignores?: string[];
  languageOptions?: {
    parser?: any;
    parserOptions?: {
      ecmaVersion?: number;
      sourceType?: 'module' | 'script';
      project?: string | string[];
    };
    globals?: Record<string, boolean>;
  };
  plugins?: Record<string, any>;
  rules?: Record<string, any>;
  settings?: Record<string, any>;
}

// Flat Config配列
type ESLintConfig = ESLintFlatConfig[];

// Prettier設定型定義
interface PrettierConfig {
  semi: boolean;
  singleQuote: boolean;
  tabWidth: number;
  printWidth: number;
  trailingComma: 'es5' | 'none' | 'all';
  endOfLine: 'lf' | 'crlf' | 'cr' | 'auto';
}
```

### パッケージ依存関係

```typescript
interface PackageDependencies {
  devDependencies: {
    // ESLint関連（最新安定版）
    eslint: '^9.34.0';
    '@typescript-eslint/parser': '^8.41.0';
    '@typescript-eslint/eslint-plugin': '^8.41.0';
    'eslint-plugin-import': '^2.31.0';

    // React専用（frontend）
    'eslint-plugin-react'?: '^7.37.2';
    'eslint-plugin-react-hooks'?: '^5.0.0';
    'eslint-plugin-jsx-a11y'?: '^6.10.2';

    // Node.js専用（backend）
    'eslint-plugin-node'?: '^11.1.0';

    // Prettier関連（最新安定版）
    prettier: '^3.6.2';
    'eslint-config-prettier': '^9.1.0';
    'eslint-plugin-prettier': '^5.2.1';
  };
}
```

### バージョン選定理由

- **ESLint 9.34.0**: 最新安定版、Flat Config標準、パフォーマンス向上
- **TypeScript ESLint 8.41.0**: TypeScript 5.7.2との互換性、最新ルール対応
- **Prettier 3.6.2**: 最新安定版、TypeScript完全サポート、高速化
- **React関連プラグイン**: React 18.3.1との互換性確保
- **eslint-config-prettier 9.1.0**: ESLint 9.x対応、競合ルール無効化

## Error Handling

### リンティングエラー対応

1. **構文エラー**: ESLintによる即座の検出と報告
2. **型エラー**: TypeScript ESLintプラグインによる型安全性チェック
3. **フォーマットエラー**: Prettierとの競合回避設定

### 設定エラー対応

1. **設定ファイル構文エラー**: 起動時の検証とエラー報告
2. **依存関係不足**: package.jsonの依存関係チェック
3. **パス解決エラー**: TypeScriptプロジェクト設定の検証

### エディタ統合エラー対応

1. **VS Code拡張機能**: 推奨拡張機能の自動提案
2. **設定競合**: エディタ設定とプロジェクト設定の優先順位明確化
3. **パフォーマンス**: 大規模ファイルでのリンティング負荷軽減

## Testing Strategy

### 設定ファイルテスト

1. **ESLint設定検証**
   - 各パッケージでのルール適用確認
   - TypeScriptパース正常性確認
   - React/Node.js専用ルール動作確認

2. **Prettier設定検証**
   - フォーマット結果の一貫性確認
   - 各ファイル形式での動作確認
   - ESLintとの競合がないことの確認

### 統合テスト

1. **コマンドライン実行**
   - `pnpm run lint`での全パッケージチェック
   - `pnpm run format`での全パッケージフォーマット
   - `pnpm run lint:fix`での自動修正確認

2. **エディタ統合テスト**
   - VS Codeでの保存時自動フォーマット
   - リアルタイムエラー表示
   - 拡張機能連携動作

### CI/CD統合テスト

1. **プルリクエスト時チェック**
   - リンティングエラーでのビルド失敗
   - フォーマットチェックでの警告
   - 型安全性チェックの実行

## Implementation Considerations

### パフォーマンス最適化

1. **キャッシュ活用**: ESLintキャッシュによる高速化
2. **並列実行**: ワークスペース単位での並列リンティング
3. **増分チェック**: 変更ファイルのみの対象化

### 開発体験向上

1. **自動修正**: 可能な限りの自動修正ルール適用
2. **段階的導入**: 既存コードへの影響を最小化
3. **カスタマイズ性**: プロジェクト固有ルールの追加容易性

### 保守性確保

1. **設定の一元化**: ルートレベルでの統一管理
2. **ドキュメント化**: 設定理由と変更履歴の記録
3. **バージョン管理**: 依存関係の定期的な更新戦略
