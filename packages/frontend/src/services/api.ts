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
