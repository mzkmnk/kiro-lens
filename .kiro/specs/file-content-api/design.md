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
    content: string
  }
}

// エラーレスポンス
{
  success: false,
  error: {
    type: string,
    message: string,
    timestamp: Date
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

#### app/api/files.api.ts（既存ファイルに追加）

```typescript
// Angular HttpClientを使用したファイル内容取得
getFileContent(projectId: string, filePath: string): Observable<ApiResponse<FileContentResponse>>;
```

## データモデル

### 共通型定義（shared/src/types/）

#### file-content.ts（新規作成）

```typescript
// ファイル内容取得リクエスト型
export interface FileContentRequest {
  filePath: string;
}

// ファイル内容レスポンス型
export interface FileContentResponse {
  content: string;
}

// ファイル内容エラー型
export interface FileContentErrorType {
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

// ファイル内容エラークラス
export class FileContentError extends Error {
  public readonly code: FileContentErrorType['code'];
  public readonly filePath?: string;
  public readonly projectId?: string;
}
```

## エラーハンドリング

### エラーコードとHTTPステータスの対応

| エラーコード      | HTTPステータス | APIエラータイプ   | 説明                                     |
| ----------------- | -------------- | ----------------- | ---------------------------------------- |
| FILE_NOT_FOUND    | 404            | NOT_FOUND         | 指定されたファイルが存在しない           |
| PROJECT_NOT_FOUND | 404            | NOT_FOUND         | 指定されたプロジェクトが存在しない       |
| PERMISSION_DENIED | 403            | PERMISSION_DENIED | ファイル読み取り権限がない               |
| INVALID_PATH      | 400            | VALIDATION_ERROR  | 不正なファイルパス（パストラバーサル等） |
| READ_ERROR        | 500            | INTERNAL_ERROR    | ファイル読み取り時のシステムエラー       |

### セキュリティ対策

1. **パストラバーサル防止**
   - 既存の `isPathSafe()` 関数を使用（fileTreeService.ts）
   - プロジェクトの.kiro配下以外へのアクセス防止

2. **ファイルタイプ検証**
   - `isTextFile()` ユーティリティ関数を使用
   - テキストファイルのみを対象
   - バイナリファイルの自動検出と拒否

3. **権限チェック**
   - `fs.access()` を使用したファイル読み取り権限の確認
   - 既存のプロジェクトアクセス権限確認の再利用

4. **ファイルサイズ制限**
   - 大容量ファイルの読み取り制限
   - メモリ使用量の制御

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

- 既存のProjectServiceの `getProjectById()` との連携
- プロジェクト存在確認の再利用

### 2. ファイルシステムサービス

- 既存のFileTreeServiceの `isPathSafe()` - パストラバーサル防止の再利用
- 新規作成の `isTextFile()` ユーティリティ関数でファイルタイプ検証

### 3. エラーハンドリング

- 既存のApiResponseパターンの踏襲
- 統一されたエラーレスポンス形式の使用
- FileContentErrorクラスによる構造化されたエラー管理

### 4. Angular統合

- HttpClientを使用したRESTful API通信
- Observableベースの非同期処理
- 既存のFilesAPIサービスへの統合

## パフォーマンス考慮事項

### 1. ファイルサイズ対応

- バッファベースの読み取りでメモリ効率を最適化
- テキストファイル判定後のUTF-8変換

### 2. エラーハンドリング最適化

- 早期リターンによる不要な処理の回避
- 構造化されたエラー情報の提供

### 3. 同時アクセス

- Node.jsの非同期I/Oを活用
- ファイルロックは現在考慮しない

### 4. ログ記録

- 詳細なリクエスト・レスポンスログ
- パフォーマンス測定（処理時間、ファイルサイズ）
- セキュリティ監査ログ
