# 設計ドキュメント

## 概要

kiro-lensフロントエンドのApiClientリファクタリングでは、kyライブラリ（v1.10.0）を活用して汎用HTTP通信を処理し、ビジネスロジックを関数ベースのAPIモジュールに分離します。関心の分離により、保守性・拡張性・テスタビリティを向上させる設計を実現します。

## アーキテクチャ

### 新しいディレクトリ構造

```
packages/frontend/src/services/
├── http/
│   └── client.ts              # ky設定とインスタンス作成
├── api/
│   ├── project-api.ts         # プロジェクト管理API関数
│   ├── project-api.test.ts    # プロジェクトAPIテスト
│   ├── file-tree-api.ts       # ファイルツリーAPI関数
│   └── file-tree-api.test.ts  # ファイルツリーAPIテスト
└── index.ts                   # 統一エクスポート
```

### レイヤー構成

```
┌─────────────────────────────────────────┐
│           Components Layer              │
│  (ProjectSidebar, PathInput, Store)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Business API Layer              │
│  (Project API, FileTree API Functions)  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           HTTP Client Layer             │
│              (ky v1.10.0)               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Backend APIs                 │
│     (/api/projects, /api/health)        │
└─────────────────────────────────────────┘
```

## コンポーネント設計

### HTTP Client Layer

#### client.ts

```typescript
// packages/frontend/src/services/http/client.ts
import ky from 'ky';

/**
 * 共通HTTP設定
 */
const HTTP_CONFIG = {
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get'],
  },
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * 共通kyインスタンス
 *
 * 全てのAPIサービスで使用する設定済みのkyインスタンスです。
 * ベースURL、タイムアウト、リトライ設定を含みます。
 */
export const httpClient = ky.create(HTTP_CONFIG);

/**
 * API共通エラーハンドラー
 *
 * kyのHTTPErrorを適切なエラーメッセージに変換します。
 */
export const handleApiError = async (error: unknown): Promise<never> => {
  if (error instanceof ky.HTTPError) {
    const response = error.response;

    try {
      const errorData = await response.json();
      if (errorData.error?.message) {
        throw new Error(errorData.error.message);
      }
    } catch {
      // JSON解析に失敗した場合はHTTPステータスベースのメッセージ
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  throw error;
};
```

### Business API Layer

#### Project API Functions

```typescript
// packages/frontend/src/services/api/project-api.ts
import { httpClient, handleApiError } from '../http/client';
import type {
  AddProjectRequest,
  AddProjectResponse,
  ProjectListResponse,
  ValidationResult,
  ProjectInfo,
  ApiResponse,
} from '@kiro-lens/shared';

/**
 * プロジェクト一覧を取得
 */
export async function getProjects(): Promise<ProjectListResponse> {
  try {
    const response = await httpClient.get('api/projects').json<ApiResponse<ProjectListResponse>>();

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'プロジェクト一覧の取得に失敗しました');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクトを追加
 */
export async function addProject(path: string): Promise<AddProjectResponse> {
  try {
    const requestData: AddProjectRequest = { path };
    const response = await httpClient
      .post('api/projects', { json: requestData })
      .json<ApiResponse<AddProjectResponse>>();

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'プロジェクトの追加に失敗しました');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクトを削除
 */
export async function removeProject(id: string): Promise<{ message: string }> {
  try {
    const response = await httpClient
      .delete(`api/projects/${encodeURIComponent(id)}`)
      .json<ApiResponse<{ message: string }>>();

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'プロジェクトの削除に失敗しました');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * パスを検証
 */
export async function validatePath(path: string): Promise<ValidationResult> {
  try {
    const response = await httpClient
      .post('api/projects/validate-path', { json: { path } })
      .json<ApiResponse<ValidationResult>>();

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'パスの検証に失敗しました');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * プロジェクトを選択
 */
export async function selectProject(
  id: string
): Promise<{ project: ProjectInfo; message: string }> {
  try {
    const response = await httpClient
      .post(`api/projects/${encodeURIComponent(id)}/select`)
      .json<ApiResponse<{ project: ProjectInfo; message: string }>>();

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'プロジェクトの選択に失敗しました');
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### FileTree API Functions

```typescript
// packages/frontend/src/services/api/file-tree-api.ts
import { httpClient, handleApiError } from '../http/client';
import type { FileTreeResponse, ApiResponse } from '@kiro-lens/shared';

