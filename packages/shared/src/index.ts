// 共通型定義のエクスポート

// ポート関連型定義
export type {
  PortConfiguration,
  CLIOptions,
  PortValidationResult,
  FoundationErrorType,
  FoundationError,
  PortConfigurationValidationResult,
} from './types/port';
export { PORT_RANGE } from './types/port';

// ポート関連ユーティリティ
export {
  validatePortConfiguration,
  createPortConfiguration,
  isValidPortNumber,
} from './utils/portUtils';

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

// 既存の型定義（後方互換性のため保持）
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
}
