import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import type {
  DirectoryPermissions,
  FileSystemError as SharedFileSystemError,
} from '@kiro-lens/shared';

/**
 * ファイルシステム操作エラー
 */
export class FileSystemError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}

/**
 * パス検証と正規化
 *
 * 入力されたパスが絶対パスかどうかを検証し、絶対パスの場合はそのまま返します。
 *
 * @param inputPath - 入力パス
 * @returns 検証済みの絶対パス
 * @throws {FileSystemError} 絶対パスでない場合
 *
 * @example
 * ```typescript
 * resolvePath('/absolute/path') // => '/absolute/path'
 * resolvePath('./relative') // => throws FileSystemError
 * ```
 */
export function resolvePath(inputPath: string): string {
  if (!inputPath || inputPath.trim() === '') {
    throw new FileSystemError('パスが空です', 'EMPTY_PATH');
  }

  const trimmedPath = inputPath.trim();

  // 絶対パスかどうかをチェック
  if (!trimmedPath.startsWith('/')) {
    throw new FileSystemError(`絶対パスを指定してください: ${trimmedPath}`, 'INVALID_PATH_FORMAT');
  }

  return trimmedPath;
}

/**
 * ディレクトリ存在確認
 *
 * 指定されたパスがディレクトリとして存在するかどうかを確認します。
 *
 * @param dirPath - 確認するディレクトリパス
 * @returns ディレクトリが存在する場合はtrue
 *
 * @example
 * ```typescript
 * const exists = await checkDirectoryExists('/path/to/directory');
 * if (exists) {
 *   console.log('ディレクトリが存在します');
 * }
 * ```
 */
export async function checkDirectoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * .kiroディレクトリチェック
 *
 * 指定されたディレクトリ内に.kiroディレクトリが存在するかどうかを確認します。
 *
 * @param projectPath - プロジェクトのルートパス
 * @returns .kiroディレクトリが存在する場合はtrue
 *
 * @example
 * ```typescript
 * const hasKiro = await checkKiroDirectory('/path/to/project');
 * if (hasKiro) {
 *   console.log('.kiroディレクトリが見つかりました');
 * }
 * ```
 */
export async function checkKiroDirectory(projectPath: string): Promise<boolean> {
  try {
    const kiroPath = join(projectPath, '.kiro');
    return await checkDirectoryExists(kiroPath);
  } catch {
    return false;
  }
}

/**
 * ディレクトリ権限チェック
 *
 * 指定されたディレクトリの読み取り、書き込み、実行権限を確認します。
 *
 * @param dirPath - 確認するディレクトリパス
 * @returns 権限情報
 * @throws {FileSystemError} ディレクトリが存在しない場合
 *
 * @example
 * ```typescript
 * try {
 *   const permissions = await checkDirectoryPermissions('/path/to/directory');
 *   if (permissions.writable) {
 *     console.log('書き込み可能です');
 *   }
 * } catch (error) {
 *   console.error('権限チェックに失敗:', error.message);
 * }
 * ```
 */
export async function checkDirectoryPermissions(dirPath: string): Promise<DirectoryPermissions> {
  try {
    // ディレクトリの存在確認
    const exists = await checkDirectoryExists(dirPath);
    if (!exists) {
      throw new FileSystemError(`ディレクトリが存在しません: ${dirPath}`, 'DIRECTORY_NOT_FOUND');
    }

    // 権限チェック
    let readable = false;
    let writable = false;
    let executable = false;

    try {
      await fs.access(dirPath, fs.constants.R_OK);
      readable = true;
    } catch {
      // 読み取り権限なし
    }

    try {
      await fs.access(dirPath, fs.constants.W_OK);
      writable = true;
    } catch {
      // 書き込み権限なし
    }

    try {
      await fs.access(dirPath, fs.constants.X_OK);
      executable = true;
    } catch {
      // 実行権限なし
    }

    return {
      readable,
      writable,
      executable,
    };
  } catch (error) {
    if (error instanceof FileSystemError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new FileSystemError(
        `権限チェックに失敗しました: ${error.message}`,
        'PERMISSION_CHECK_FAILED',
        error
      );
    }

    throw new FileSystemError('権限チェック中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}

/**
 * パス入力補完のための候補取得
 *
 * 部分的な絶対パス入力に基づいて、マッチするディレクトリパスの候補を取得します。
 *
 * @param partialPath - 部分的な絶対パス入力
 * @returns マッチするパスの候補配列
 *
 * @example
 * ```typescript
 * const suggestions = await getPathSuggestions('/home/user/proj');
 * // => ['/home/user/project1', '/home/user/project2']
 * ```
 */
export async function getPathSuggestions(partialPath: string): Promise<string[]> {
  try {
    // 絶対パスかどうかを検証
    const validatedPath = resolvePath(partialPath);
    const parentDir = dirname(validatedPath);
    const searchTerm = basename(validatedPath);

    // 親ディレクトリが存在しない場合は空配列を返す
    const parentExists = await checkDirectoryExists(parentDir);
    if (!parentExists) {
      return [];
    }

    // 親ディレクトリ内のエントリを取得
    const entries = await fs.readdir(parentDir, { withFileTypes: true });

    // ディレクトリのみをフィルタリングし、検索語でマッチするものを抽出
    const suggestions: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith(searchTerm)) {
        suggestions.push(join(parentDir, entry.name));
      }
    }

    return suggestions.sort();
  } catch {
    return [];
  }
}
