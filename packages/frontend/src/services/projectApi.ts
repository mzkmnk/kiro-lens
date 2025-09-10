import httpClient, { handleApiError } from './httpClient';
import type { ProjectInfo, ApiResponse, ValidationResult, ProjectListResponse } from '@kiro-lens/shared';

/**
 * プロジェクト一覧を取得する
 *
 * @returns プロジェクト情報の配列
 * @throws {Error} API通信エラーまたはサーバーエラーの場合
 *
 * @example
 * ```typescript
 * const projects = await getProjects();
 * console.log(projects); // [{ id: 1, name: 'project1', path: '/path/to/project1' }]
 * ```
 */
export const getProjects = async (): Promise<ProjectInfo[]> => {
  try {
    const response = await httpClient.get('api/projects').json<ApiResponse<ProjectListResponse>>();
    return [...(response.data?.projects || [])];
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`プロジェクト一覧の取得に失敗しました: ${message}`);
  }
};

/**
 * プロジェクトを追加する
 *
 * @param path - 追加するプロジェクトのパス
 * @returns 追加されたプロジェクト情報
 * @throws {Error} パスが無効、またはAPI通信エラーの場合
 *
 * @example
 * ```typescript
 * const project = await addProject('/path/to/new/project');
 * console.log(project); // { id: 2, name: 'new-project', path: '/path/to/new/project' }
 * ```
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

    if (!response.data) {
      throw new Error('プロジェクトデータが取得できませんでした');
    }
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`プロジェクトの追加に失敗しました: ${message}`);
  }
};

/**
 * プロジェクトを削除する
 *
 * @param id - 削除するプロジェクトのID
 * @throws {Error} プロジェクトIDが無効、またはAPI通信エラーの場合
 *
 * @example
 * ```typescript
 * await removeProject(1);
 * console.log('プロジェクトが削除されました');
 * ```
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
 *
 * @param path - 検証するパス
 * @returns パスの検証結果
 * @throws {Error} パスが無効、またはAPI通信エラーの場合
 *
 * @example
 * ```typescript
 * const result = await validatePath('/path/to/validate');
 * if (result.isValid) {
 *   console.log('パスは有効です');
 * } else {
 *   console.log('パスは無効です:', result.message);
 * }
 * ```
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

    if (!response.data) {
      throw new Error('バリデーション結果が取得できませんでした');
    }
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    throw new Error(`パスの検証に失敗しました: ${message}`);
  }
};

/**
 * プロジェクトを選択する
 *
 * @param id - 選択するプロジェクトのID
 * @throws {Error} プロジェクトIDが無効、またはAPI通信エラーの場合
 *
 * @example
 * ```typescript
 * await selectProject(1);
 * console.log('プロジェクトが選択されました');
 * ```
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
