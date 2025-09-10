// プロジェクト管理API関数のエクスポート
export { getProjects, addProject, removeProject, validatePath, selectProject } from './projectApi';

// ファイルツリーAPI関数のエクスポート
export { getProjectFiles } from './fileTreeApi';

// HTTPクライアントとエラーハンドラーのエクスポート
export { default as httpClient, handleApiError } from './httpClient';

// 型定義のエクスポート
export type {
  ProjectInfo,
  ApiResponse,
  ValidationResult,
  FileTreeResponse,
} from '@kiro-lens/shared';
