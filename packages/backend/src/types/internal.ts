/**
 * バックエンド内部で使用される型定義
 */

/**
 * プロジェクトファイル取得リクエスト（内部用）
 */
export interface ProjectFilesRequest {
  /** プロジェクトID */
  id: string;
}

/**
 * プロジェクト選択リクエスト（内部用）
 */
export interface ProjectSelectRequest {
  /** プロジェクトID */
  id: string;
}

/**
 * サービス設定（内部用）
 */
export interface ServiceConfig {
  /** ログレベル */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** タイムアウト設定（ミリ秒） */
  timeout?: number;
}

/**
 * ファイルツリーサービスエラー（内部用）
 */
export interface FileTreeServiceError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** 元のエラー */
  cause?: Error;
}
