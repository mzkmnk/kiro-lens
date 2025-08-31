# Kiro Lens

Figma MCPから取得したUIデザインを基に構築されたローカル開発ツール

## 概要

Kiro Lensは、プロジェクトのrootディレクトリで`npx kiro-lens`を実行することで、ローカルブラウザ（localhost:3000）でアクセス可能なファイル管理・編集ダッシュボードを提供します。

## 主要機能

- **ファイル管理**: プロジェクト内のファイル構造を視覚的に表示・管理
- **リアルタイム編集**: ブラウザ上でファイルを直接編集し、ローカルファイルシステムに即座に反映
- **ライブ監視**: ローカルでのファイル変更を自動検知してブラウザに通知
- **Markdownサポート**: .mdファイルの適切なレンダリングとフロントマター解析
- **日本語対応**: Noto Sans JPフォントを使用した日本語コンテンツの最適表示

## 技術スタック

- **フロントエンド**: React 18.3.1 + TypeScript 5.7.2 + Vite 6.0.1 + Tailwind CSS 3.4.15
- **バックエンド**: Fastify 5.1.0 + TypeScript 5.7.2 + Socket.io 4.8.1
- **開発ツール**: tsx 4.20.4 + Concurrently 9.1.0 + Commander.js 12.1.0

## 使用方法

### 起動

```bash
npx kiro-lens
```

### 開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm test
```

### コード品質管理

このプロジェクトではESLintとPrettierを使用してコード品質を管理しています。

```bash
# リンティング実行
npm run lint

# リンティングエラーの自動修正
npm run lint:fix

# コードフォーマット実行
npm run format

# フォーマットチェック（CI用）
npm run format:check

# リンティング + フォーマットチェック
npm run quality

# リンティング + フォーマット修正
npm run quality:fix
```

#### 設定ファイル

- **ESLint**: `eslint.config.js` - Flat Config形式でパッケージ別ルール設定
- **Prettier**: `.prettierrc.js` - 統一されたフォーマットルール
- **除外設定**: `.prettierignore` - フォーマット対象外ファイル

#### エディタ統合

VS Codeを使用している場合、以下の拡張機能を推奨します：

- ESLint (`ms-vscode.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

保存時の自動フォーマットを有効にするには、`.vscode/settings.json`を参照してください。

## プロジェクト構造

```
kiro-lens/
├── package.json                    # ワークスペース設定
├── bin/kiro-lens.ts               # CLI エントリーポイント
├── packages/
│   ├── frontend/                  # Vite + React アプリ
│   ├── backend/                   # Fastify API サーバー
│   └── shared/                    # 共通型定義
└── README.md
```

## ライセンス

MIT
