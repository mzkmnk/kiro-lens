import ky from 'ky';
import type {
  ApiResponse,
  ApiError,
  isApiSuccess,
  isApiError,
} from '@kiro-lens/shared/types/generated';

/**
 * TypeBoxスキーマベースの型安全APIクライアント
 *
 * 既存のAPIクライアントをTypeBoxスキーマベースに置き換える
 * 新しいクライアントです。統一されたエラーハンドリングと
 * 型安全性を提供します。
 */
export class TypedApiClient {
  private client: typeof ky;

  constructor(baseUrl: string = '/api') {
    this.client = ky.create({
      prefixUrl: baseUrl,
      timeout: 10000,
      retry: {
        limit: 2,
        methods: ['get'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      hooks: {
        beforeRequest: [
          request => {
            if (import.meta.env.DEV) {
              console.log(`🔄 ${request.method} ${request.url}`);
            }
          },
        ],
        afterResponse: [
          (request, _options, response) => {
            if (import.meta.env.DEV) {
              console.log(`✅ ${request.method} ${request.url} - ${response.status}`);
            }
          },
        ],
        beforeError: [
          error => {
            if (import.meta.env.DEV) {
              console.error(
                `❌ ${error.request?.method} ${error.request?.url} - ${error.response?.status}`
              );
            }
            return error;
          },
        ],
      },
    });
  }

  /**
   * 型安全なGETリクエスト
   *
   * @param url - リクエストURL
   * @returns APIレスポンス
   */
  async get<TResponse>(url: string): Promise<TResponse> {
    try {
      return await this.client.get(url).json<TResponse>();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 型安全なPOSTリクエスト
   *
   * @param url - リクエストURL
   * @param data - リクエストデータ
   * @returns APIレスポンス
   */
  async post<TRequest, TResponse>(url: string, data: TRequest): Promise<TResponse> {
    try {
      return await this.client.post(url, { json: data }).json<TResponse>();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 型安全なPUTリクエスト
   *
   * @param url - リクエストURL
   * @param data - リクエストデータ
   * @returns APIレスポンス
   */
  async put<TRequest, TResponse>(url: string, data: TRequest): Promise<TResponse> {
    try {
      return await this.client.put(url, { json: data }).json<TResponse>();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 型安全なDELETEリクエスト
   *
   * @param url - リクエストURL
   * @returns APIレスポンス
   */
  async delete<TResponse>(url: string): Promise<TResponse> {
    try {
      return await this.client.delete(url).json<TResponse>();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * エラーハンドリング
   *
   * @param error - kyエラー
   * @returns 処理されたエラー
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error && 'response' in error) {
      const httpError = error as any;

      // HTTPエラーレスポンスがある場合
      if (httpError.response) {
        try {
          // APIエラーレスポンスを解析
          const errorResponse = httpError.response.json() as ApiResponse<never>;

          if (isApiError(errorResponse) && errorResponse.error) {
            return new ApiClientError(
              errorResponse.error.message,
              errorResponse.error.type,
              httpError.response.status,
              errorResponse.error
            );
          }
        } catch {
          // JSON解析に失敗した場合はHTTPエラーとして処理
        }

        return new ApiClientError(
          `HTTP ${httpError.response.status}: ${httpError.message}`,
          'INTERNAL_ERROR',
          httpError.response.status
        );
      }
    }

    // ネットワークエラーやその他のエラー
    return new ApiClientError(
      error instanceof Error ? error.message : 'Unknown error',
      'INTERNAL_ERROR'
    );
  }

  /**
   * APIレスポンスからデータを安全に抽出
   *
   * @param response - APIレスポンス
   * @returns データまたはエラーをthrow
   */
  static extractData<T>(response: ApiResponse<T>): T {
    if (isApiSuccess(response)) {
      return response.data;
    }

    if (isApiError(response) && response.error) {
      throw new ApiClientError(
        response.error.message,
        response.error.type,
        undefined,
        response.error
      );
    }

    throw new ApiClientError('Invalid API response format', 'INTERNAL_ERROR');
  }

  /**
   * APIレスポンスが成功かどうかを判定
   *
   * @param response - APIレスポンス
   * @returns 成功かどうか
   */
  static isSuccess<T>(
    response: ApiResponse<T>
  ): response is ApiResponse<T> & { success: true; data: T } {
    return isApiSuccess(response);
  }

  /**
   * APIレスポンスがエラーかどうかを判定
   *
   * @param response - APIレスポンス
   * @returns エラーかどうか
   */
  static isError<T>(
    response: ApiResponse<T>
  ): response is ApiResponse<T> & { success: false; error: ApiError } {
    return isApiError(response);
  }
}

/**
 * APIクライアントエラー
 *
 * TypedApiClientで発生するエラーを表現するクラス
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly type: ApiError['type'],
    public readonly statusCode?: number,
    public readonly apiError?: ApiError
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  /**
   * エラーがバリデーションエラーかどうか
   */
  get isValidationError(): boolean {
    return this.type === 'VALIDATION_ERROR';
  }

  /**
   * エラーがリソース未発見エラーかどうか
   */
  get isNotFoundError(): boolean {
    return this.type === 'NOT_FOUND';
  }

  /**
   * エラーが権限エラーかどうか
   */
  get isPermissionError(): boolean {
    return this.type === 'PERMISSION_DENIED';
  }

  /**
   * エラーがサーバーエラーかどうか
   */
  get isServerError(): boolean {
    return this.type === 'INTERNAL_ERROR';
  }

  /**
   * エラーがレート制限エラーかどうか
   */
  get isRateLimitError(): boolean {
    return this.type === 'RATE_LIMIT_EXCEEDED';
  }
}

// シングルトンインスタンス
export const typedApiClient = new TypedApiClient();
