import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ProjectInfo, AppConfig } from '@kiro-lens/shared';
import {
  MOCK_DEFAULT_CONFIG,
  MOCK_PROJECT,
  MOCK_INVALID_PROJECT,
  MOCK_CONFIG_WITH_PROJECT,
  MOCK_CONFIG_WITH_SELECTED_PROJECT,
} from '@kiro-lens/shared';
import {
  validateProjectPath,
  addProject,
  removeProject,
  getAllProjects,
  setCurrentProject,
  ProjectError,
} from './projectService';
import * as configService from './configService';
import * as fileSystemService from './fileSystemService';
import { MOCK_DIRECTORY_PERMISSIONS, MOCK_UUID, MOCK_DATE, MOCK_PATHS } from '../test/constants';

// モック設定
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => MOCK_UUID),
}));

vi.mock('./configService');
vi.mock('./fileSystemService');

const mockConfigService = vi.mocked(configService);
const mockFileSystemService = vi.mocked(fileSystemService);

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_DATE));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('validateProjectPath', () => {
    test('有効なプロジェクトパスの場合は成功を返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue(MOCK_PATHS.VALID_ABSOLUTE);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue(
        MOCK_DIRECTORY_PERMISSIONS.FULL_ACCESS
      );

      const result = await validateProjectPath(MOCK_PATHS.VALID_ABSOLUTE);

      expect(result.isValid).toBe(true);
      expect(result.validatedPath).toBe(MOCK_PATHS.VALID_ABSOLUTE);
      expect(result.error).toBeUndefined();
    });

    test('ディレクトリが存在しない場合はエラーを返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue(MOCK_PATHS.NON_EXISTENT);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(false);

      const result = await validateProjectPath(MOCK_PATHS.NON_EXISTENT);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('指定されたディレクトリが存在しません');
    });

    test('.kiroディレクトリが存在しない場合はエラーを返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue(MOCK_PATHS.VALID_ABSOLUTE);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(false);

      const result = await validateProjectPath(MOCK_PATHS.VALID_ABSOLUTE);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('.kiroディレクトリが存在しません');
    });

    test('読み取り権限がない場合はエラーを返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue(MOCK_PATHS.VALID_ABSOLUTE);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue(
        MOCK_DIRECTORY_PERMISSIONS.NO_READ_ACCESS
      );

      const result = await validateProjectPath(MOCK_PATHS.VALID_ABSOLUTE);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('読み取り権限がありません');
    });

    test('パス解決でエラーが発生した場合はエラーを返す', async () => {
      mockFileSystemService.resolvePath.mockImplementation(() => {
        throw new Error('Invalid path format');
      });

      const result = await validateProjectPath('invalid-path');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid path format');
    });
  });

  describe('addProject', () => {
    test('有効なパスでプロジェクトを追加できる', async () => {
      mockFileSystemService.resolvePath.mockReturnValue(MOCK_PATHS.VALID_ABSOLUTE);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue(
        MOCK_DIRECTORY_PERMISSIONS.FULL_ACCESS
      );
      mockConfigService.loadConfig.mockResolvedValue(MOCK_DEFAULT_CONFIG);
      mockConfigService.saveConfig.mockResolvedValue();

      const result = await addProject(MOCK_PATHS.VALID_ABSOLUTE);

      expect(result.id).toBe(MOCK_UUID);
      expect(result.name).toBe('project');
      expect(result.path).toBe(MOCK_PATHS.VALID_ABSOLUTE);
      expect(result.kiroPath).toBe(`${MOCK_PATHS.VALID_ABSOLUTE}/.kiro`);
      expect(result.hasKiroDir).toBe(true);
      expect(result.isValid).toBe(true);
      expect(mockConfigService.saveConfig).toHaveBeenCalled();
    });

    test('既に存在するパスの場合はエラーを投げる', async () => {
      mockFileSystemService.resolvePath.mockReturnValue(MOCK_PATHS.VALID_ABSOLUTE);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue(
        MOCK_DIRECTORY_PERMISSIONS.FULL_ACCESS
      );
      mockConfigService.loadConfig.mockResolvedValue(MOCK_CONFIG_WITH_PROJECT);

      await expect(addProject(MOCK_PATHS.VALID_ABSOLUTE)).rejects.toThrow(ProjectError);
      await expect(addProject(MOCK_PATHS.VALID_ABSOLUTE)).rejects.toThrow(
        '既にプロジェクトとして登録されています'
      );
    });

    test('無効なパスの場合はエラーを投げる', async () => {
      mockFileSystemService.resolvePath.mockReturnValue(MOCK_PATHS.NON_EXISTENT);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(false);

      await expect(addProject(MOCK_PATHS.NON_EXISTENT)).rejects.toThrow(ProjectError);
      await expect(addProject(MOCK_PATHS.NON_EXISTENT)).rejects.toThrow(
        '指定されたディレクトリが存在しません'
      );
    });
  });

  describe('removeProject', () => {
    test('存在するプロジェクトを削除できる', async () => {
      mockConfigService.loadConfig.mockResolvedValue(MOCK_CONFIG_WITH_PROJECT);
      mockConfigService.saveConfig.mockResolvedValue();

      await removeProject(MOCK_PROJECT.id);

      expect(mockConfigService.saveConfig).toHaveBeenCalledWith({
        ...MOCK_CONFIG_WITH_PROJECT,
        projects: [],
      });
    });

    test('現在選択中のプロジェクトを削除した場合は選択を解除する', async () => {
      mockConfigService.loadConfig.mockResolvedValue(MOCK_CONFIG_WITH_SELECTED_PROJECT);
      mockConfigService.saveConfig.mockResolvedValue();

      await removeProject(MOCK_PROJECT.id);

      expect(mockConfigService.saveConfig).toHaveBeenCalledWith({
        ...MOCK_CONFIG_WITH_SELECTED_PROJECT,
        projects: [],
        settings: {
          ...MOCK_CONFIG_WITH_SELECTED_PROJECT.settings,
          lastSelectedProject: undefined,
        },
      });
    });

    test('存在しないプロジェクトIDの場合はエラーを投げる', async () => {
      mockConfigService.loadConfig.mockResolvedValue(MOCK_DEFAULT_CONFIG);

      await expect(removeProject('nonexistent-id')).rejects.toThrow(ProjectError);
      await expect(removeProject('nonexistent-id')).rejects.toThrow('プロジェクトが見つかりません');
    });
  });

  describe('getAllProjects', () => {
    test('全プロジェクトを取得できる', async () => {
      mockConfigService.loadConfig.mockResolvedValue(MOCK_CONFIG_WITH_PROJECT);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);

      const result = await getAllProjects();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(MOCK_PROJECT);
    });

    test('プロジェクトの有効性を確認して更新する', async () => {
      const invalidProject: ProjectInfo = {
        ...MOCK_PROJECT,
        isValid: true,
        hasKiroDir: true,
      };

      const configWithInvalidProject: AppConfig = {
        ...MOCK_DEFAULT_CONFIG,
        projects: [invalidProject],
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithInvalidProject);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(false);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(false);
      mockConfigService.saveConfig.mockResolvedValue();

      const result = await getAllProjects();

      expect(result[0].isValid).toBe(false);
      expect(result[0].hasKiroDir).toBe(false);
      expect(mockConfigService.saveConfig).toHaveBeenCalled();
    });
  });

  describe('setCurrentProject', () => {
    test('有効なプロジェクトを選択できる', async () => {
      mockConfigService.loadConfig.mockResolvedValue(MOCK_CONFIG_WITH_PROJECT);
      mockConfigService.saveConfig.mockResolvedValue();

      const result = await setCurrentProject(MOCK_PROJECT.id);

      expect(result.id).toBe(MOCK_PROJECT.id);
      expect(result.lastAccessedAt).toBe(MOCK_DATE);
      expect(mockConfigService.saveConfig).toHaveBeenCalledWith({
        ...MOCK_CONFIG_WITH_PROJECT,
        projects: [{ ...MOCK_PROJECT, lastAccessedAt: MOCK_DATE }],
        settings: {
          ...MOCK_CONFIG_WITH_PROJECT.settings,
          lastSelectedProject: MOCK_PROJECT.id,
        },
      });
    });

    test('存在しないプロジェクトIDの場合はエラーを投げる', async () => {
      mockConfigService.loadConfig.mockResolvedValue(MOCK_DEFAULT_CONFIG);

      await expect(setCurrentProject('nonexistent-id')).rejects.toThrow(ProjectError);
      await expect(setCurrentProject('nonexistent-id')).rejects.toThrow(
        'プロジェクトが見つかりません'
      );
    });

    test('無効なプロジェクトの場合はエラーを投げる', async () => {
      const configWithInvalidProject: AppConfig = {
        ...MOCK_DEFAULT_CONFIG,
        projects: [MOCK_INVALID_PROJECT],
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithInvalidProject);

      await expect(setCurrentProject(MOCK_INVALID_PROJECT.id)).rejects.toThrow(ProjectError);
      await expect(setCurrentProject(MOCK_INVALID_PROJECT.id)).rejects.toThrow(
        'プロジェクトは無効です'
      );
    });
  });
});
