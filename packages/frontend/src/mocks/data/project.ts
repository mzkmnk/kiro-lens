/**
 * プロジェクトAPI用モックデータ
 *
 * 共通モックデータを使用してMSWハンドラー用のデータを提供します。
 */

import {
  PROJECT_LIST_MOCK_DATA,
  ADD_PROJECT_MOCK_DATA,
  REMOVE_PROJECT_MOCK_DATA,
  VALIDATE_PATH_MOCK_DATA,
  SELECT_PROJECT_MOCK_DATA,
  LEGACY_PROJECT_MOCK_DATA,
} from '@kiro-lens/shared';

// 共通モックデータを再エクスポート
export const projectListMockData = PROJECT_LIST_MOCK_DATA;
export const addProjectMockData = ADD_PROJECT_MOCK_DATA;
export const removeProjectMockData = REMOVE_PROJECT_MOCK_DATA;
export const validatePathMockData = VALIDATE_PATH_MOCK_DATA;
export const selectProjectMockData = SELECT_PROJECT_MOCK_DATA;
export const projectMockData = LEGACY_PROJECT_MOCK_DATA;
