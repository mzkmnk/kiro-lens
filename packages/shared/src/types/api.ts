// API関連の型定義

import type { ProjectInfo } from './project';
import type { FileItem } from './file-tree';

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

// パス管理システム用のAPIリクエスト/レスポンス型

/**
 * プロジェクト追加リクエスト
 *
 * POST /api/projects エンドポイントのリクエスト形式を定義します。
 */
export interface AddProjectRequest {
  /** 追加するプロジェクトのパス */
  readonly path: string;
}

/**
 * プロジェクト追加レスポンス
 *
 * POST /api/projects エンドポイントのレスポンス形式を定義します。
 */
export interface AddProjectResponse {
  /** 追加されたプロジェクト情報 */
  readonly project: ProjectInfo;
  /** 成功メッセージ */
  readonly message: string;
}

/**
 * プロジェクト一覧レスポンス
 *
 * GET /api/projects エンドポイントのレスポンス形式を定義します。
 */
export interface ProjectListResponse {
  /** 管理対象のプロジェクト一覧 */
  readonly projects: readonly ProjectInfo[];
  /** 現在選択中のプロジェクト */
  readonly currentProject?: ProjectInfo;
}

/**
 * パス検証結果
 *
 * POST /api/projects/validate-path エンドポイントのレスポンス形式を定義します。
 */
export interface ValidationResult {
  /** 検証が成功したかどうか */
  readonly isValid: boolean;
  /** エラーメッセージ（検証失敗時） */
  readonly error?: string;
  /** 検証されたパス（成功時） */
  readonly validatedPath?: string;
}

/**
 * ファイルツリーレスポンス
 *
 * GET /api/projects/:id/files エンドポイントのレスポンス形式を定義します。
 * 既存のFileItem型を使用してファイル構造を表現します。
 */
export interface FileTreeResponse {
  /** プロジェクトの.kiro配下のファイル構造 */
  readonly files: FileItem[];
}

/**
 * API結果型
 *
 * API呼び出しの結果を表現する型です。
 * 成功時はSuccess<T>、失敗時はFailure<E>を返します。
 *
 * @template T - 成功時のデータ型
 * @template E - 失敗時のエラー型
 */
export type ApiResult<T, E = ApiError> = { success: true; data: T } | { success: false; error: E };

/**
 * ValidationResult型ガード関数
 *
 * ValidationResultが成功かどうかを判定します。
 *
 * @param result - 検証結果
 * @returns 検証が成功した場合はtrue
 *
 * @example
 * ```typescript
 * const result = await validatePath('/some/path');
 * if (isValidationSuccess(result)) {
 *   console.log('Valid path:', result.validatedPath);
 * } else {
 *   console.error('Validation error:', result.error);
 * }
 * ```
 */
export function isValidationSuccess(
  result: ValidationResult
): result is ValidationResult & { isValid: true; validatedPath: string } {
  return result.isValid && result.validatedPath !== undefined;
}

/**
 * ApiResponse型ガード関数
 *
 * ApiResponseが成功かどうかを判定します。
 *
 * @param response - APIレスポンス
 * @returns APIが成功した場合はtrue
 *
 * @example
 * ```typescript
 * const response = await apiCall();
 * if (isApiSuccess(response)) {
 *   console.log('Success:', response.data);
 * } else {
 *   console.error('Error:', response.error);
 * }
 * ```
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success && response.data !== undefined;
}
