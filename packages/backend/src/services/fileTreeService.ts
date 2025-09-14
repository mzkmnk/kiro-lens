import type { FileItem } from '@kiro-lens/shared';
import { promises as fs } from 'fs';
import { join, relative, resolve } from 'path';
import { getProjectById } from './projectService';
const { readdir, stat } = fs;

/**
 * ファイルツリー取得エラー
 */
export class FileTreeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'FileTreeError';
  }
}

/**
 * パストラバーサル攻撃を防ぐためのパス検証
 *
 * @param targetPath - 検証対象のパス
 * @param basePath - ベースパス
 * @returns 安全なパスかどうか
 */
export function isPathSafe(targetPath: string, basePath: string): boolean {
  const resolvedTarget = resolve(targetPath);
  const resolvedBase = resolve(basePath);
  const relativePath = relative(resolvedBase, resolvedTarget);

  // 相対パスが '..' で始まる場合はベースパス外へのアクセス
  return !relativePath.startsWith('..') && !resolve(relativePath).startsWith('..');
}

/**
 * ディレクトリを再帰的に読み取り、FileItem形式に変換
 *
 * @param dirPath - 読み取るディレクトリのパス
 * @param basePath - ベースパス（IDの生成に使用）
 * @param projectId - プロジェクトID（IDの生成に使用）
 * @param maxDepth - 最大再帰深度（デフォルト: 10）
 * @param currentDepth - 現在の深度（内部使用）
 * @returns FileItem配列
 */
async function readDirectoryRecursive(
  dirPath: string,
  basePath: string,
  projectId: string,
  maxDepth: number = 10,
  currentDepth: number = 0
): Promise<FileItem[]> {
  // セキュリティ: パストラバーサル攻撃対策
  if (!isPathSafe(dirPath, basePath)) {
    throw new FileTreeError(
      `不正なパスアクセスが検出されました: ${dirPath}`,
      'INVALID_PATH_ACCESS'
    );
  }

  // パフォーマンス: 深度制限
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const dirents = await readdir(dirPath, { withFileTypes: true });
    const items: FileItem[] = [];

    // パフォーマンス: 大量ファイル対応（1000ファイル制限）
    if (dirents.length > 1000) {
      // 最初の1000個のみ処理
      dirents.splice(1000);
    }

    for (const dirent of dirents) {
      const fullPath = join(dirPath, dirent.name);
      const relativePath = fullPath.replace(basePath, '').replace(/^\//, '');
      const id = `${projectId}/.kiro/${relativePath}`;

      if (dirent.isDirectory()) {
        // フォルダの場合、再帰的に子要素を取得
        const children = await readDirectoryRecursive(
          fullPath,
          basePath,
          projectId,
          maxDepth,
          currentDepth + 1
        );
        items.push({
          id,
          name: dirent.name,
          path: relativePath,
          type: 'folder',
          children,
        });
      } else {
        // ファイルの場合
        try {
          const stats = await stat(fullPath);
          items.push({
            id,
            name: dirent.name,
            path: relativePath,
            type: 'file',
            size: stats.size,
          });
        } catch {
          // ファイル情報取得に失敗した場合はサイズなしで追加
          items.push({
            id,
            name: dirent.name,
            path: relativePath,
            type: 'file',
          });
        }
      }
    }

    return items;
  } catch (error) {
    if (error instanceof FileTreeError) {
      throw error;
    }

    if (error instanceof Error && 'code' in error) {
      const errorCode = (error as { code?: string }).code;

      switch (errorCode) {
        case 'EACCES':
          throw new FileTreeError(
            `ディレクトリへの読み取り権限がありません: ${dirPath}`,
            'PERMISSION_DENIED',
            error
          );
        case 'ENOENT':
          throw new FileTreeError(
            `ディレクトリが存在しません: ${dirPath}`,
            'DIRECTORY_NOT_FOUND',
            error
          );
        case 'ENOTDIR':
          throw new FileTreeError(
            `指定されたパスはディレクトリではありません: ${dirPath}`,
            'NOT_A_DIRECTORY',
            error
          );
        default:
          throw new FileTreeError(
            `ファイルシステムエラーが発生しました: ${error.message}`,
            'FILESYSTEM_ERROR',
            error
          );
      }
    }

    throw new FileTreeError(
      'ファイルツリーの読み取り中に予期しないエラーが発生しました',
      'UNEXPECTED_ERROR',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * プロジェクトのファイルツリーを取得
 *
 * 指定されたプロジェクトの.kiro配下のファイル構造を取得します。
 *
 * @param projectId - プロジェクトID
 * @returns ファイルツリー
 * @throws {FileTreeError} ファイルツリーの取得に失敗した場合
 */
export async function getProjectFiles(projectId: string): Promise<FileItem[]> {
  try {
    // 指定されたIDのプロジェクト情報を取得
    const project = await getProjectById(projectId);

    if (!project) {
      throw new FileTreeError('指定されたプロジェクトが見つかりません', 'PROJECT_NOT_FOUND');
    }

    // プロジェクトが有効かチェック
    if (!project.isValid) {
      throw new FileTreeError('プロジェクトが無効です', 'PROJECT_INVALID');
    }

    // .kiroディレクトリが存在するかチェック
    if (!project.hasKiroDir) {
      throw new FileTreeError('.kiroディレクトリが存在しません', 'KIRO_DIR_NOT_FOUND');
    }

    // .kiroディレクトリのファイル構造を取得
    const kiroPath = project.kiroPath;
    const files = await readDirectoryRecursive(kiroPath, kiroPath, projectId);

    return files;
  } catch (error) {
    if (error instanceof FileTreeError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new FileTreeError(
        `ファイルツリーの取得に失敗しました: ${error.message}`,
        'GET_FILES_FAILED',
        error
      );
    }

    throw new FileTreeError('ファイルツリーの取得中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}
