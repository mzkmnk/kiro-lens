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
export type { ApiErrorType, ApiError, ApiResponse } from './types/api';

// プロジェクト関連型定義
export type { ProjectInfo, ProjectResponse } from './types/project';

// ファイルツリー関連型定義
export type { FileItem } from './types/file-tree';

/**
 * ダミー定数
 * tscがJSファイルを生成することを保証するために追加
 */
export const DUMMY_CONST = 'dummy';
