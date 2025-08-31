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
export {
  PORT_RANGE,
  validatePortConfiguration,
  createPortConfiguration,
  isValidPortNumber,
  isPrivilegedPort,
  generateRandomPort,
} from './types/port';

// ヘルスチェック関連型定義
export type {
  HealthStatus,
  ServerState,
  HealthResponse,
  ServerInfo,
  ServerStatus,
  ProjectInfo,
} from './types/health';

// API関連型定義
export type { ApiErrorType, ApiError, ApiResponse, ProjectResponse } from './types/api';

// 既存の型定義（後方互換性のため保持）
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
}
