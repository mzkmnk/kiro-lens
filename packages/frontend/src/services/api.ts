import type {
  AddProjectRequest,
  AddProjectResponse,
  ProjectListResponse,
  ValidationResult,
  ProjectInfo,
} from '@kiro-lens/shared';

/**
 * API通信ラッパークラス
 *
 * fetch APIをラップして型安全なHTTP通信を提供します。
 * 基本的なHTTPメソッド（GET、POST、PUT、DELETE）をサポートします。
 */
export class ApiClient {
  /** APIのベースURL（環境変数から取得、フォールバック付き） */
  private static readonly BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  /**
   * ApiClientのコンストラクタ
   */
  constructor() {
    // 環境変数から自動取得
  }

  /**
   * GETリクエストを送信
   *
   * @param path - リクエストパス
   * @returns レスポンスデータ
   */
  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  /**
   * POSTリクエストを送信
   *
   * @param path - リクエストパス
   * @param data - リクエストボディ
   * @returns レスポンスデータ
   */
  async post<T = unknown>(path: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', path, data);
  }

  /**
   * PUTリクエストを送信
   *
   * @param path - リクエストパス
   * @param data - リクエストボディ
   * @returns レスポンスデータ
   */
  async put<T = unknown>(path: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', path, data);
  }

  /**
   * DELETEリクエストを送信
   *
   * @param path - リクエストパス
   * @returns レスポンスデータ
   */
  async delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  /**
   * プロジェクトを追加
   *
   * @param path - プロジェクトのパス
   * @returns 追加されたプロジェクト情報
   */
  async addProject(path: string): Promise<AddProjectResponse> {
    const requestData: AddProjectRequest = { path };
    return this.post<AddProjectResponse>('/api/projects', requestData);
  }

  /**
   * プロジェクトを削除
   *
   * @param id - 削除するプロジェクトのID
   * @returns 削除結果メッセージ
   */
  async removeProject(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/projects/${id}`);
  }

  /**
   * プロジェクト一覧を取得
   *
   * @returns プロジェクト一覧と現在選択中のプロジェクト
   */
  async getProjects(): Promise<ProjectListResponse> {
    return this.get<ProjectListResponse>('/api/projects');
  }

  /**
   * パスを検証
   *
   * @param path - 検証するパス
   * @returns 検証結果
   */
  async validatePath(path: string): Promise<ValidationResult> {
    return this.post<ValidationResult>('/api/projects/validate-path', { path });
  }

  /**
   * プロジェクトを選択
   *
   * @param id - 選択するプロジェクトのID
   * @returns 選択されたプロジェクト情報
   */
  async selectProject(id: string): Promise<{ project: ProjectInfo; message: string }> {
    return this.post<{ project: ProjectInfo; message: string }>(`/api/projects/${id}/select`);
  }

  /**
   * 共通のHTTPリクエスト処理
   *
   * @param method - HTTPメソッド
   * @param path - リクエストパス
   * @param data - リクエストボディ（オプション）
   * @returns レスポンスデータ
   */
  private async request<T>(method: string, path: string, data?: unknown): Promise<T> {
    const url = `${ApiClient.BASE_URL}${path}`;

    const options: {
      method: string;
      headers: Record<string, string>;
      body?: string;
    } = {
      method,
      headers: {},
    };

    // POSTやPUTの場合はボディを追加
    if (data !== undefined && (method === 'POST' || method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // 新しいAPIエンドポイント（/api/projects/*）の場合はApiResponse形式からdataを抽出
    if (path.startsWith('/api/projects')) {
      if (result.success && result.data !== undefined) {
        return result.data;
      } else if (!result.success && result.error) {
        throw new Error(result.error.message);
      }
    }

    return result;
  }
}
