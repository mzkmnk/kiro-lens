import type { ApiError, ApiResponse } from '@kiro-lens/shared/types/generated';

/**
 * API型ヘルパー
 *
 * TypeBoxスキーマベースのAPIレスポンスから型を抽出し、
 * TypeScript型推論を最適化するためのユーティリティ型です。
 */

/**
 * APIレスポンスからデータ型を抽出
 *
 * @template T - APIレスポンスの型
 * @example
 * ```typescript
 * type UserData = ExtractApiData<ApiResponse<User>>;
 * // UserData は User 型になる
 * ```
 */
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * 成功レスポンスの型
 *
 * @template T - データの型
 */
export type SuccessApiResponse<T> = ApiResponse<T> & {
  success: true;
  data: T;
};

/**
 * エラーレスポンスの型
 */
export type ErrorApiResponse = ApiResponse<never> & {
  success: false;
  error: ApiError;
};

/**
 * APIレスポンスの判別共用体型
 *
 * @template T - データの型
 */
export type ApiResponseUnion<T> = SuccessApiResponse<T> | ErrorApiResponse;

/**
 * 型ガード関数: APIレスポンスが成功かどうかを判定
 *
 * @param response - APIレスポンス
 * @returns APIが成功した場合はtrue
 *
 * @example
 * ```typescript
 * const response = await apiCall();
 * if (isApiSuccess(response)) {
 *   // response.data は型安全にアクセス可能
 *   console.log('Success:', response.data);
 * } else {
 *   // response.error は型安全にアクセス可能
 *   console.error('Error:', response.error);
 * }
 * ```
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is SuccessApiResponse<T> {
  return response.success === true && response.data !== undefined;
}

/**
 * 型ガード関数: APIレスポンスがエラーかどうかを判定
 *
 * @param response - APIレスポンス
 * @returns APIがエラーの場合はtrue
 *
 * @example
 * ```typescript
 * const response = await apiCall();
 * if (isApiError(response)) {
 *   // response.error は型安全にアクセス可能
 *   console.error('Error type:', response.error.type);
 *   console.error('Error message:', response.error.message);
 * }
 * ```
 */
export function isApiError<T>(response: ApiResponse<T>): response is ErrorApiResponse {
  return response.success === false && response.error !== undefined;
}

/**
 * APIレスポンスからデータを安全に抽出
 *
 * @param response - APIレスポンス
 * @returns データまたはundefined
 *
 * @example
 * ```typescript
 * const response = await apiCall();
 * const data = extractApiData(response);
 * if (data) {
 *   // data は型安全
 *   console.log(data);
 * }
 * ```
 */
export function extractApiData<T>(response: ApiResponse<T>): T | undefined {
  return isApiSuccess(response) ? response.data : undefined;
}

/**
 * APIレスポンスからエラーを安全に抽出
 *
 * @param response - APIレスポンス
 * @returns エラーまたはundefined
 *
 * @example
 * ```typescript
 * const response = await apiCall();
 * const error = extractApiError(response);
 * if (error) {
 *   console.error('API Error:', error.message);
 * }
 * ```
 */
export function extractApiError<T>(response: ApiResponse<T>): ApiError | undefined {
  return isApiError(response) ? response.error : undefined;
}

/**
 * 条件付き型: APIレスポンスが成功の場合のみデータ型を返す
 *
 * @template T - APIレスポンスの型
 * @template U - 成功時のデータ型
 */
export type IfApiSuccess<T, U> = T extends SuccessApiResponse<infer D> ? U : never;

/**
 * 条件付き型: APIレスポンスがエラーの場合のみエラー型を返す
 *
 * @template T - APIレスポンスの型
 * @template U - エラー時の型
 */
export type IfApiError<T, U> = T extends ErrorApiResponse ? U : never;

/**
 * APIレスポンス配列からデータ配列を抽出
 *
 * @template T - データの型
 */
export type ExtractApiDataArray<T> = T extends ApiResponse<(infer U)[]> ? U[] : never;

/**
 * ページネーション対応APIレスポンスからデータを抽出
 *
 * @template T - データの型
 */
export type ExtractPaginatedData<T> =
  T extends ApiResponse<{
    data: (infer U)[];
    pagination: any;
  }>
    ? U[]
    : never;

/**
 * TypeScript型推論最適化のためのユーティリティ
 */
export namespace TypeInference {
  /**
   * 型の等価性をチェック
   */
  export type Equals<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

  /**
   * 型が never かどうかをチェック
   */
  export type IsNever<T> = [T] extends [never] ? true : false;

  /**
   * 型が unknown かどうかをチェック
   */
  export type IsUnknown<T> =
    IsNever<T> extends false
      ? T extends unknown
        ? unknown extends T
          ? true
          : false
        : false
      : false;

  /**
   * 型が any かどうかをチェック
   */
  export type IsAny<T> = 0 extends 1 & T ? true : false;

  /**
   * より厳密な型推論のためのアサーション
   */
  export function assertType<T>(): <U extends T>(value: U) => U {
    return value => value;
  }

  /**
   * 型の詳細情報を取得（開発時のデバッグ用）
   */
  export type TypeInfo<T> = {
    type: T;
    isNever: IsNever<T>;
    isUnknown: IsUnknown<T>;
    isAny: IsAny<T>;
  };
}
