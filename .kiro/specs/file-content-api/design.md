# 設計ドキュメント

## 概要

ファイルコンテンツ取得APIは、プロジェクト内のテキストファイルの内容を安全に取得するためのRESTful APIです。既存のkiro-lensアーキテクチャに統合し、Fastifyバックエンドで実装します。

## アーキテクチャ

### APIエンドポイント

```
POST /api/projects/:id/files/content
```

- `:id` - プロジェクトID（既存のパラメータ形式に準拠）
- リクエストボディ: `{ "filePath": "相対パス" }` - 取得したいファイルの相対パス（.kiro配下からの相対パス）

### レスポンス形式

```typescript
// 成功レスポンス
{
  success: true,
  data: {
    content: string,
    // 将来の拡張用フィールド（現在は未使用）
    // metadata?: {
    //   size: number,
    //   lastModified: string,
    //   encoding: string
    // }
  }
}

// エラーレスポンス
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

## コンポーネントと インターフェース

### 1. バックエンドサービス層

#### FileContentService

```typescript
class FileContentService {
  // ファイル内容を取得
  async getFileContent(projectId: string, filePath: string): Promise<string>;

  // ファイルの存在確認
  private async fileExists(fullPath: string): Promise<boolean>;

  // ファイル読み取り権限の確認
  private async checkReadPermission(fullPath: string): Promise<boolean>;
}
```

### 2. ルート層

#### files.ts（既存ファイルに追加）

```typescript
// 新しいエンドポイントを追加
fastify.post(
  '/api/projects/:id/files/content',
  {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          filePath: { type: 'string' },
        },
        required: ['filePath'],
      },
    },
  },
  async (request, reply) => {
    // FileContentServiceを使用してファイル内容を取得
  }
);
```

### 3. フロントエンドAPI層

#### api/fileContent.ts（新規作成）

```typescript
// ファイル内容取得関数
export async function getFileContent(projectId: string, filePath: string): Promise<string>;

// エラーハンドリング付きのラッパー関数
export async function safeGetFileContent(
  projectId: string,
  filePath: string
): Promise<{ success: boolean; content?: string; error?: string }>;
```

## データモデル

### 共通型定義（shared/src/types/）

#### fileContent.ts（新規作成）

```typescript
// ファイル内容レスポンス型
export interface FileContentResponse {
  content: string;
  // 将来の拡張用
  metadata?: FileMetadata;
}

// ファイルメタデータ型（将来使用）
export interface FileMetadata {
  size: number;
  lastModified: string;
  encoding: string;
}

// ファイル内容エラー型
export interface FileContentError {
  code:
    | 'FILE_NOT_FOUND'
    | 'PROJECT_NOT_FOUND'
    | 'PERMISSION_DENIED'
    | 'INVALID_PATH'
    | 'READ_ERROR';
  message: string;
  filePath?: string;
  projectId?: string;
}
```

## エラーハンドリング

### エラーコードとHTTPステータスの対応

| エラーコード      | HTTPステータス | 説明                                     |
| ----------------- | -------------- | ---------------------------------------- |
| FILE_NOT_FOUND    | 404            | 指定されたファイルが存在しない           |
| PROJECT_NOT_FOUND | 404            | 指定されたプロジェクトが存在しない       |
| PERMISSION_DENIED | 403            | ファイル読み取り権限がない               |
| INVALID_PATH      | 400            | 不正なファイルパス（パストラバーサル等） |
| READ_ERROR        | 500            | ファイル読み取り時のシステムエラー       |

### セキュリティ対策

1. **パストラバーサル防止**
   - 既存の `isPathSafe()` 関数を使用（fileTreeService.ts）
   - プロジェクトの.kiro配下以外へのアクセス防止

2. **ファイルタイプ検証**
   - テキストファイルのみを対象
   - バイナリファイルの自動検出と拒否

3. **権限チェック**
   - ファイル読み取り権限の確認
   - 既存のプロジェクトアクセス権限確認の再利用

## テスト戦略

### 1. ユニットテスト

- FileContentServiceの各メソッド
- パストラバーサル攻撃の防止
- エラーハンドリングの検証

### 2. 統合テスト

- APIエンドポイントの動作確認
- 正常系・異常系のシナリオテスト
- レスポンス形式の検証

### 3. セキュリティテスト

- パストラバーサル攻撃のテスト
- 権限外ファイルへのアクセステスト
- 不正なパラメータでのテスト

## 既存システムとの統合

### 1. プロジェクト管理システム

- 既存のProjectServiceとの連携
- プロジェクト存在確認の再利用

### 2. ファイルシステムサービス

- 既存のFileSystemServiceとの統合
- `resolvePath()` - パス検証の再利用
- 既存のFileTreeServiceの `isPathSafe()` - パストラバーサル防止の再利用

### 3. エラーハンドリング

- 既存のApiResponseパターンの踏襲
- 統一されたエラーレスポンス形式の使用

## パフォーマンス考慮事項

### 1. ファイルサイズ対応

- 現在は制限なし（要件に基づく）
- 将来的にはストリーミング読み取りの検討

### 2. キャッシュ戦略

- 初期実装ではキャッシュなし
- 将来的にはファイル変更検知とキャッシュの実装を検討

### 3. 同時アクセス

- Node.jsの非同期I/Oを活用
- ファイルロックは現在考慮しない
