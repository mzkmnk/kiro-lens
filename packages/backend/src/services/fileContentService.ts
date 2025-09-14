import { promises as fs } from 'fs';
import path from 'path';
import { FileContentError } from '@kiro-lens/shared';
import { getProjectById } from './projectService.js';
import { isPathSafe } from './fileTreeService.js';
import { isTextFile } from '../utils/fileTypeUtils.js';

/**
 * ファイルコンテンツサービス
 * プロジェクト内のファイル内容を安全に取得する
 */
export class FileContentService {
  /**
   * ファイル内容を取得する
   * @param projectId プロジェクトID
   * @param filePath ファイルパス（.kiro配下からの相対パス）
   * @returns ファイル内容
   * @throws FileContentError ファイル取得に失敗した場合
   */
  async getFileContent(projectId: string, filePath: string): Promise<string> {
    // プロジェクトの存在確認
    const project = await getProjectById(projectId);
    if (!project) {
      throw new FileContentError({
        code: 'PROJECT_NOT_FOUND',
        message: `プロジェクトが見つかりません: ${projectId}`,
        projectId,
      });
    }

    // ファイルパスの安全性確認
    const kiroDir = path.join(project.path, '.kiro');
    const fullPath = path.join(kiroDir, filePath);

    if (!isPathSafe(fullPath, kiroDir)) {
      throw new FileContentError({
        code: 'INVALID_PATH',
        message: `不正なファイルパス: ${filePath}`,
        filePath,
        projectId,
      });
    }

    try {
      // ファイルの存在と読み取り権限を確認
      await fs.access(fullPath, fs.constants.F_OK | fs.constants.R_OK);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === 'ENOENT') {
          throw new FileContentError({
            code: 'FILE_NOT_FOUND',
            message: `ファイルが見つかりません: ${filePath}`,
            filePath,
            projectId,
          });
        }
        if (nodeError.code === 'EACCES') {
          throw new FileContentError({
            code: 'PERMISSION_DENIED',
            message: `ファイル読み取り権限がありません: ${filePath}`,
            filePath,
            projectId,
          });
        }
      }
      throw new FileContentError({
        code: 'READ_ERROR',
        message: `ファイルアクセスエラー: ${filePath}`,
        filePath,
        projectId,
      });
    }

    try {
      // まずバイナリとして読み取り、テキストファイルかどうかを判定
      const buffer = await fs.readFile(fullPath);

      // テキストファイルかどうかを判定
      if (!isTextFile(filePath, buffer)) {
        throw new FileContentError({
          code: 'READ_ERROR',
          message: `ファイルはテキストファイルではありません: ${filePath}`,
          filePath,
          projectId,
        });
      }

      // テキストファイルの場合はUTF-8として読み取り
      const content = buffer.toString('utf-8');
      return content;
    } catch (error: unknown) {
      // FileContentErrorの場合はそのまま再スロー
      if (error instanceof FileContentError) {
        throw error;
      }

      throw new FileContentError({
        code: 'READ_ERROR',
        message: `ファイル読み取りエラー: ${filePath}`,
        filePath,
        projectId,
      });
    }
  }
}
