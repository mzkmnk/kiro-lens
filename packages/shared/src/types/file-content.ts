/**
 * ファイルコンテンツ関連の型定義
 */

/**
 * ファイル内容取得リクエスト型
 */
export interface FileContentRequest {
  /** 取得したいファイルの相対パス（.kiro配下からの相対パス） */
  filePath: string;
}

/**
 * ファイル内容レスポンス型
 */
export interface FileContentResponse {
  /** ファイルの内容 */
  content: string;
}

/**
 * ファイル内容エラー型
 */
export interface FileContentErrorType {
  /** エラーコード */
  code:
    | 'FILE_NOT_FOUND'
    | 'PROJECT_NOT_FOUND'
    | 'PERMISSION_DENIED'
    | 'INVALID_PATH'
    | 'READ_ERROR';
  /** エラーメッセージ */
  message: string;
  /** エラーが発生したファイルパス */
  filePath?: string;
  /** エラーが発生したプロジェクトID */
  projectId?: string;
}

/**
 * ファイル内容エラークラス
 */
export class FileContentError extends Error {
  public readonly code: FileContentErrorType['code'];
  public readonly filePath?: string;
  public readonly projectId?: string;

  constructor(error: FileContentErrorType) {
    super(error.message);
    this.name = 'FileContentError';
    this.code = error.code;
    this.filePath = error.filePath;
    this.projectId = error.projectId;
  }
}
