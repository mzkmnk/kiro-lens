// TypeBoxスキーマベースAPI関連のサービスをエクスポート
export * from './typedApiClient';
export * from './projectApiService';

// 型定義のエクスポート（TypeBoxベース）
export type {
  ProjectInfo,
  ApiResponse,
  ValidationResult,
  FileTreeResponse,
  FileItem,
  ApiError,
} from '@kiro-lens/shared/types/generated';
