import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { AppConfig } from '@kiro-lens/shared';
import { MOCK_DEFAULT_CONFIG, MOCK_CUSTOM_CONFIG } from '@kiro-lens/shared';
import {
  loadConfig,
  saveConfig,
  resetConfig,
  validateConfig,
  getConfigPath,
  ensureConfigDirectory,
  ConfigError,
} from './configService';
import { MOCK_FS_SUCCESS, MOCK_FS_ERRORS } from '../test/constants';

// モック設定
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    access: vi.fn(),
    chmod: vi.fn(),
  },
}));

vi.mock('os', () => ({
  homedir: vi.fn(() => '/home/test'),
}));

const mockFs = vi.mocked(fs);

describe('ConfigService', () => {
  const testConfigPath = join('/home/test', '.kiro-lens', 'config.json');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getConfigPath', () => {
    test('ユーザーホームディレクトリの.kiro-lens/config.jsonパスを返す', () => {
      const path = getConfigPath();
      expect(path).toBe(testConfigPath);
    });
  });

  describe('ensureConfigDirectory', () => {
    test('設定ディレクトリが存在しない場合は作成する', async () => {
      mockFs.access.mockRejectedValue(MOCK_FS_ERRORS.ENOENT);
      mockFs.mkdir.mockResolvedValue(MOCK_FS_SUCCESS.MKDIR_SUCCESS);

      await ensureConfigDirectory();

      expect(mockFs.mkdir).toHaveBeenCalledWith(join('/home/test', '.kiro-lens'), {
        recursive: true,
      });
    });

    test('設定ディレクトリが既に存在する場合は何もしない', async () => {
      mockFs.access.mockResolvedValue(MOCK_FS_SUCCESS.ACCESS_SUCCESS);

      await ensureConfigDirectory();

      expect(mockFs.mkdir).not.toHaveBeenCalled();
    });

    test('ディレクトリ作成に失敗した場合はConfigErrorを投げる', async () => {
      mockFs.access.mockRejectedValue(MOCK_FS_ERRORS.ENOENT);
      mockFs.mkdir.mockRejectedValue(MOCK_FS_ERRORS.PERMISSION_DENIED);

      await expect(ensureConfigDirectory()).rejects.toThrow(ConfigError);
      await expect(ensureConfigDirectory()).rejects.toThrow('設定ディレクトリの作成に失敗しました');
    });
  });

  describe('validateConfig', () => {
    test('有効な設定オブジェクトの場合はそのまま返す', () => {
      const validConfig: AppConfig = {
        ...MOCK_DEFAULT_CONFIG,
        metadata: {
          ...MOCK_DEFAULT_CONFIG.metadata,
          configPath: testConfigPath,
        },
      };

      const result = validateConfig(validConfig);
      expect(result).toEqual(validConfig);
    });

    test('無効な設定オブジェクトの場合はデフォルト設定を返す', () => {
      const invalidConfig = { invalid: 'data' };

      const result = validateConfig(invalidConfig);

      expect(result.version).toBe('1.0.0');
      expect(result.projects).toEqual([]);
      expect(result.settings.theme).toBe('system');
      expect(result.settings.autoSave).toBe(true);
      expect(result.settings.maxRecentProjects).toBe(10);
    });

    test('nullまたはundefinedの場合はデフォルト設定を返す', () => {
      const result1 = validateConfig(null);
      const result2 = validateConfig(undefined);

      expect(result1.version).toBe('1.0.0');
      expect(result2.version).toBe('1.0.0');
    });
  });

  describe('loadConfig', () => {
    test('設定ファイルが存在する場合は読み込んで返す', async () => {
      const configData = {
        ...MOCK_CUSTOM_CONFIG,
        metadata: {
          ...MOCK_CUSTOM_CONFIG.metadata,
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockResolvedValue(MOCK_FS_SUCCESS.ACCESS_SUCCESS);
      mockFs.readFile.mockResolvedValue(JSON.stringify(configData));

      const result = await loadConfig();

      expect(mockFs.readFile).toHaveBeenCalledWith(testConfigPath, 'utf-8');
      expect(result.settings.theme).toBe('dark');
      expect(result.settings.autoSave).toBe(false);
    });

    test('設定ファイルが存在しない場合はデフォルト設定を作成して返す', async () => {
      mockFs.access.mockRejectedValue(MOCK_FS_ERRORS.ENOENT);
      mockFs.mkdir.mockResolvedValue(MOCK_FS_SUCCESS.MKDIR_SUCCESS);
      mockFs.writeFile.mockResolvedValue(MOCK_FS_SUCCESS.WRITE_FILE_SUCCESS);
      mockFs.chmod.mockResolvedValue(MOCK_FS_SUCCESS.CHMOD_SUCCESS);

      const result = await loadConfig();

      expect(result.version).toBe('1.0.0');
      expect(result.projects).toEqual([]);
      expect(result.settings.theme).toBe('system');
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.chmod).toHaveBeenCalledWith(testConfigPath, 0o600);
    });

    test('設定ファイルが破損している場合はデフォルト設定を返す', async () => {
      mockFs.access.mockResolvedValue(MOCK_FS_SUCCESS.ACCESS_SUCCESS);
      mockFs.readFile.mockResolvedValue(MOCK_FS_ERRORS.INVALID_JSON);
      mockFs.writeFile.mockResolvedValue(MOCK_FS_SUCCESS.WRITE_FILE_SUCCESS);
      mockFs.chmod.mockResolvedValue(MOCK_FS_SUCCESS.CHMOD_SUCCESS);

      const result = await loadConfig();

      expect(result.version).toBe('1.0.0');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('saveConfig', () => {
    test('設定を正しくファイルに保存する', async () => {
      const config: AppConfig = {
        ...MOCK_DEFAULT_CONFIG,
        settings: {
          ...MOCK_DEFAULT_CONFIG.settings,
          theme: 'light',
          maxRecentProjects: 15,
        },
        metadata: {
          ...MOCK_DEFAULT_CONFIG.metadata,
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockResolvedValue(MOCK_FS_SUCCESS.ACCESS_SUCCESS);
      mockFs.writeFile.mockResolvedValue(MOCK_FS_SUCCESS.WRITE_FILE_SUCCESS);
      mockFs.chmod.mockResolvedValue(MOCK_FS_SUCCESS.CHMOD_SUCCESS);

      await saveConfig(config);

      const writeCall = mockFs.writeFile.mock.calls[0];
      expect(writeCall[0]).toBe(testConfigPath);
      expect(writeCall[2]).toBe('utf-8');

      const savedConfig = JSON.parse(writeCall[1] as string);
      expect(savedConfig.settings.theme).toBe('light');
      expect(savedConfig.settings.autoSave).toBe(true);
      expect(savedConfig.settings.maxRecentProjects).toBe(15);
      expect(mockFs.chmod).toHaveBeenCalledWith(testConfigPath, 0o600);
    });

    test('設定ディレクトリが存在しない場合は作成してから保存する', async () => {
      const config: AppConfig = {
        ...MOCK_DEFAULT_CONFIG,
        metadata: {
          ...MOCK_DEFAULT_CONFIG.metadata,
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockRejectedValue(MOCK_FS_ERRORS.ENOENT);
      mockFs.mkdir.mockResolvedValue(MOCK_FS_SUCCESS.MKDIR_SUCCESS);
      mockFs.writeFile.mockResolvedValue(MOCK_FS_SUCCESS.WRITE_FILE_SUCCESS);
      mockFs.chmod.mockResolvedValue(MOCK_FS_SUCCESS.CHMOD_SUCCESS);

      await saveConfig(config);

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.chmod).toHaveBeenCalledWith(testConfigPath, 0o600);
    });

    test('ファイル書き込みに失敗した場合はConfigErrorを投げる', async () => {
      const config: AppConfig = {
        ...MOCK_DEFAULT_CONFIG,
        metadata: {
          ...MOCK_DEFAULT_CONFIG.metadata,
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockResolvedValue(MOCK_FS_SUCCESS.ACCESS_SUCCESS);
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(saveConfig(config)).rejects.toThrow(ConfigError);
      await expect(saveConfig(config)).rejects.toThrow('設定ファイルの保存に失敗しました');
    });
  });

  describe('resetConfig', () => {
    test('設定をデフォルト値にリセットする', async () => {
      mockFs.access.mockResolvedValue(MOCK_FS_SUCCESS.ACCESS_SUCCESS);
      mockFs.writeFile.mockResolvedValue(MOCK_FS_SUCCESS.WRITE_FILE_SUCCESS);
      mockFs.chmod.mockResolvedValue(MOCK_FS_SUCCESS.CHMOD_SUCCESS);

      const result = await resetConfig();

      expect(result.version).toBe('1.0.0');
      expect(result.projects).toEqual([]);
      expect(result.settings.theme).toBe('system');
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.chmod).toHaveBeenCalledWith(testConfigPath, 0o600);
    });
  });
});
