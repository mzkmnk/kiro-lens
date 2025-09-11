/**
 * ファイルシステム操作エラーの種類
 */
export type FileSystemErrorType =
  | 'EMPTY_PATH'
  | 'INVALID_PATH_FORMAT'
  | 'DIRECTORY_NOT_FOUND'
  | 'PERMISSION_CHECK_FAILED'
  | 'UNKNOWN_ERROR';

/**
 * ファイルシステム操作エラー
 */
export class FileSystemError extends Error {
  constructor(
    message: string,
    public readonly code: FileSystemErrorType,
    public override readonly cause?: Error
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}

/**
 * ディレクトリ権限情報
 */
export interface DirectoryPermissions {
  /** 読み取り可能かどうか */
  readonly readable: boolean;
  /** 書き込み可能かどうか */
  readonly writable: boolean;
  /** 実行可能かどうか */
  readonly executable: boolean;
}
