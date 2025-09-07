/**
 * API関連の共通モックデータ
 *
 * フロントエンドとバックエンドで共通して使用するAPI関連のモックデータを定義します。
 */

import type {
  ProjectListResponse,
  AddProjectResponse,
  ValidationResult,
  ApiResponse,
} from '../types/api';
import { MSW_MOCK_PROJECTS, MSW_NEW_PROJECT } from './projectMocks';

/**
 * プロジェクト一覧用モックデータ
 */
export const PROJECT_LIST_MOCK_DATA: ApiResponse<ProjectListResponse> = {
  success: true,
  data: {
    projects: MSW_MOCK_PROJECTS,
    currentProject: MSW_MOCK_PROJECTS[0],
  },
};

/**
 * プロジェクト追加用モックデータ
 */
export const ADD_PROJECT_MOCK_DATA: ApiResponse<AddProjectResponse> = {
  success: true,
  data: {
    project: MSW_NEW_PROJECT,
    message: 'プロジェクトが正常に追加されました',
  },
};

/**
 * プロジェクト削除用モックデータ
 */
export const REMOVE_PROJECT_MOCK_DATA: ApiResponse<{ message: string }> = {
  success: true,
  data: {
    message: 'プロジェクトが正常に削除されました',
  },
};

/**
 * パス検証用モックデータ
 */
export const VALIDATE_PATH_MOCK_DATA: ApiResponse<ValidationResult> = {
  success: true,
  data: {
    isValid: true,
    validatedPath: '/Users/demo/projects/valid-project',
  },
};

/**
 * プロジェクト選択用モックデータ
 */
export const SELECT_PROJECT_MOCK_DATA: ApiResponse<{
  project: (typeof MSW_MOCK_PROJECTS)[0];
  message: string;
}> = {
  success: true,
  data: {
    project: MSW_MOCK_PROJECTS[0],
    message: 'プロジェクトが選択されました',
  },
};

/**
 * パス検証結果のモック
 */
export const MOCK_VALIDATION_RESULTS = {
  /** 有効なパスの検証結果 */
  VALID: {
    isValid: true,
    validatedPath: '/test/path',
  },
  /** 無効なパスの検証結果 */
  INVALID: {
    isValid: false,
    error: '指定されたディレクトリが存在しません',
  },
} as const;

/**
 * 後方互換性用のプロジェクトモックデータ
 */
export const LEGACY_PROJECT_MOCK_DATA = {
  success: {
    name: 'kiro-lens-demo',
    hasKiroDir: true,
    kiroPath: '/Users/demo/projects/kiro-lens-demo/.kiro',
  },
};
