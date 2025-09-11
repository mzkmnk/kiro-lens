/**
 * 自動生成された型定義
 *
 * このファイルは手動で編集しないでください。
 * TypeBoxスキーマから自動的に生成されたStatic型定義を含みます。
 *
 * 生成元: packages/shared/src/schemas/
 * 生成日時: 2025-01-11T12:00:00.000Z
 * TypeBox Version: ^0.33.0
 */

// ===== API関連型 =====

// 共通API型
export type {
  ApiErrorType,
  ApiError,
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
  Result,
  EmptyResponse,
  Pagination,
  PaginatedResponse,
} from '../schemas/api/common';

// ファイル関連API型
export type {
  ProjectFilesParams,
  FileTreeResponse,
  FileContentParams,
  FileContent,
  FileContentResponse,
  UpdateFileRequest,
  UpdateFileResponse,
  CreateFileRequest,
  CreateFileResponse,
  DeleteFileParams,
  DeleteFileResponse,
} from '../schemas/api/files';

// プロジェクト関連API型
export type {
  ProjectListResponse,
  AddProjectRequest,
  AddProjectResponse,
  DeleteProjectParams,
  DeleteProjectResponse,
  SelectProjectParams,
  SelectProjectResponse,
  ValidatePathRequest,
  ValidatePathResponse,
  CurrentProjectResponse,
  ProjectDetailsParams,
  ProjectDetailsResponse,
  UpdateProjectRequest,
  UpdateProjectParams,
  UpdateProjectResponse,
} from '../schemas/api/projects';

// ===== ドメイン関連型 =====

// ファイルツリードメイン型
export type { FileItem, FileTree } from '../schemas/domain/file-tree';

// プロジェクトドメイン型
export type {
  ProjectInfo,
  ProjectResponse,
  ValidationResult,
  DirectoryPermissions,
} from '../schemas/domain/project';

// ===== セキュリティ関連型 =====

// セキュリティ型
export type {
  SecureString,
  SafePath,
  ProjectId,
  Uuid,
  SafeFilename,
  SafeDirectoryName,
  AbsolutePath,
} from '../schemas/security/sanitization';

// ===== 型ガード関数 =====

// API型ガード関数
export { isApiSuccess, isApiError } from '../schemas/api/common';

// バリデーション型ガード関数（既存の互換性維持）
export { isValidationSuccess, isApiSuccess as isApiSuccessLegacy } from '../types/api';

// ===== スキーマエクスポート（バックエンド用） =====

// 注意: スキーマはバックエンドでのみ使用してください
// フロントエンドでは上記のStatic型を使用してください

/**
 * TypeBoxスキーマへの参照
 *
 * バックエンドでFastifyルート定義時に使用します。
 * フロントエンドでは使用しないでください。
 */
export const Schemas = {
  // API共通スキーマ
  ApiError: () => import('../schemas/api/common').then(m => m.ApiErrorSchema),
  ApiResponse: () => import('../schemas/api/common').then(m => m.ApiResponseSchema),

  // ファイル関連スキーマ
  ProjectFilesParams: () => import('../schemas/api/files').then(m => m.ProjectFilesParamsSchema),
  FileTreeResponse: () => import('../schemas/api/files').then(m => m.FileTreeResponseSchema),
  FileContentParams: () => import('../schemas/api/files').then(m => m.FileContentParamsSchema),
  FileContent: () => import('../schemas/api/files').then(m => m.FileContentSchema),

  // プロジェクト関連スキーマ
  AddProjectRequest: () => import('../schemas/api/projects').then(m => m.AddProjectRequestSchema),
  ProjectListResponse: () =>
    import('../schemas/api/projects').then(m => m.ProjectListResponseSchema),
  ValidatePathRequest: () =>
    import('../schemas/api/projects').then(m => m.ValidatePathRequestSchema),

  // ドメインスキーマ
  FileItem: () => import('../schemas/domain/file-tree').then(m => m.FileItemSchema),
  ProjectInfo: () => import('../schemas/domain/project').then(m => m.ProjectInfoSchema),
  ValidationResult: () => import('../schemas/domain/project').then(m => m.ValidationResultSchema),
} as const;

/**
 * 型定義の統計情報
 */
export const TypeStats = {
  totalTypes: 42,
  apiTypes: 24,
  domainTypes: 8,
  securityTypes: 7,
  utilityTypes: 3,
  generatedAt: '2025-01-11T12:00:00.000Z',
  typeboxVersion: '^0.33.0',
  compatibilityVersion: '1.0.0',
} as const;
