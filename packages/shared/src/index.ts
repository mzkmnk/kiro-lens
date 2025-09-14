// 共通型定義のエクスポート

// ヘルスチェック関連型定義
export type {
  HealthStatus,
  ServerState,
  HealthResponse,
  ServerInfo,
  ServerStatus,
} from './types/health';

// API関連型定義
export type {
  ApiErrorType,
  ApiError,
  ApiResponse,
  AddProjectRequest,
  AddProjectResponse,
  ProjectListResponse,
  ValidationResult,
  FileTreeResponse,
  ApiResult,
} from './types/api';

// API型ガード関数
export { isValidationSuccess, isApiSuccess } from './types/api';

// プロジェクト関連型定義
export type { ProjectInfo, ProjectResponse } from './types/project';

// 設定管理関連型定義
export type { AppConfig, AppSettings, ConfigMetadata } from './types/config';

// ファイルツリー関連型定義
export type { FileItem } from './types/file-tree';

// ファイルシステム関連型定義
export type { FileSystemErrorType, DirectoryPermissions } from './types/filesystem';
export { FileSystemError } from './types/filesystem';

// ルートパラメータ関連型定義
export type { IdParams } from './types/route-params';

// ファイルコンテンツ関連型定義
export type {
  FileContentRequest,
  FileContentResponse,
  FileMetadata,
  FileContentError,
} from './types/file-content';

// 共通モックデータのエクスポート
export * from './mocks';

/**
 * ダミー定数
 * tscがJSファイルを生成することを保証するために追加
 */
export const DUMMY_CONST = 'dummy';
