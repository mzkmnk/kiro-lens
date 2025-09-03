# 技術スタック

## アーキテクチャ

モノレポ構成のTypeScriptプロジェクトで、フロントエンドとバックエンドを分離した構成です。

## フロントエンド

- **React**: 18.3.1 (最新安定版)
- **TypeScript**: 5.7.2 (最新安定版)
- **Vite**: 6.0.1 (最新安定版、開発サーバー・ビルドツール)
- **Tailwind CSS**: v4 (最新版、スタイリング)
- **shadcn/ui**: 最新版 (UIコンポーネントライブラリ)
- **React Query**: 5.62.2 (TanStack Query、サーバー状態管理)
- **Socket.io Client**: 4.8.1 (WebSocket通信)

## バックエンド

- **Fastify**: 5.1.0 (最新安定版、高性能HTTPサーバー)
- **TypeScript**: 5.7.2
- **Socket.io**: 4.8.1 (WebSocket通信)
- **Chokidar**: 4.0.1 (ファイル監視)
- **Gray-matter**: 4.0.3 (Markdownフロントマター解析)

## 開発ツール

- **tsx**: 4.20.4 (TypeScript実行)
- **Concurrently**: 9.1.0 (並行実行)
- **Commander.js**: 12.1.0 (CLI)
- **Vitest**: テスト実行
- **React Testing Library**: コンポーネントテスト
- **Playwright**: E2Eテスト

## 共通コマンド

### 開発環境起動

```bash
npx kiro-lens
```

### 開発用サーバー起動（個別）

```bash
# フロントエンド開発サーバー
pnpm run dev:frontend

# バックエンド開発サーバー
pnpm run dev:backend
```

### ビルド

```bash
# 全体ビルド
pnpm run build

# フロントエンドのみ
pnpm run build:frontend

# バックエンドのみ
pnpm run build:backend
```

### テスト

```bash
# 全テスト実行
pnpm test

# ユニットテスト
pnpm run test:unit

# E2Eテスト
pnpm run test:e2e
```

## UIコンポーネント

### Tailwind CSS v4

- **設定**: 最新のTailwind CSS v4を使用
- **カスタマイズ**: 日本語フォント（Noto Sans JP）対応
- **レスポンシブ**: モバイルファーストデザイン

### shadcn/ui

- **コンポーネント**: 再利用可能なUIコンポーネントライブラリ
- **カスタマイズ**: プロジェクトに合わせたテーマ設定
- **アクセシビリティ**: WAI-ARIA準拠のコンポーネント

### デザインシステム

- **一貫性**: 統一されたデザイン言語
- **保守性**: コンポーネントベースの設計
- **拡張性**: 新機能追加時の柔軟性

## パッケージ管理

- **ワークスペース**: pnpm workspaces使用
- **パッケージ構成**: frontend、backend、shared の3パッケージ
- **型共有**: sharedパッケージで共通型定義を管理
