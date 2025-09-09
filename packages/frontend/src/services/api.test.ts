import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './api';
import type {
  AddProjectResponse,
  ProjectListResponse,
  ValidationResult,
  ProjectInfo,
  ApiResponse,
  FileTreeResponse,
  FileItem,
} from '@kiro-lens/shared';

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    apiClient = new ApiClient();
    // fetchのモックを作成
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  describe('GETメソッド', () => {
    test('レスポンスがokでない場合はエラーをスローする', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiClient.get('/not-found')).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('POSTメソッド', () => {
    test('正常なレスポンスを返す', async () => {
      const mockResponse = { success: true };
      const requestData = { name: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.post('/create', requestData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('PUTメソッド', () => {
    test('正常なレスポンスを返す', async () => {
      const mockResponse = { updated: true };
      const requestData = { id: 1, name: 'updated' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.put('/update/1', requestData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETEメソッド', () => {
    test('正常なレスポンスを返す', async () => {
      const mockResponse = { deleted: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.delete('/delete/1');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('エラーハンドリング', () => {
    test('ネットワークエラーを適切に処理する', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });

    test('JSON解析エラーを適切に処理する', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('環境変数設定', () => {
    test('環境変数またはフォールバック値が使用される', () => {
      // 環境変数が設定されているか、フォールバック値が使用されることを確認
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      expect(baseUrl).toBe('http://localhost:3001');
    });

    test('ApiClientが正常にインスタンス化される', () => {
      const client = new ApiClient();
      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('プロジェクト管理API', () => {
    describe('addProject', () => {
      test('プロジェクト追加が成功する', async () => {
        const mockProject: ProjectInfo = {
          id: 'test-id',
          name: 'test-project',
          path: '/path/to/project',
          kiroPath: '/path/to/project/.kiro',
          hasKiroDir: true,
          isValid: true,
          addedAt: '2024-01-01T00:00:00.000Z',
        };
        const mockResponse: ApiResponse<AddProjectResponse> = {
          success: true,
          data: {
            project: mockProject,
            message: 'プロジェクトを追加しました',
          },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.addProject('/path/to/project');

        expect(result).toEqual(mockResponse.data);
      });

      test('APIエラーレスポンスの場合はエラーをスローする', async () => {
        const mockErrorResponse: ApiResponse<never> = {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'パスが無効です',
            timestamp: new Date(),
          },
        };
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: () => Promise.resolve(mockErrorResponse),
        });

        await expect(apiClient.addProject('/invalid/path')).rejects.toThrow(
          'HTTP error! status: 400'
        );
      });
    });

    describe('removeProject', () => {
      test('プロジェクト削除が成功する', async () => {
        const mockResponse: ApiResponse<{ message: string }> = {
          success: true,
          data: { message: 'プロジェクトを削除しました' },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.removeProject('test-id');

        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getProjects', () => {
      test('プロジェクト一覧取得が成功する', async () => {
        const mockProjects: ProjectInfo[] = [
          {
            id: 'project-1',
            name: 'project-1',
            path: '/path/to/project1',
            kiroPath: '/path/to/project1/.kiro',
            hasKiroDir: true,
            isValid: true,
            addedAt: '2024-01-01T00:00:00.000Z',
          },
        ];
        const mockResponse: ApiResponse<ProjectListResponse> = {
          success: true,
          data: {
            projects: mockProjects,
            currentProject: mockProjects[0],
          },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.getProjects();

        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('validatePath', () => {
      test('パス検証が成功する', async () => {
        const mockResponse: ApiResponse<ValidationResult> = {
          success: true,
          data: {
            isValid: true,
            validatedPath: '/path/to/project',
          },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.validatePath('/path/to/project');

        expect(result).toEqual(mockResponse.data);
      });

      test('パス検証が失敗する', async () => {
        const mockResponse: ApiResponse<ValidationResult> = {
          success: true,
          data: {
            isValid: false,
            error: '.kiroディレクトリが存在しません',
          },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.validatePath('/invalid/path');

        expect(result).toEqual(mockResponse.data);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('.kiroディレクトリが存在しません');
      });
    });

    describe('selectProject', () => {
      test('プロジェクト選択が成功する', async () => {
        const mockProject: ProjectInfo = {
          id: 'test-id',
          name: 'test-project',
          path: '/path/to/project',
          kiroPath: '/path/to/project/.kiro',
          hasKiroDir: true,
          isValid: true,
          addedAt: '2024-01-01T00:00:00.000Z',
          lastAccessedAt: '2024-01-01T01:00:00.000Z',
        };
        const mockResponse: ApiResponse<{ project: ProjectInfo; message: string }> = {
          success: true,
          data: {
            project: mockProject,
            message: 'プロジェクトを選択しました',
          },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.selectProject('test-id');

        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('ファイルツリーAPI', () => {
    describe('getProjectFiles', () => {
      test('プロジェクトのファイルツリー取得が成功する', async () => {
        const mockFiles: FileItem[] = [
          {
            id: 'specs',
            name: 'specs',
            type: 'folder',
            children: [
              {
                id: 'specs/feature1.md',
                name: 'feature1.md',
                type: 'file',
              },
            ],
          },
          {
            id: 'steering',
            name: 'steering',
            type: 'folder',
            children: [
              {
                id: 'steering/guidelines.md',
                name: 'guidelines.md',
                type: 'file',
              },
            ],
          },
        ];
        const mockResponse: ApiResponse<FileTreeResponse> = {
          success: true,
          data: {
            files: mockFiles,
          },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.getProjectFiles('test-project-id');

        expect(result).toEqual(mockResponse.data);
        expect(result.files).toHaveLength(2);
        expect(result.files[0].type).toBe('folder');
        expect(result.files[0].children).toHaveLength(1);
      });

      test('プロジェクトが存在しない場合はエラーをスローする', async () => {
        const mockErrorResponse: ApiResponse<never> = {
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: 'プロジェクトが見つかりません',
            timestamp: new Date(),
          },
        };
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: () => Promise.resolve(mockErrorResponse),
        });

        await expect(apiClient.getProjectFiles('non-existent-id')).rejects.toThrow(
          'HTTP error! status: 404'
        );
      });

      test('.kiroディレクトリが存在しない場合はエラーをスローする', async () => {
        const mockErrorResponse: ApiResponse<never> = {
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: '.kiroディレクトリが存在しません',
            timestamp: new Date(),
          },
        };
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: () => Promise.resolve(mockErrorResponse),
        });

        await expect(apiClient.getProjectFiles('project-without-kiro')).rejects.toThrow(
          'HTTP error! status: 404'
        );
      });

      test('権限エラーの場合はエラーをスローする', async () => {
        const mockErrorResponse: ApiResponse<never> = {
          success: false,
          error: {
            type: 'PERMISSION_DENIED',
            message: 'ファイル読み取り権限がありません',
            timestamp: new Date(),
          },
        };
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          json: () => Promise.resolve(mockErrorResponse),
        });

        await expect(apiClient.getProjectFiles('restricted-project')).rejects.toThrow(
          'HTTP error! status: 403'
        );
      });

      test('空のファイルツリーを正常に処理する', async () => {
        const mockResponse: ApiResponse<FileTreeResponse> = {
          success: true,
          data: {
            files: [],
          },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await apiClient.getProjectFiles('empty-project');

        expect(result).toEqual(mockResponse.data);
        expect(result.files).toHaveLength(0);
      });

      test('正しいAPIエンドポイントを呼び出す', async () => {
        const mockResponse: ApiResponse<FileTreeResponse> = {
          success: true,
          data: { files: [] },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        await apiClient.getProjectFiles('test-id');

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/projects/test-id/files', {
          method: 'GET',
          headers: {},
        });
      });

      test('プロジェクトIDのバリデーションを行う', async () => {
        await expect(apiClient.getProjectFiles('')).rejects.toThrow('プロジェクトIDが無効です');
        await expect(apiClient.getProjectFiles('   ')).rejects.toThrow('プロジェクトIDが無効です');
      });

      test('プロジェクトIDをURLエンコードする', async () => {
        const mockResponse: ApiResponse<FileTreeResponse> = {
          success: true,
          data: { files: [] },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        await apiClient.getProjectFiles('test id with spaces');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/projects/test%20id%20with%20spaces/files',
          {
            method: 'GET',
            headers: {},
          }
        );
      });
    });
  });
});
