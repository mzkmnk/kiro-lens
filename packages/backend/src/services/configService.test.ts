import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { AppConfig } from '@kiro-lens/shared';
import {
  loadConfig,
  saveConfig,
  resetConfig,
  validateConfig,
  getConfigPath,
  ensureConfigDirectory,
  ConfigError,
} from './configService';

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
      mockFs.access.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockResolvedValue(undefined);

      await ensureConfigDirectory();

      expect(mockFs.mkdir).toHaveBeenCalledWith(join('/home/test', '.kiro-lens'), {
        recursive: true,
      });
    });

    test('設定ディレクトリが既に存在する場合は何もしない', async () => {
      mockFs.access.mockResolvedValue(undefined);

      await ensureConfigDirectory();

      expect(mockFs.mkdir).not.toHaveBeenCalled();
    });

    test('ディレクトリ作成に失敗した場合はConfigErrorを投げる', async () => {
      mockFs.access.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(ensureConfigDirectory()).rejects.toThrow(ConfigError);
      await expect(ensureConfigDirectory()).rejects.toThrow('設定ディレクトリの作成に失敗しました');
    });
  });

  describe('validateConfig', () => {
    test('有効な設定オブジェクトの場合はそのまま返す', () => {
      const validConfig: AppConfig = {
        version: '1.0.0',
        projects: [],
        settings: {
          theme: 'system',
          autoSave: true,
          maxRecentProjects: 10,
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
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
        version: '1.0.0',
        projects: [],
        settings: {
          theme: 'dark',
          autoSave: false,
          maxRecentProjects: 5,
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify(configData));

      const result = await loadConfig();

      expect(mockFs.readFile).toHaveBeenCalledWith(testConfigPath, 'utf-8');
      expect(result.settings.theme).toBe('dark');
      expect(result.settings.autoSave).toBe(false);
    });

    test('設定ファイルが存在しない場合はデフォルト設定を作成して返す', async () => {
      mockFs.access.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.chmod.mockResolvedValue(undefined);

      const result = await loadConfig();

      expect(result.version).toBe('1.0.0');
      expect(result.projects).toEqual([]);
      expect(result.settings.theme).toBe('system');
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.chmod).toHaveBeenCalledWith(testConfigPath, 0o600);
    });

    test('設定ファイルが破損している場合はデフォルト設定を返す', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue('invalid json');
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.chmod.mockResolvedValue(undefined);

      const result = await loadConfig();

      expect(result.version).toBe('1.0.0');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('saveConfig', () => {
    test('設定を正しくファイルに保存する', async () => {
      const config: AppConfig = {
        version: '1.0.0',
        projects: [],
        settings: {
          theme: 'light',
          autoSave: true,
          maxRecentProjects: 15,
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.chmod.mockResolvedValue(undefined);

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
        version: '1.0.0',
        projects: [],
        settings: {
          theme: 'system',
          autoSave: true,
          maxRecentProjects: 10,
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockRejectedValue(new Error('ENOENT'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.chmod.mockResolvedValue(undefined);

      await saveConfig(config);

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.chmod).toHaveBeenCalledWith(testConfigPath, 0o600);
    });

    test('ファイル書き込みに失敗した場合はConfigErrorを投げる', async () => {
      const config: AppConfig = {
        version: '1.0.0',
        projects: [],
        settings: {
          theme: 'system',
          autoSave: true,
          maxRecentProjects: 10,
        },
        metadata: {
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          configPath: testConfigPath,
        },
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(saveConfig(config)).rejects.toThrow(ConfigError);
      await expect(saveConfig(config)).rejects.toThrow('設定ファイルの保存に失敗しました');
    });
  });

  describe('resetConfig', () => {
    test('設定をデフォルト値にリセットする', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.chmod.mockResolvedValue(undefined);

      const result = await resetConfig();

      expect(result.version).toBe('1.0.0');
      expect(result.projects).toEqual([]);
      expect(result.settings.theme).toBe('system');
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(mockFs.chmod).toHaveBeenCalledWith(testConfigPath, 0o600);
    });
  });
});