/**
 * プロジェクトのファイルツリーを取得
 *
 * @param projectId - ファイルツリーを取得するプロジェクトのID
 * @returns プロジェクトの.kiro配下のファイル構造
 * @throws {Error} プロジェクトが存在しない場合
 * @throws {Error} .kiroディレクトリが存在しない場合
 * @throws {Error} ファイル読み取り権限がない場合
 */
export async function getProjectFiles(projectId: string): Promise<FileTreeResponse> {
  // プロジェクトIDのバリデーション
  if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
    throw new Error('プロジェクトIDが無効です');
  }

  try {
    const encodedId = encodeURIComponent(projectId.trim());
    const response = await httpClient
      .get(`api/projects/${encodedId}/files`)
      .json<ApiResponse<FileTreeResponse>>();

    if (response.success && response.data) {
      return response.data;
    }

    // ファイルツリー固有のエラーメッセージ
    if (response.error?.type === 'NOT_FOUND') {
      throw new Error(`ファイルツリーの取得に失敗しました: ${response.error.message}`);
    } else if (response.error?.type === 'PERMISSION_DENIED') {
      throw new Error(`ファイルアクセス権限がありません: ${response.error.message}`);
    }

    throw new Error(response.error?.message || 'ファイルツリーの取得に失敗しました');
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 統一エクスポート

#### index.ts

```typescript
// packages/frontend/src/services/index.ts
import * as projectApi from './api/project-api';
import * as fileTreeApi from './api/file-tree-api';

// API関数をエクスポート
export { projectApi, fileTreeApi };
```

## データフロー

### 新しいアーキテクチャでのデータフロー

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  projectStore   │    │ Project API     │    │   ky instance   │
│                 │────▶│ Functions       │────▶│                 │
│ loadProjects()  │    │ getProjects()   │    │ GET /api/       │
│                 │◄────│                 │◄────│ projects        │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PathInput     │    │ Project API     │    │   ky instance   │
│                 │────▶│ Functions       │────▶│                 │
│ validatePath()  │    │ validatePath()  │    │ POST /api/      │
│                 │◄────│                 │◄────│ projects/       │
└─────────────────┘    └─────────────────┘    │ validate-path   │
                                               └─────────────────┘
```

## エラーハンドリング戦略

### 階層別エラー処理

1. **ky Layer**: HTTP通信エラー（ネットワーク、タイムアウト）
2. **API Function Layer**: ビジネスロジックエラー（バリデーション、権限）
3. **Component Layer**: UI表示エラー（ユーザー向けメッセージ）

### エラー変換フロー

```
ky.HTTPError
    ↓
handleApiError()
    ↓
Business Error Message
    ↓
Component Error State
    ↓
User-Friendly Message
```

## 移行戦略

### Phase 1: 基盤構築

1. kyライブラリの導入
2. httpClientの設定
3. 基本的なエラーハンドリング実装（複雑なロジックのみ）

### Phase 2: API関数実装

1. Project API関数の実装とテスト
2. FileTree API関数の実装とテスト
3. 統一エクスポートの設定

### Phase 3: 完全移行

1. 既存ApiClientの削除
2. projectStoreでの新API関数使用
3. PathInputでの新API関数使用
4. 既存テストの更新

## テスト戦略

### 各層のテスト方針

#### HTTP Client Layer

- 複雑なロジックがある場合のみテスト実装
- 基本的なky設定やライブラリの振る舞いはテスト不要

#### API Function Layer

- ビジネスロジックのテスト
- エラーケースのテスト
- kyインスタンスをモック

#### Integration Test

- 実際のAPIエンドポイントとの統合
- MSWを使用したE2Eテスト

## パフォーマンス考慮事項

### kyライブラリの利点

- 軽量（gzip圧縮で13KB）
- TypeScript完全対応
- 標準的なfetch APIベース
- 自動リトライ機能
- タイムアウト制御

### 最適化ポイント

- 共通インスタンスの再利用
- 適切なリトライ設定
- エラーレスポンスのキャッシュ回避

## セキュリティ

### 入力検証

- プロジェクトIDのURLエンコード
- パス文字列のサニタイズ
- 型安全性による実行時エラー防止

### エラー情報の制御

- 機密情報の漏洩防止
- ユーザー向けメッセージの統一
- デバッグ情報の適切な制御
