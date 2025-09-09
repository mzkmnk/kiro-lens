import httpClient, { handleApiError } from './httpClient';
import type { ProjectInfo, ApiResponse, ValidationResult } from '@kiro-lens/shared/types';

/**
 * プロジェクト一覧を取得する
 */
export const getProjects = async (): Promise<ProjectInfo[]> => {
  try {
    const response = await httpClient.get('api/projects').json<ApiResponse<ProjectInfo[]>>();
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`プロジェクト一覧の取得に失敗しました: ${message}`);
  }
};

/**
 * プロジェクトを追加する
 */
export const addProject = async (path: string): Promise<ProjectInfo> => {
  if (!path || path.trim() === '') {
    throw new Error('パスが指定されていません');
  }

  try {
    const response = await httpClient
      .post('api/projects', {
        json: { path: path.trim() },
      })
      .json<ApiResponse<ProjectInfo>>();
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`プロジェクトの追加に失敗しました: ${message}`);
  }
};

/**
 * プロジェクトを削除する
 */
export const removeProject = async (id: number): Promise<void> => {
  if (!id || id <= 0) {
    throw new Error('無効なプロジェクトIDです');
  }

  try {
    await httpClient.delete(`api/projects/${id}`).json<ApiResponse<void>>();
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`プロジェクトの削除に失敗しました: ${message}`);
  }
};

/**
 * パスの妥当性を検証する
 */
export const validatePath = async (path: string): Promise<ValidationResult> => {
  if (!path || path.trim() === '') {
    throw new Error('パスが指定されていません');
  }

  try {
    const response = await httpClient
      .post('api/projects/validate-path', {
        json: { path: path.trim() },
      })
      .json<ApiResponse<ValidationResult>>();
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`パスの検証に失敗しました: ${message}`);
  }
};

/**
 * プロジェクトを選択する
 */
export const selectProject = async (id: number): Promise<void> => {
  if (!id || id <= 0) {
    throw new Error('無効なプロジェクトIDです');
  }

  try {
    await httpClient.post(`api/projects/${id}/select`).json<ApiResponse<void>>();
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`プロジェクトの選択に失敗しました: ${message}`);
  }
};
