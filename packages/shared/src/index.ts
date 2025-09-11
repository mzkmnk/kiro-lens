// ===== TypeBoxスキーマベース型定義（推奨） =====

// 自動生成された型定義（TypeBoxスキーマから生成）
export * from './types/generated';

// TypeBoxスキーマ（バックエンド用）
export * from './schemas';

// ===== レガシー型定義（互換性維持） =====

// ヘルスチェック関連型定義
export type {
  HealthStatus,
  ServerState,
  HealthResponse,
  ServerInfo,
  ServerStatus,
} from './types/health';

// 設定管理関連型定義
export type { AppConfig, AppSettings, ConfigMetadata } from './types/config';

// ファイルシステム関連型定義
export type { FileSystemErrorType } from './types/filesystem';
export { FileSystemError } from './types/filesystem';

// ルートパラメータ関連型定義
export type { IdParams } from './types/route-params';

// 共通モックデータのエクスポート
export * from './mocks';

/**
 * ダミー定数
 * tscがJSファイルを生成することを保証するために追加
 */
export const DUMMY_CONST = 'dummy';

// ===== 移行ガイド =====

/**
 * 型定義の移行ガイド
 *
 * 新しいコードでは以下のTypeBoxベース型を使用してください：
 *
 * 旧型定義 → 新型定義（TypeBoxベース）
 * - types/api.ApiResponse → generated.ApiResponse
 * - types/api.ApiError → generated.ApiError
 * - types/project.ProjectInfo → generated.ProjectInfo
 * - types/file-tree.FileItem → generated.FileItem
 * - types/api.ValidationResult → generated.ValidationResult
 *
 * 型ガード関数も新しいものを使用してください：
 * - isApiSuccess → generated.isApiSuccess
 * - isValidationSuccess → generated.isValidationSuccess
 */
