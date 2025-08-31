# プロジェクト構造

## ディレクトリ構成

```
kiro-lens/
├── package.json                    # ワークスペース設定
├── bin/
│   └── kiro-lens.ts               # CLI エントリーポイント
├── packages/
│   ├── frontend/                  # Vite + React アプリ
│   │   ├── src/
│   │   │   ├── components/        # UIコンポーネント
│   │   │   │   ├── Dashboard.tsx  # メインレイアウト
│   │   │   │   ├── Sidebar.tsx    # ファイルツリー
│   │   │   │   ├── MainContent.tsx # ファイル表示・編集
│   │   │   │   └── TaskList.tsx   # タスクリスト
│   │   │   ├── hooks/             # カスタムフック
│   │   │   │   ├── useFiles.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── useFileEditor.ts
│   │   │   ├── services/          # API通信
│   │   │   │   └── api.ts
│   │   │   ├── types/             # フロントエンド型定義
│   │   │   │   └── index.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   ├── backend/                   # Fastify API サーバー
│   │   ├── src/
│   │   │   ├── routes/            # APIルート
│   │   │   │   ├── files.ts       # ファイル操作API
│   │   │   │   └── websocket.ts   # WebSocket処理
│   │   │   ├── services/          # ビジネスロジック
│   │   │   │   ├── fileService.ts
│   │   │   │   ├── fileWatcher.ts
│   │   │   │   └── markdownService.ts
│   │   │   ├── types/             # バックエンド型定義
│   │   │   │   └── index.ts
│   │   │   ├── plugins/           # Fastifyプラグイン
│   │   │   │   ├── cors.ts
│   │   │   │   └── websocket.ts
│   │   │   ├── app.ts             # アプリケーション設定
│   │   │   └── server.ts          # サーバー起動
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                    # 共通型定義
│       ├── src/
│       │   └── types/
│       │       ├── file.ts        # ファイル関連型
│       │       ├── websocket.ts   # WebSocket型
│       │       └── api.ts         # API型
│       ├── package.json
│       └── tsconfig.json
├── tsconfig.json                  # ルート TypeScript 設定
└── README.md
```

## 設計原則

### コンポーネント設計

- **単一責任**: 各コンポーネントは明確な責任を持つ
- **再利用性**: 共通UIコンポーネントは汎用的に設計
- **型安全性**: すべてのpropsとstateに適切な型定義

### API設計

- **RESTful**: 標準的なHTTPメソッドとステータスコード使用
- **WebSocket**: リアルタイム通信にはSocket.io使用
- **エラーハンドリング**: 統一されたエラーレスポンス形式

### ファイル命名規則

- **コンポーネント**: PascalCase (例: `Dashboard.tsx`)
- **フック**: camelCase with `use` prefix (例: `useFiles.ts`)
- **サービス**: camelCase with service suffix (例: `fileService.ts`)
- **型定義**: 各パッケージの`types/`ディレクトリに配置

### インポート規則

- **相対パス**: 同一パッケージ内は相対パス使用
- **絶対パス**: 他パッケージからは`@shared/types`等のエイリアス使用
- **型インポート**: `import type`を使用して型のみインポート

## 開発フロー

1. **共通型定義**: sharedパッケージで型を定義
2. **バックエンド実装**: API仕様に基づいてサーバー側実装
3. **フロントエンド実装**: UIコンポーネントとAPI連携実装
4. **テスト**: ユニット・統合・E2Eテストの順で実装
