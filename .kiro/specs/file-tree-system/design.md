# 設計ドキュメント

## 概要

file-tree-systemは、既存のkiro-lensプロジェクト管理システムに統合される形で、選択されたプロジェクトの.kiro配下のファイル構造を表示・選択する機能を提供します。既存の型定義、APIクライアント、コンポーネント構造を最大限活用し、最小限の変更で機能を実現します。

## アーキテクチャ

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  File System    │
│                 │    │                 │    │                 │
│ ProjectSidebar  │◄──►│ GET /api/       │◄──►│ .kiro/          │
│ FileTreeView    │    │ projects/:id/   │    │ ├── specs/      │
│                 │    │ files           │    │ ├── steering/   │
│                 │    │                 │    │ └── settings/   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### データフロー

1. **プロジェクト選択時**：
   - ユーザーがプロジェクトを選択
   - ProjectSidebarがファイルツリーAPIを呼び出し
   - バックエンドが.kiroディレクトリを読み取り
   - FileItem[]形式でレスポンス
   - FileTreeViewコンポーネントで表示

2. **ファイル選択時**：
   - ユーザーがファイルをクリック
   - onFileSelectコールバックが実行
   - Dashboardの状態が更新
   - ヘッダーに選択ファイル名を表示

## コンポーネント設計

### バックエンド

#### 新規APIエンドポイント

```typescript
// GET /api/projects/:id/files
interface FileTreeResponse {
  success: boolean;
  data: FileItem[];
  message: string;
}
```

#### ファイルシステムサービス

```typescript
// packages/backend/src/services/fileTreeService.ts
export class FileTreeService {
  /**
   * プロジェクトの.kiroディレクトリのファイル構造を取得
   */
  async getProjectFiles(projectId: string): Promise<FileItem[]> {
    // 1. プロジェクト情報を取得
    // 2. .kiroディレクトリの存在確認
    // 3. ファイル構造を再帰的に読み取り
    // 4. FileItem[]形式に変換
  }

  /**
   * ディレクトリを再帰的に読み取り、FileItem形式に変換
   */
  private async readDirectory(dirPath: string, basePath: string): Promise<FileItem[]> {
    // fs.readdir + fs.stat を使用してファイル情報を取得
    // 再帰的にサブディレクトリを処理
  }
}
```

### フロントエンド

#### ApiClient拡張

```typescript
// packages/frontend/src/services/api.ts
export class ApiClient {
  // 既存メソッド...

  /**
   * プロジェクトのファイルツリーを取得
   */
  async getProjectFiles(projectId: string): Promise<FileItem[]> {
    return this.get<FileItem[]>(`/api/projects/${projectId}/files`);
  }
}
```

#### FileTreeViewコンポーネント

```typescript
// packages/frontend/src/components/FileTreeView.tsx
interface FileTreeViewProps {
  projectId: string;
  onFileSelect?: (file: FileItem) => void;
}

export const FileTreeView: React.FC<FileTreeViewProps> = ({ projectId, onFileSelect }) => {
  // 1. useEffect でファイルツリーを取得
  // 2. ローディング・エラー状態管理
  // 3. 再帰的なファイルツリー表示
  // 4. 展開・折りたたみ状態管理
  // 5. ファイル選択処理
};
```

#### FileTreeItemコンポーネント

```typescript
// packages/frontend/src/components/FileTreeItem.tsx
interface FileTreeItemProps {
  item: FileItem;
  level: number;
  selectedFileId?: string;
  onFileSelect?: (file: FileItem) => void;
  onFolderToggle?: (folderId: string, isExpanded: boolean) => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  item,
  level,
  selectedFileId,
  onFileSelect,
  onFolderToggle,
}) => {
  // 1. ファイル/フォルダアイコン表示
  // 2. インデント処理（level * 16px）
  // 3. 選択状態のハイライト
  // 4. フォルダの展開・折りたたみ
  // 5. クリックイベント処理
};
```

### 既存コンポーネントの修正

#### ProjectSidebar

```typescript
// packages/frontend/src/components/ProjectSidebar.tsx
export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  // 既存props...
}) => {
  // 既存の実装...

  // 選択されたプロジェクトの.kiroファイル表示部分を修正
  {isSelected && !isInvalid && (
    <SidebarMenuSub>
      <FileTreeView
        projectId={project.id}
        onFileSelect={onFileSelect}
      />
    </SidebarMenuSub>
  )}
};
```

## データモデル

### 既存型の活用

```typescript
// packages/shared/src/types/file-tree.ts (既存)
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
}
```

### 新規型定義

```typescript
// packages/shared/src/types/api.ts (追加)
/**
 * ファイルツリー取得レスポンス
 *
 * GET /api/projects/:id/files エンドポイントのレスポンス形式を定義します。
 */
export interface FileTreeResponse {
  files: FileItem[];
}
```

## エラーハンドリング

### バックエンドエラー

1. **プロジェクト未存在**：404 Not Found
2. **権限エラー**：403 Forbidden
3. **ファイルシステムエラー**：500 Internal Server Error

### フロントエンドエラー

1. **ネットワークエラー**：再試行ボタン表示
2. **APIエラー**：エラーメッセージ表示
3. **ローディング状態**：スケルトンUI表示

## テスト戦略

### バックエンドテスト

1. **APIエンドポイントテスト**：
   - 正常系：ファイルツリー取得成功
   - 異常系：プロジェクト未存在、権限エラー

2. **FileTreeServiceテスト**：
   - ディレクトリ読み取り機能
   - FileItem変換機能
   - エラーハンドリング

### フロントエンドテスト

1. **FileTreeViewテスト**：
   - ファイルツリー表示
   - ローディング・エラー状態
   - ファイル選択機能

2. **FileTreeItemテスト**：
   - ファイル/フォルダ表示
   - 展開・折りたたみ機能
   - 選択状態表示

3. **統合テスト**：
   - ProjectSidebarとの統合
   - Dashboardとの状態連携

## パフォーマンス考慮事項

### 最適化戦略

1. **遅延読み込み**：大きなディレクトリの場合は必要に応じて実装
2. **メモ化**：React.memoでコンポーネントの再レンダリングを最適化
3. **仮想化**：将来的に大量ファイル対応が必要な場合に検討

### 制限事項

1. **ファイル数制限**：初期実装では1000ファイル程度を想定
2. **深度制限**：10階層程度を想定
3. **ファイルサイズ**：ファイル内容は取得せず、構造のみ

## セキュリティ

### アクセス制御

1. **.kiro配下のみアクセス**：パストラバーサル攻撃対策
2. **プロジェクト権限チェック**：選択されたプロジェクトのみアクセス可能
3. **ファイル読み取り権限**：OSレベルの権限チェック

### 入力検証

1. **プロジェクトID検証**：UUID形式チェック
2. **パス検証**：不正なパス文字の除外
3. **ファイル名サニタイズ**：XSS対策
