import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './api';

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
});
