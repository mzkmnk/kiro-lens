import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ProjectApiService, FileTreeApiService } from './projectApiService';
import { TypedApiClient, ApiClientError } from './typedApiClient';
import type { ProjectInfo, FileItem, ValidationResult } from '@kiro-lens/shared/types/generated';

// TypedApiClientをモック
vi.mock('./typedApiClient', () => ({
  TypedApiClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
  ApiClientError: class MockApiClientError extends Error {
    constructor(
      message: string,
      public type: string,
      public statusCode?: number
    ) {
      super(message);
      this.name = 'ApiClientError';
    }
  },
}));

describe('ProjectApiService', () => {
  let service: ProjectApiService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    service = new ProjectApiService(mockApiClient);

    // TypedApiClient.extractDataをモック
    (TypedApiClient as any).extractData = vi.fn(response => {
      if (response.success) {
        return response.data;
      }
      throw new ApiClientError(
        response.error?.message || 'API Error',
        response.error?.type || 'INTERNAL_ERROR'
      );
    });
  });

  describe('getProjects', () => {
    test('プロジェクト一覧を正しく取得する', async () => {
      const mockProjects: ProjectInfo[] = [
        {
          id: 'project-1',
          name: 'Test Project 1',
          path: '/path/to/project1',
          kiroPath: '/path/to/project1/.kiro',
          hasKiroDir: true,
          isValid: true,
          addedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const mockResponse = {
        success: true,
        data: {
          projects: mockProjects,
          currentProject: mockProjects[0],
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getProjects();

      expect(mockApiClient.get).toHaveBeenCalledWith('projects');
      expect(result.projects).toEqual(mockProjects);
      expect(result.currentProject).toEqual(mockProjects[0]);
    });
  });

  describe('addProject', () => {
    test('プロジェクトを正しく追加する', async () => {
      const mockProject: ProjectInfo = {
        id: 'new-project',
        name: 'New Project',
        path: '/path/to/new-project',
        kiroPath: '/path/to/new-project/.kiro',
        hasKiroDir: true,
        isValid: true,
        addedAt: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse = {
        success: true,
        data: {
          project: mockProject,
          message: 'Project added successfully',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.addProject('/path/to/new-project');

      expect(mockApiClient.post).toHaveBeenCalledWith('projects', {
        path: '/path/to/new-project',
      });
      expect(result.project).toEqual(mockProject);
      expect(result.message).toBe('Project added successfully');
    });
  });

  describe('deleteProject', () => {
    test('プロジェクトを正しく削除する', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'Project deleted successfully',
        },
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteProject('project-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('projects/project-1');
      expect(result.message).toBe('Project deleted successfully');
    });
  });

  describe('selectProject', () => {
    test('プロジェクトを正しく選択する', async () => {
      const mockProject: ProjectInfo = {
        id: 'selected-project',
        name: 'Selected Project',
        path: '/path/to/selected',
        kiroPath: '/path/to/selected/.kiro',
        hasKiroDir: true,
        isValid: true,
        addedAt: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse = {
        success: true,
        data: {
          project: mockProject,
          message: 'Project selected successfully',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.selectProject('selected-project');

      expect(mockApiClient.post).toHaveBeenCalledWith('projects/selected-project/select', {});
      expect(result.project).toEqual(mockProject);
      expect(result.message).toBe('Project selected successfully');
    });
  });

  describe('validatePath', () => {
    test('有効なパスの検証結果を返す', async () => {
      const mockValidationResult: ValidationResult = {
        isValid: true,
        validatedPath: '/path/to/valid/project',
      };

      const mockResponse = {
        success: true,
        data: mockValidationResult,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.validatePath('/path/to/valid/project');

      expect(mockApiClient.post).toHaveBeenCalledWith('projects/validate-path', {
        path: '/path/to/valid/project',
      });
      expect(result).toEqual(mockValidationResult);
    });

    test('無効なパスの検証結果を返す', async () => {
      const mockValidationResult: ValidationResult = {
        isValid: false,
        error: 'Directory not found',
      };

      const mockResponse = {
        success: true,
        data: mockValidationResult,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.validatePath('/invalid/path');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Directory not found');
    });
  });

  describe('getProjectFiles', () => {
    test('プロジェクトファイルツリーを正しく取得する', async () => {
      const mockFiles: FileItem[] = [
        {
          id: 'file-1',
          name: 'README.md',
          type: 'file',
        },
        {
          id: 'folder-1',
          name: 'src',
          type: 'folder',
          children: [],
        },
      ];

      const mockResponse = {
        success: true,
        data: {
          files: mockFiles,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getProjectFiles('project-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('projects/project-1/files');
      expect(result).toEqual(mockFiles);
    });
  });
});

describe('FileTreeApiService', () => {
  let service: FileTreeApiService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    service = new FileTreeApiService(mockApiClient);

    // TypedApiClient.extractDataをモック
    (TypedApiClient as any).extractData = vi.fn(response => {
      if (response.success) {
        return response.data;
      }
      throw new ApiClientError(
        response.error?.message || 'API Error',
        response.error?.type || 'INTERNAL_ERROR'
      );
    });
  });

  describe('getProjectFiles', () => {
    test('プロジェクトファイルツリーを正しく取得する', async () => {
      const mockFiles: FileItem[] = [
        {
          id: 'file-1',
          name: 'config.json',
          type: 'file',
        },
      ];

      const mockResponse = {
        success: true,
        data: {
          files: mockFiles,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getProjectFiles('project-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('projects/project-1/files');
      expect(result).toEqual(mockFiles);
    });
  });

  describe('createFile', () => {
    test('ファイルを正しく作成する', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'File created successfully',
          file: {
            id: 'new-file',
            name: 'new-file.txt',
            type: 'file',
          },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await service.createFile('project-1', 'new-file.txt', 'Hello World');

      expect(mockApiClient.post).toHaveBeenCalledWith('projects/project-1/files', {
        path: 'new-file.txt',
        content: 'Hello World',
        encoding: 'utf8',
      });
      expect(result.message).toBe('File created successfully');
    });
  });

  describe('updateFileContent', () => {
    test('ファイル内容を正しく更新する', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'File updated successfully',
          lastModified: '2024-01-01T12:00:00.000Z',
        },
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await service.updateFileContent('project-1', 'file.txt', 'Updated content');

      expect(mockApiClient.put).toHaveBeenCalledWith('projects/project-1/files/file.txt', {
        content: 'Updated content',
        encoding: 'utf8',
      });
      expect(result.message).toBe('File updated successfully');
    });
  });

  describe('deleteFile', () => {
    test('ファイルを正しく削除する', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'File deleted successfully',
        },
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteFile('project-1', 'file.txt');

      expect(mockApiClient.delete).toHaveBeenCalledWith('projects/project-1/files/file.txt');
      expect(result.message).toBe('File deleted successfully');
    });
  });
});
