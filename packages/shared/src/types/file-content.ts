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
  /** 将来の拡張用メタデータ（現在は未使用） */
  metadata?: FileMetadata;
}

/**
 * ファイルメタデータ型（将来使用）
 */
export interface FileMetadata {
  /** ファイルサイズ（バイト） */
  size: number;
  /** 最終更新日時 */
  lastModified: string;
  /** 文字エンコーディング */
  encoding: string;
}

/**
 * ファイル内容エラー型
 */
export interface FileContentError {
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
