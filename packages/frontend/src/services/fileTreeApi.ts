import httpClient, { handleApiError } from './httpClient';
import type { FileTreeResponse } from '@kiro-lens/shared';

/**
 * プロジェクトのファイルツリーを取得する
 *
 * @param projectId - 取得するプロジェクトのID（1以上の正の整数）
 * @returns プロジェクトのファイルツリー情報
 * @throws {Error} プロジェクトIDが無効、またはAPI通信エラーの場合
 *
 * @example
 * ```typescript
 * const fileTree = await getProjectFiles(1);
 * console.log(fileTree.files); // [{ name: 'src', type: 'directory', children: [...] }]
 * ```
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
