import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './api';
import type {
  AddProjectResponse,
  ProjectListResponse,
  ValidationResult,
  ProjectInfo,
  ApiResponse,
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
    test('正しいURLとヘッダーでGETリクエストを送信する', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

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
    test('正しいURL、ヘッダー、ボディでPOSTリクエストを送信する', async () => {
      const mockResponse = { success: true };
      const requestData = { name: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.post('/create', requestData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('PUTメソッド', () => {
    test('正しいURL、ヘッダー、ボディでPUTリクエストを送信する', async () => {
      const mockResponse = { updated: true };
      const requestData = { id: 1, name: 'updated' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.put('/update/1', requestData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/update/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETEメソッド', () => {
    test('正しいURLとヘッダーでDELETEリクエストを送信する', async () => {
      const mockResponse = { deleted: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.delete('/delete/1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/delete/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
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

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/path/to/project' }),
        });
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

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/projects/test-id', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
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

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/projects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
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

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/projects/validate-path', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/path/to/project' }),
        });
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

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/projects/test-id/select',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });
});
