import httpClient, { handleApiError } from './httpClient';
import type { FileTreeResponse } from '@kiro-lens/shared/types';

/**
 * プロジェクトのファイルツリーを取得する
 */
export const getProjectFiles = async (projectId: number): Promise<FileTreeResponse> => {
  if (!projectId || projectId <= 0) {
    throw new Error('無効なプロジェクトIDです');
  }

  try {
    // プロジェクトIDをURLエンコードして安全に処理
    const encodedProjectId = encodeURIComponent(projectId);
    const response = await httpClient
      .get(`api/projects/${encodedProjectId}/files`)
      .json<FileTreeResponse>();
    return response;
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`ファイルツリーの取得に失敗しました: ${message}`);
  }
};
