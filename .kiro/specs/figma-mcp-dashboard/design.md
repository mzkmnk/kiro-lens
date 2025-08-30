# 設計ドキュメント

## 概要

Figma MCPダッシュボードは、Vite + React + TypeScript（フロントエンド）とFastify + TypeScript（バックエンド）を使用したモノレポ構成のローカル開発ツールです。WebSocketを使用したリアルタイム通信により、ファイルシステムの変更を即座にブラウザに反映し、開発者に優れたユーザー体験を提供します。

## アーキテクチャ

### システム構成図

```mermaid
graph TB
    CLI[CLI - kiro-lens] --> |起動| Frontend[Vite Dev Server :3000]
    CLI --> |起動| Backend[Fastify Server :3001]
    
    Frontend --> |HTTP/WebSocket| Backend
    Backend --> |ファイル監視| FS[File System]
    Backend --> |WebSocket通知| Frontend
    
    subgraph "Frontend (Vite + React)"
        UI[Dashboard UI]
        State[React Query State]
        WS[WebSocket Client]
    end
    
    subgraph "Backend (Fastify)"
        API[REST API]
        WSS[WebSocket Server]
        FileWatcher[Chokidar File Watcher]
    end
    
    subgraph "Shared"
        Types[TypeScript Types]
    end
```

### 技術スタック（最新安定版）

**フロントエンド**
- React: `18.3.1` (最新安定版)
- TypeScript: `5.7.2` (最新安定版)
- Vite: `6.0.1` (最新安定版)
- Tailwind CSS: `3.4.15` (最新安定版)
- React Query: `5.62.2` (TanStack Query)
- Socket.io Client: `4.8.1`

**バックエンド**
- Fastify: `5.1.0` (最新安定版)
- TypeScript: `5.7.2`
- Socket.io: `4.8.1`
- Chokidar: `4.0.1`
- Gray-matter: `4.0.3`

**開発ツール**
- tsx: `4.20.4` (TypeScript実行)
- Concurrently: `9.1.0` (並行実行)
- Commander.js: `12.1.0` (CLI)

## コンポーネントとインターフェース

### プロジェクト構造

```
kiro-lens/
├── package.json                    # ワークスペース設定
├── bin/
│   └── kiro-lens.ts               # CLI エントリーポイント
├── packages/
│   ├── frontend/                  # Vite + React アプリ
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MainContent.tsx
│   │   │   │   └── TaskList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFiles.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── useFileEditor.ts
│   │   │   ├── services/
│   │   │   │   └── api.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   ├── backend/                   # Fastify API サーバー
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── files.ts
│   │   │   │   └── websocket.ts
│   │   │   ├── services/
│   │   │   │   ├── fileService.ts
│   │   │   │   ├── fileWatcher.ts
│   │   │   │   └── markdownService.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── plugins/
│   │   │   │   ├── cors.ts
│   │   │   │   └── websocket.ts
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                    # 共通型定義
│       ├── src/
│       │   └── types/
│       │       ├── file.ts
│       │       ├── websocket.ts
│       │       └── api.ts
│       ├── package.json
│       └── tsconfig.json
├── tsconfig.json                  # ルート TypeScript 設定
└── README.md
```

### フロントエンド コンポーネント設計

#### Dashboard.tsx (メインコンポーネント)
```typescript
interface DashboardProps {
  projectName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ projectName }) => {
  // WebSocket接続管理
  // ファイル状態管理
  // レイアウト制御
}
```

#### Sidebar.tsx (ファイルツリー)
```typescript
interface SidebarProps {
  files: FileTreeNode[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFolderToggle: (path: string) => void;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  isExpanded?: boolean;
}
```

#### MainContent.tsx (ファイル表示・編集)
```typescript
interface MainContentProps {
  selectedFile: FileContent | null;
  isEditing: boolean;
  onEdit: (content: string) => void;
  onSave: () => void;
}

interface FileContent {
  path: string;
  content: string;
  type: 'markdown' | 'text' | 'json' | 'other';
  lastModified: Date;
}
```

### バックエンド API 設計

#### REST API エンドポイント

```typescript
// GET /api/files - ファイルツリー取得
interface GetFilesResponse {
  files: FileTreeNode[];
  projectName: string;
}

// GET /api/files/:path - ファイル内容取得
interface GetFileResponse {
  path: string;
  content: string;
  type: string;
  lastModified: string;
  size: number;
}

// PUT /api/files/:path - ファイル内容更新
interface UpdateFileRequest {
  content: string;
  lastModified?: string;
}

interface UpdateFileResponse {
  success: boolean;
  lastModified: string;
}
```

