import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { AppConfig } from '@kiro-lens/shared';

/**
 * 設定管理エラー
 */
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * 設定ファイルのパスを取得
 *
 * @returns 設定ファイルの絶対パス
 */
export function getConfigPath(): string {
  return join(homedir(), '.kiro-lens', 'config.json');
}

/**
 * 設定ディレクトリの存在確認と作成
 *
 * ユーザーホームディレクトリに.kiro-lensフォルダが存在しない場合は作成します。
 *
 * @throws {ConfigError} ディレクトリの作成に失敗した場合
 */
export async function ensureConfigDirectory(): Promise<void> {
  const configDir = join(homedir(), '.kiro-lens');

  try {
    await fs.access(configDir);
  } catch (_accessError) {
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (mkdirError) {
      if (mkdirError instanceof Error) {
        throw new ConfigError(
          `設定ディレクトリの作成に失敗しました: ${mkdirError.message}`,
          'MKDIR_FAILED',
          mkdirError
        );
      }
      throw new ConfigError(
        '設定ディレクトリの作成中に不明なエラーが発生しました',
        'UNKNOWN_ERROR'
      );
    }
  }
}

/**
 * デフォルト設定を作成
 *
 * @returns デフォルトのAppConfig
 */
function createDefaultConfig(): AppConfig {
  const now = new Date().toISOString();
  const configPath = getConfigPath();

  return {
    version: '1.0.0',
    projects: [],
    settings: {
      theme: 'system',
      autoSave: true,
      maxRecentProjects: 10,
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      configPath,
    },
  };
}

/**
 * 設定オブジェクトのバリデーション
 *
 * @param config - 検証する設定オブジェクト
 * @returns 有効な設定オブジェクト
 */
export function validateConfig(config: unknown): AppConfig {
  if (!config || typeof config !== 'object') {
    return createDefaultConfig();
  }

  const configObj = config as Record<string, unknown>;

  // 基本的な構造チェック
  if (
    typeof configObj.version !== 'string' ||
    !Array.isArray(configObj.projects) ||
    !configObj.settings ||
    typeof configObj.settings !== 'object' ||
    !configObj.metadata ||
    typeof configObj.metadata !== 'object'
  ) {
    return createDefaultConfig();
  }

  const settings = configObj.settings as Record<string, unknown>;
  const metadata = configObj.metadata as Record<string, unknown>;

  // 設定項目の詳細チェック
  if (
    !['light', 'dark', 'system'].includes(settings.theme as string) ||
    typeof settings.autoSave !== 'boolean' ||
    typeof settings.maxRecentProjects !== 'number' ||
    typeof metadata.createdAt !== 'string' ||
    typeof metadata.updatedAt !== 'string' ||
    typeof metadata.configPath !== 'string'
  ) {
    return createDefaultConfig();
  }

  return config as AppConfig;
}

/**
 * 設定ファイルの読み込み
 *
 * 設定ファイルが存在しない場合や破損している場合は、
 * デフォルト設定を作成して保存します。
 *
 * @returns 読み込まれた設定
 * @throws {ConfigError} 設定ファイルの読み込みに失敗した場合
 */
export async function loadConfig(): Promise<AppConfig> {
  const configPath = getConfigPath();

  try {
    await fs.access(configPath);
    const configData = await fs.readFile(configPath, 'utf-8');
    const parsedConfig = JSON.parse(configData);
    return validateConfig(parsedConfig);
  } catch (error) {
    if (error instanceof Error) {
      // ファイルが存在しない場合
      if ('code' in error && error.code === 'ENOENT') {
        console.log('設定ファイルが存在しないため、デフォルト設定を作成します');
        const defaultConfig = createDefaultConfig();
        await saveConfig(defaultConfig);
        return defaultConfig;
      }

      // JSONパースエラーの場合
      if (error instanceof SyntaxError) {
        console.warn('設定ファイルが破損しているため、デフォルト設定で復旧します');
        const defaultConfig = createDefaultConfig();
        await saveConfig(defaultConfig);
        return defaultConfig;
      }

      // その他のエラー
      console.error('設定ファイルの読み込み中にエラーが発生しました:', error.message);
    }

    // フォールバック: デフォルト設定を作成
    const defaultConfig = createDefaultConfig();
    await saveConfig(defaultConfig);
    return defaultConfig;
  }
}

/**
 * 設定ファイルの保存
 *
 * 設定をJSONファイルとして保存し、適切な権限（600）を設定します。
 *
 * @param config - 保存する設定
 * @throws {ConfigError} 設定ファイルの保存に失敗した場合
 */
export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    await ensureConfigDirectory();

    const configPath = getConfigPath();
    const updatedConfig: AppConfig = {
      ...config,
      metadata: {
        ...config.metadata,
        updatedAt: new Date().toISOString(),
        configPath,
      },
    };

    const configJson = JSON.stringify(updatedConfig, null, 2);
    await fs.writeFile(configPath, configJson, 'utf-8');

    // ファイル権限を600（所有者のみ読み書き可能）に設定
    await fs.chmod(configPath, 0o600);
  } catch (error) {
    if (error instanceof Error) {
      throw new ConfigError(
        `設定ファイルの保存に失敗しました: ${error.message}`,
        'SAVE_FAILED',
        error
      );
    }
    throw new ConfigError('設定ファイルの保存中に不明なエラーが発生しました', 'UNKNOWN_ERROR');
  }
}

/**
 * 設定のリセット
 *
 * 設定をデフォルト値にリセットして保存します。
 *
 * @returns リセットされた設定
 */
export async function resetConfig(): Promise<AppConfig> {
  const defaultConfig = createDefaultConfig();
  await saveConfig(defaultConfig);
  return defaultConfig;
}
