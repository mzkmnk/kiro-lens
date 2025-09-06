import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ProjectInfo, AppConfig } from '@kiro-lens/shared';
import {
  validateProjectPath,
  addProject,
  removeProject,
  getAllProjects,
  getCurrentProject,
  setCurrentProject,
  ProjectError,
} from './projectService';
import * as configService from './configService';
import * as fileSystemService from './fileSystemService';

// モック設定
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid-123'),
}));

vi.mock('./configService');
vi.mock('./fileSystemService');

const mockConfigService = vi.mocked(configService);
const mockFileSystemService = vi.mocked(fileSystemService);

describe('ProjectService', () => {
  const mockConfig: AppConfig = {
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
      configPath: '/home/test/.kiro-lens/config.json',
    },
  };

  const mockProject: ProjectInfo = {
    id: 'test-project-id',
    name: 'test-project',
    path: '/absolute/path/to/project',
    kiroPath: '/absolute/path/to/project/.kiro',
    hasKiroDir: true,
    isValid: true,
    addedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('validateProjectPath', () => {
    test('有効なプロジェクトパスの場合は成功を返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue('/absolute/path/to/project');
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue({
        readable: true,
        writable: true,
        executable: true,
      });

      const result = await validateProjectPath('/absolute/path/to/project');

      expect(result.isValid).toBe(true);
      expect(result.validatedPath).toBe('/absolute/path/to/project');
      expect(result.error).toBeUndefined();
    });

    test('ディレクトリが存在しない場合はエラーを返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue('/absolute/path/to/nonexistent');
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(false);

      const result = await validateProjectPath('/absolute/path/to/nonexistent');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('指定されたディレクトリが存在しません');
    });

    test('.kiroディレクトリが存在しない場合はエラーを返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue('/absolute/path/to/project');
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(false);

      const result = await validateProjectPath('/absolute/path/to/project');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('.kiroディレクトリが存在しません');
    });

    test('読み取り権限がない場合はエラーを返す', async () => {
      mockFileSystemService.resolvePath.mockReturnValue('/absolute/path/to/project');
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue({
        readable: false,
        writable: true,
        executable: true,
      });

      const result = await validateProjectPath('/absolute/path/to/project');

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
      mockFileSystemService.resolvePath.mockReturnValue('/absolute/path/to/project');
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue({
        readable: true,
        writable: true,
        executable: true,
      });
      mockConfigService.loadConfig.mockResolvedValue(mockConfig);
      mockConfigService.saveConfig.mockResolvedValue();

      const result = await addProject('/absolute/path/to/project');

      expect(result.id).toBe('test-uuid-123');
      expect(result.name).toBe('project');
      expect(result.path).toBe('/absolute/path/to/project');
      expect(result.kiroPath).toBe('/absolute/path/to/project/.kiro');
      expect(result.hasKiroDir).toBe(true);
      expect(result.isValid).toBe(true);
      expect(mockConfigService.saveConfig).toHaveBeenCalled();
    });

    test('既に存在するパスの場合はエラーを投げる', async () => {
      const configWithProject: AppConfig = {
        ...mockConfig,
        projects: [mockProject],
      };

      mockFileSystemService.resolvePath.mockReturnValue('/absolute/path/to/project');
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);
      mockFileSystemService.checkDirectoryPermissions.mockResolvedValue({
        readable: true,
        writable: true,
        executable: true,
      });
      mockConfigService.loadConfig.mockResolvedValue(configWithProject);

      await expect(addProject('/absolute/path/to/project')).rejects.toThrow(ProjectError);
      await expect(addProject('/absolute/path/to/project')).rejects.toThrow(
        '既にプロジェクトとして登録されています'
      );
    });

    test('無効なパスの場合はエラーを投げる', async () => {
      mockFileSystemService.resolvePath.mockReturnValue('/absolute/path/to/invalid');
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(false);

      await expect(addProject('/absolute/path/to/invalid')).rejects.toThrow(ProjectError);
      await expect(addProject('/absolute/path/to/invalid')).rejects.toThrow(
        '指定されたディレクトリが存在しません'
      );
    });
  });

  describe('removeProject', () => {
    test('存在するプロジェクトを削除できる', async () => {
      const configWithProject: AppConfig = {
        ...mockConfig,
        projects: [mockProject],
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithProject);
      mockConfigService.saveConfig.mockResolvedValue();

      await removeProject('test-project-id');

      expect(mockConfigService.saveConfig).toHaveBeenCalledWith({
        ...configWithProject,
        projects: [],
      });
    });

    test('現在選択中のプロジェクトを削除した場合は選択を解除する', async () => {
      const configWithSelectedProject: AppConfig = {
        ...mockConfig,
        projects: [mockProject],
        settings: {
          ...mockConfig.settings,
          lastSelectedProject: 'test-project-id',
        },
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithSelectedProject);
      mockConfigService.saveConfig.mockResolvedValue();

      await removeProject('test-project-id');

      expect(mockConfigService.saveConfig).toHaveBeenCalledWith({
        ...configWithSelectedProject,
        projects: [],
        settings: {
          ...configWithSelectedProject.settings,
          lastSelectedProject: undefined,
        },
      });
    });

    test('存在しないプロジェクトIDの場合はエラーを投げる', async () => {
      mockConfigService.loadConfig.mockResolvedValue(mockConfig);

      await expect(removeProject('nonexistent-id')).rejects.toThrow(ProjectError);
      await expect(removeProject('nonexistent-id')).rejects.toThrow('プロジェクトが見つかりません');
    });
  });

  describe('getAllProjects', () => {
    test('全プロジェクトを取得できる', async () => {
      const configWithProjects: AppConfig = {
        ...mockConfig,
        projects: [mockProject],
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithProjects);
      mockFileSystemService.checkDirectoryExists.mockResolvedValue(true);
      mockFileSystemService.checkKiroDirectory.mockResolvedValue(true);

      const result = await getAllProjects();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockProject);
    });

    test('プロジェクトの有効性を確認して更新する', async () => {
      const invalidProject: ProjectInfo = {
        ...mockProject,
        isValid: true,
        hasKiroDir: true,
      };

      const configWithInvalidProject: AppConfig = {
        ...mockConfig,
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

  describe('getCurrentProject', () => {
    test('現在選択中のプロジェクトを取得できる', async () => {
      const configWithSelectedProject: AppConfig = {
        ...mockConfig,
        projects: [mockProject],
        settings: {
          ...mockConfig.settings,
          lastSelectedProject: 'test-project-id',
        },
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithSelectedProject);

      const result = await getCurrentProject();

      expect(result).toEqual(mockProject);
    });

    test('プロジェクトが選択されていない場合はnullを返す', async () => {
      mockConfigService.loadConfig.mockResolvedValue(mockConfig);

      const result = await getCurrentProject();

      expect(result).toBeNull();
    });

    test('選択されたプロジェクトが存在しない場合はnullを返す', async () => {
      const configWithInvalidSelection: AppConfig = {
        ...mockConfig,
        settings: {
          ...mockConfig.settings,
          lastSelectedProject: 'nonexistent-id',
        },
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithInvalidSelection);

      const result = await getCurrentProject();

      expect(result).toBeNull();
    });
  });

  describe('setCurrentProject', () => {
    test('有効なプロジェクトを選択できる', async () => {
      const configWithProject: AppConfig = {
        ...mockConfig,
        projects: [mockProject],
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithProject);
      mockConfigService.saveConfig.mockResolvedValue();

      const result = await setCurrentProject('test-project-id');

      expect(result.id).toBe('test-project-id');
      expect(result.lastAccessedAt).toBe('2024-01-01T00:00:00.000Z');
      expect(mockConfigService.saveConfig).toHaveBeenCalledWith({
        ...configWithProject,
        projects: [{ ...mockProject, lastAccessedAt: '2024-01-01T00:00:00.000Z' }],
        settings: {
          ...configWithProject.settings,
          lastSelectedProject: 'test-project-id',
        },
      });
    });

    test('存在しないプロジェクトIDの場合はエラーを投げる', async () => {
      mockConfigService.loadConfig.mockResolvedValue(mockConfig);

      await expect(setCurrentProject('nonexistent-id')).rejects.toThrow(ProjectError);
      await expect(setCurrentProject('nonexistent-id')).rejects.toThrow(
        'プロジェクトが見つかりません'
      );
    });

    test('無効なプロジェクトの場合はエラーを投げる', async () => {
      const invalidProject: ProjectInfo = {
        ...mockProject,
        isValid: false,
      };

      const configWithInvalidProject: AppConfig = {
        ...mockConfig,
        projects: [invalidProject],
      };

      mockConfigService.loadConfig.mockResolvedValue(configWithInvalidProject);

      await expect(setCurrentProject('test-project-id')).rejects.toThrow(ProjectError);
      await expect(setCurrentProject('test-project-id')).rejects.toThrow('プロジェクトは無効です');
    });
  });
});
