# 技術スタック

## アーキテクチャ

モノレポ構成のTypeScriptプロジェクトで、フロントエンドとバックエンドを分離した構成です。

## フロントエンド

- **React**: 18.3.1 (最新安定版)
- **TypeScript**: 5.7.2 (最新安定版)
- **Vite**: 6.0.1 (最新安定版、開発サーバー・ビルドツール)
- **Tailwind CSS**: 3.4.15 (スタイリング)
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
npm run dev:frontend

# バックエンド開発サーバー
npm run dev:backend
```

### ビルド
```bash
# 全体ビルド
npm run build

# フロントエンドのみ
npm run build:frontend

# バックエンドのみ
npm run build:backend
```

### テスト
```bash
# 全テスト実行
npm test

# ユニットテスト
npm run test:unit

# E2Eテスト
npm run test:e2e
```

## パッケージ管理

- **ワークスペース**: npm workspaces使用
- **パッケージ構成**: frontend、backend、shared の3パッケージ
- **型共有**: sharedパッケージで共通型定義を管理