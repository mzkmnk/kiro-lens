/**
 * フロントエンド型定義のエクスポート
 */

// Angular固有型定義
export type {
  BaseComponentProps,
  ErrorState,
  FormState,
  ListOperations,
  LoadingState,
  SelectionState,
  SignalState,
} from "./angular";

// ng-icons型定義
export type {
  HeroIcon,
  IconButtonProps,
  IconName,
  IconProps,
  IconSet,
  IconSize,
  LucideIcon,
} from "./ng-icons";

// 共通型定義の再エクスポート（@kiro-lens/sharedから）
export type {
  AddProjectRequest,
  AddProjectResponse,
  ApiError,
  // API関連
  ApiErrorType,
  ApiResponse,
  ApiResult,
  // 設定管理関連
  AppConfig,
  AppSettings,
  ConfigMetadata,
  DirectoryPermissions,
  // ファイルツリー関連
  FileItem,

  // ファイルシステム関連
  FileSystemErrorType,
  FileTreeResponse,
  HealthResponse,
  // ヘルスチェック関連
  HealthStatus,
  // ルートパラメータ関連
  IdParams,
  // プロジェクト関連
  ProjectInfo,
  ProjectListResponse,
  ProjectResponse,
  ServerInfo,
  ServerState,
  ServerStatus,
  ValidationResult,
} from "@kiro-lens/shared";

// 型ガード関数の再エクスポート
export {
  FileSystemError,
  isApiSuccess,
  isValidationSuccess,
} from "@kiro-lens/shared";
