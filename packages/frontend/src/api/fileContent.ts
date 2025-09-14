import type {
  FileContentRequest,
  FileContentResponse,
  ApiResponse,
} from '@kiro-lens/shared';
import { apiClient } from './apiClient';

/**
 * ファイル内容取得関数
 *
 * @param projectId プロジェクトID
 * @param filePath ファイルパス（.kiro配下からの相対パス）
 * @returns ファイル内容
 * @throws Error ファイル取得に失敗した場合
 */
export async function getFileContent(
  projectId: string,
  filePath: string,
): Promise<string> {
  const request: FileContentRequest = { filePath };

  const response = await apiClient.post<ApiResponse<FileContentResponse>>(
    `/api/projects/${projectId}/files/content`,
    request,
  );

  if (!response.success) {
    throw new Error(
      response.error?.message || 'ファイル内容の取得に失敗しました',
    );
  }

  return response.data.content;
}

/**
 * エラーハンドリング付きのファイル内容取得関数
 *
 * @param projectId プロジェクトID
 * @param filePath ファイルパス（.kiro配下からの相対パス）
 * @returns 取得結果（成功時はcontent、失敗時はerror）
 */
export async function safeGetFileContent(
  projectId: string,
  filePath: string,
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const content = await getFileContent(projectId, filePath);
    return { success: true, content };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'ファイル内容の取得に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * ファイル内容取得のバリデーション関数
 *
 * @param projectId プロジェクトID
 * @param filePath ファイルパス
 * @returns バリデーション結果
 */
export function validateFileContentRequest(
  projectId: string,
  filePath: string,
): { valid: boolean; error?: string } {
  if (!projectId || projectId.trim().length === 0) {
    return { valid: false, error: 'プロジェクトIDが必要です' };
  }

  if (!filePath || filePath.trim().length === 0) {
    return { valid: false, error: 'ファイルパスが必要です' };
  }

  // 基本的なパストラバーサル攻撃の検出
  if (filePath.includes('../') || filePath.includes('..\\')) {
    return { valid: false, error: '不正なファイルパスです' };
  }

  // 絶対パスの検出
  if (filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)) {
    return { valid: false, error: '絶対パスは使用できません' };
  }

  return { valid: true };
}
