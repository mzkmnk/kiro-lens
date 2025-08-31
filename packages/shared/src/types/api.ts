// API関連の型定義

/**
 * APIエラータイプ
 *
 * kiro-lens APIで発生する可能性のあるエラーの種類を定義します。
 */
export type ApiErrorType =
  /** リクエストデータの検証エラー */
  | 'VALIDATION_ERROR'
  /** 要求されたリソースが見つからない */
  | 'NOT_FOUND'
  /** サーバー内部エラー */
  | 'INTERNAL_ERROR'
  /** アクセス権限がない */
  | 'PERMISSION_DENIED'
  /** レート制限に達した */
  | 'RATE_LIMIT_EXCEEDED';

/**
 * APIエラー
 *
 * API呼び出し時に発生するエラーの詳細情報を表します。
 * クライアント側でのエラーハンドリングを支援するための情報を含みます。
 */
export interface ApiError {
  /** エラータイプ */
  readonly type: ApiErrorType;
  /** ユーザー向けエラーメッセージ */
  readonly message: string;
  /** エラー詳細情報（デバッグ用） */
  readonly details?: unknown;
  /** エラー発生時刻 */
  readonly timestamp: Date;
}

/**
 * API共通レスポンス
 *
 * すべてのkiro-lens APIエンドポイントで使用される統一レスポンス形式です。
 * 成功時はdataフィールドに結果を、失敗時はerrorフィールドにエラー情報を含みます。
 *
 * @template T - レスポンスデータの型
 *
 * @example
 * ```typescript
 * // 成功レスポンス
 * const success: ApiResponse<string> = {
 *   success: true,
 *   data: "Hello World"
 * };
 *
 * // エラーレスポンス
 * const error: ApiResponse<never> = {
 *   success: false,
 *   error: {
 *     type: 'NOT_FOUND',
 *     message: 'Resource not found',
 *     timestamp: new Date()
 *   }
 * };
 * ```
 */
export interface ApiResponse<T = unknown> {
  /** API呼び出しが成功したかどうか */
  readonly success: boolean;
  /** レスポンスデータ（成功時のみ） */
  readonly data?: T;
  /** エラー情報（失敗時のみ） */
  readonly error?: ApiError;
}
