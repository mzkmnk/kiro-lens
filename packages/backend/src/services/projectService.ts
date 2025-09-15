import { randomUUID } from 'crypto';
import { basename, join } from 'path';
import type { ProjectInfo, AppConfig, ValidationResult } from '@kiro-lens/shared';
import { loadConfig, saveConfig } from './configService';
import {
  resolvePath,
  checkDirectoryExists,
  checkKiroDirectory,
  checkDirectoryPermissions,
} from './fileSystemService';

/**
 * プロジェクト管理エラー
 */
export class ProjectError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ProjectError';
  }
}

/**
 * プロジェクトパスの検証
 *
 * 指定されたパスがプロジェクトとして有効かどうかを検証します。
 *
 * @param inputPath - 検証するパス
 * @returns 検証結果
 *
 * @example
 * ```typescript
 * const result = await validateProjectPath('/path/to/project');
 * if (result.isValid) {
 *   console.log('有効なプロジェクトパスです');
 * } else {
 *   console.error('エラー:', result.error);
 * }
 * ```
 */
export async function validateProjectPath(inputPath: string): Promise<ValidationResult> {
  try {
    // パスの正規化
    const validatedPath = resolvePath(inputPath);

    // ディレクトリの存在確認
    const exists = await checkDirectoryExists(validatedPath);
    if (!exists) {
      return {
        isValid: false,
        error: `指定されたディレクトリが存在しません: ${validatedPath}`,
      };
    }

    // .kiroディレクトリの存在確認
    const hasKiroDir = await checkKiroDirectory(validatedPath);
    if (!hasKiroDir) {
      return {
        isValid: false,
        error: `指定されたディレクトリに.kiroディレクトリが存在しません: ${validatedPath}`,
      };
    }

    // 権限チェック
    const permissions = await checkDirectoryPermissions(validatedPath);
    if (!permissions.readable) {
      return {
        isValid: false,
        error: `指定されたディレクトリに読み取り権限がありません: ${validatedPath}`,
      };
    }

    return {
      isValid: true,
      validatedPath,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
    return {
      isValid: false,
      error: '不明なエラーが発生しました',
    };
  }
}

/**
 * プロジェクトの追加
 *
 * 新しいプロジェクトを設定に追加します。
 *
 * @param path - プロジェクトのパス
 * @returns 追加されたプロジェクト情報
 * @throws {ProjectError} プロジェクトの追加に失敗した場合
 *
 * @example
 * ```typescript
 * try {
 *   const project = await addProject('/path/to/project');
 *   console.log('プロジェクトを追加しました:', project.name);
 * } catch (error) {
 *   console.error('追加に失敗:', error.message);
 * }
 * ```
 */
export async function addProject(path: string): Promise<ProjectInfo> {
  try {
    // パスの検証
    const validation = await validateProjectPath(path);
    if (!validation.isValid) {
      throw new ProjectError(validation.error || 'パスの検証に失敗しました', 'INVALID_PATH');
    }

    const validatedPath = validation.validatedPath!;

    // 現在の設定を読み込み
    const config = await loadConfig();

    // 既に同じパスのプロジェクトが存在するかチェック
    const existingProject = config.projects.find(p => p.path === validatedPath);
    if (existingProject) {
      throw new ProjectError(
        `指定されたパスは既にプロジェクトとして登録されています: ${validatedPath}`,
        'PROJECT_ALREADY_EXISTS'
      );
    }

    // 新しいプロジェクト情報を作成
    const now = new Date().toISOString();
    const projectName = basename(validatedPath);
    const kiroPath = join(validatedPath, '.kiro');

    const newProject: ProjectInfo = {
      id: randomUUID(),
      name: projectName,
      path: validatedPath,
      kiroPath,
      hasKiroDir: true,
      isValid: true,
      addedAt: now,
    };

    // 設定を更新
    const updatedConfig: AppConfig = {
      ...config,
      projects: [...config.projects, newProject],
    };

    await saveConfig(updatedConfig);

    return newProject;
  } catch (error) {
    if (error instanceof ProjectError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ProjectError(
        `プロジェクトの追加に失敗しました: ${error.message}`,
        'ADD_FAILED',
        error
      );
    }

    throw new ProjectError('プロジェクトの追加中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}
/**
 * プロジェクトの削除
 *
 * 指定されたIDのプロジェクトを設定から削除します。
 *
 * @param id - 削除するプロジェクトのID
 * @throws {ProjectError} プロジェクトの削除に失敗した場合
 *
 * @example
 * ```typescript
 * try {
 *   await removeProject('project-id');
 *   console.log('プロジェクトを削除しました');
 * } catch (error) {
 *   console.error('削除に失敗:', error.message);
 * }
 * ```
 */
export async function removeProject(id: string): Promise<void> {
  try {
    // 現在の設定を読み込み
    const config = await loadConfig();

    // 指定されたIDのプロジェクトが存在するかチェック
    const projectIndex = config.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      throw new ProjectError(
        `指定されたIDのプロジェクトが見つかりません: ${id}`,
        'PROJECT_NOT_FOUND'
      );
    }

    // プロジェクトを削除
    const updatedProjects = config.projects.filter(p => p.id !== id);

    // 削除されたプロジェクトが現在選択中の場合、選択を解除
    let updatedSettings = config.settings;
    if (config.settings.lastSelectedProject === id) {
      updatedSettings = {
        ...config.settings,
        lastSelectedProject: undefined,
      };
    }

    // 設定を更新
    const updatedConfig: AppConfig = {
      ...config,
      projects: updatedProjects,
      settings: updatedSettings,
    };

    await saveConfig(updatedConfig);
  } catch (error) {
    if (error instanceof ProjectError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ProjectError(
        `プロジェクトの削除に失敗しました: ${error.message}`,
        'REMOVE_FAILED',
        error
      );
    }

    throw new ProjectError('プロジェクトの削除中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}

/**
 * 全プロジェクトの取得
 *
 * 設定に登録されている全てのプロジェクトを取得し、
 * 各プロジェクトの有効性を確認して更新します。
 *
 * @returns プロジェクト一覧
 *
 * @example
 * ```typescript
 * const projects = await getAllProjects();
 * console.log(`${projects.length}個のプロジェクトが登録されています`);
 * ```
 */
export async function getAllProjects(): Promise<ProjectInfo[]> {
  try {
    // 現在の設定を読み込み
    const config = await loadConfig();

    // 各プロジェクトの有効性を確認
    const updatedProjects: ProjectInfo[] = [];
    let hasChanges = false;

    for (const project of config.projects) {
      // ディレクトリとkiroディレクトリの存在確認
      const dirExists = await checkDirectoryExists(project.path);
      const kiroExists = dirExists ? await checkKiroDirectory(project.path) : false;

      const isValid = dirExists && kiroExists;

      // 有効性が変更された場合は更新
      if (project.isValid !== isValid || project.hasKiroDir !== kiroExists) {
        updatedProjects.push({
          ...project,
          hasKiroDir: kiroExists,
          isValid,
        });
        hasChanges = true;
      } else {
        updatedProjects.push(project);
      }
    }

    // 変更があった場合は設定を保存
    if (hasChanges) {
      const updatedConfig: AppConfig = {
        ...config,
        projects: updatedProjects,
      };
      await saveConfig(updatedConfig);
    }

    return updatedProjects;
  } catch (error) {
    if (error instanceof Error) {
      throw new ProjectError(
        `プロジェクト一覧の取得に失敗しました: ${error.message}`,
        'GET_ALL_FAILED',
        error
      );
    }

    throw new ProjectError('プロジェクト一覧の取得中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}

/**
 * 指定されたIDのプロジェクトを取得
 *
 * プロジェクト一覧から指定されたIDのプロジェクトを検索して返します。
 *
 * @param id - 取得するプロジェクトのID
 * @returns 指定されたIDのプロジェクト（見つからない場合はnull）
 * @throws {ProjectError} プロジェクトの取得に失敗した場合
 *
 * @example
 * ```typescript
 * try {
 *   const project = await getProjectById('project-id');
 *   if (project) {
 *     console.log('プロジェクトが見つかりました:', project.name);
 *   } else {
 *     console.log('プロジェクトが見つかりません');
 *   }
 * } catch (error) {
 *   console.error('取得に失敗:', error.message);
 * }
 * ```
 */
export async function getProjectById(id: string): Promise<ProjectInfo | null> {
  try {
    const config = await loadConfig();
    const project = config.projects.find(p => p.id === id);
    return project || null;
  } catch (error) {
    if (error instanceof Error) {
      throw new ProjectError(
        `プロジェクトの取得に失敗しました: ${error.message}`,
        'GET_PROJECT_FAILED',
        error
      );
    }

    throw new ProjectError('プロジェクトの取得中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}

/**
 * プロジェクトの選択
 *
 * 指定されたIDのプロジェクトを現在選択中のプロジェクトとして設定します。
 *
 * @param id - 選択するプロジェクトのID
 * @returns 選択されたプロジェクト情報
 * @throws {ProjectError} プロジェクトの選択に失敗した場合
 *
 * @example
 * ```typescript
 * try {
 *   const project = await setCurrentProject('project-id');
 *   console.log('プロジェクトを選択しました:', project.name);
 * } catch (error) {
 *   console.error('選択に失敗:', error.message);
 * }
 * ```
 */
export async function setCurrentProject(id: string): Promise<ProjectInfo> {
  try {
    // 現在の設定を読み込み
    const config = await loadConfig();

    // 指定されたIDのプロジェクトが存在するかチェック
    const project = config.projects.find(p => p.id === id);
    if (!project) {
      throw new ProjectError(
        `指定されたIDのプロジェクトが見つかりません: ${id}`,
        'PROJECT_NOT_FOUND'
      );
    }

    // プロジェクトが有効かチェック
    if (!project.isValid) {
      throw new ProjectError(
        `指定されたプロジェクトは無効です: ${project.name}`,
        'PROJECT_INVALID'
      );
    }

    // 最終アクセス日時を更新
    const now = new Date().toISOString();
    const updatedProject: ProjectInfo = {
      ...project,
      lastAccessedAt: now,
    };

    // プロジェクト一覧を更新
    const updatedProjects = config.projects.map(p => (p.id === id ? updatedProject : p));

    // 設定を更新
    const updatedConfig: AppConfig = {
      ...config,
      projects: updatedProjects,
      settings: {
        ...config.settings,
        lastSelectedProject: id,
      },
    };

    await saveConfig(updatedConfig);

    return updatedProject;
  } catch (error) {
    if (error instanceof ProjectError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ProjectError(
        `プロジェクトの選択に失敗しました: ${error.message}`,
        'SET_CURRENT_FAILED',
        error
      );
    }

    throw new ProjectError('プロジェクトの選択中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}