#### WebSocket イベント

```typescript
// クライアント → サーバー
interface ClientEvents {
  'file:watch': (path: string) => void;
  'file:unwatch': (path: string) => void;
  'file:edit:start': (path: string) => void;
  'file:edit:end': (path: string) => void;
}

// サーバー → クライアント
interface ServerEvents {
  'file:changed': (data: FileChangeEvent) => void;
  'file:created': (data: FileCreateEvent) => void;
  'file:deleted': (data: FileDeleteEvent) => void;
  'file:conflict': (data: FileConflictEvent) => void;
}

interface FileChangeEvent {
  path: string;
  content: string;
  lastModified: string;
  changeType: 'content' | 'rename' | 'move';
}
```

## データモデル

### ファイルシステム抽象化

```typescript
interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified: Date;
  isHidden: boolean;
  children?: FileSystemNode[];
}

interface FileMetadata {
  path: string;
  encoding: string;
  mimeType: string;
  isReadable: boolean;
  isWritable: boolean;
  stats: {
    size: number;
    created: Date;
    modified: Date;
    accessed: Date;
  };
}
```

### Markdown 処理

```typescript
interface MarkdownFile {
  frontMatter: Record<string, any>;
  content: string;
  rawContent: string;
  htmlContent: string;
  tableOfContents?: TOCItem[];
}

interface TOCItem {
  level: number;
  title: string;
  anchor: string;
  children?: TOCItem[];
}
```

## エラーハンドリング

### エラー分類と処理戦略

```typescript
enum ErrorType {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  WEBSOCKET_CONNECTION_FAILED = 'WEBSOCKET_CONNECTION_FAILED',
  FILE_CONFLICT = 'FILE_CONFLICT',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}
```

### エラー処理フロー

1. **ファイル操作エラー**: ファイルアクセス権限、存在確認、サイズ制限
2. **ネットワークエラー**: WebSocket再接続、API リトライ機構
3. **競合エラー**: ファイル編集競合の検出と解決オプション提示
4. **バリデーションエラー**: ファイル形式、内容の妥当性チェック

## テスト戦略

### フロントエンド テスト

```typescript
// コンポーネントテスト (Vitest + React Testing Library)
describe('Dashboard', () => {
  test('ファイル選択時にメインコンテンツが更新される', () => {
    // テスト実装
  });
});

// カスタムフックテスト
describe('useFiles', () => {
  test('ファイル一覧を正しく取得する', () => {
    // テスト実装
  });
});
```

### バックエンド テスト

```typescript
// API エンドポイントテスト (Vitest + Supertest)
describe('Files API', () => {
  test('GET /api/files - ファイル一覧を返す', async () => {
    // テスト実装
  });
});

// サービス層テスト
describe('FileService', () => {
  test('ファイル内容を正しく読み込む', () => {
    // テスト実装
  });
});
```

### E2E テスト

```typescript
// Playwright を使用したE2Eテスト
describe('ファイル編集フロー', () => {
  test('ファイル選択から編集、保存まで', async ({ page }) => {
    // テスト実装
  });
});
```

## パフォーマンス最適化

### フロントエンド最適化

1. **仮想化**: 大量ファイル表示時のReact Window使用
2. **メモ化**: React.memo、useMemo、useCallbackの適切な使用
3. **コード分割**: React.lazy による動的インポート
4. **状態最適化**: React Query によるサーバー状態管理

### バックエンド最適化

1. **ファイル監視最適化**: chokidar の ignoreInitial、ignored オプション
2. **メモリ管理**: 大きなファイルのストリーミング処理
3. **WebSocket最適化**: 接続プール、メッセージバッファリング
4. **キャッシュ戦略**: ファイルメタデータのメモリキャッシュ

## セキュリティ考慮事項

### ファイルアクセス制御

1. **パストラバーサル防止**: path.resolve() による正規化
2. **ファイルタイプ制限**: 実行可能ファイルへのアクセス制限
3. **サイズ制限**: 大きなファイルの読み込み制限
4. **権限チェック**: ファイル読み書き権限の事前確認

### ネットワークセキュリティ

1. **CORS設定**: 適切なオリジン制限
2. **入力検証**: ファイルパス、内容の妥当性チェック
3. **レート制限**: API呼び出し頻度の制限
4. **WebSocket認証**: 接続時の簡易認証機構