/**
 * API通信ラッパークラス
 *
 * fetch APIをラップして型安全なHTTP通信を提供します。
 * 基本的なHTTPメソッド（GET、POST、PUT、DELETE）をサポートします。
 */
export class ApiClient {
  public readonly baseUrl: string;

  /**
   * ApiClientのコンストラクタ
   *
   * @param baseUrl - APIのベースURL（末尾のスラッシュは自動で削除されます）
   */
  constructor(baseUrl: string) {
    // 末尾のスラッシュを削除
    this.baseUrl = baseUrl.replace(/\/$/, '');
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
   * 共通のHTTPリクエスト処理
   *
   * @param method - HTTPメソッド
   * @param path - リクエストパス
   * @param data - リクエストボディ（オプション）
   * @returns レスポンスデータ
   */
  private async request<T>(method: string, path: string, data?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const options: {
      method: string;
      headers: Record<string, string>;
      body?: string;
    } = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // POSTやPUTの場合はボディを追加
    if (data !== undefined && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}
