import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TypedApiClient, ApiClientError } from './typedApiClient';

// kyをモック
vi.mock('ky', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

describe('TypedApiClient', () => {
  let client: TypedApiClient;
  let mockKy: any;

  beforeEach(() => {
    client = new TypedApiClient('/api');
    mockKy = (client as any).client;
  });

  describe('get', () => {
    test('成功レスポンスを正しく処理する', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockKy.get.mockReturnValue({
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result = await client.get<typeof mockData>('test');

      expect(mockKy.get).toHaveBeenCalledWith('test');
      expect(result).toEqual(mockData);
    });

    test('HTTPエラーを適切に処理する', async () => {
      const mockError = new Error('HTTP Error');
      (mockError as any).response = {
        status: 404,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              type: 'NOT_FOUND',
              message: 'Resource not found',
              timestamp: '2024-01-01T00:00:00.000Z',
            },
          }),
      };

      mockKy.get.mockRejectedValue(mockError);

      await expect(client.get('test')).rejects.toThrow(ApiClientError);
    });
  });

  describe('post', () => {
    test('成功レスポンスを正しく処理する', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: '1', name: 'New Item' };

      mockKy.post.mockReturnValue({
        json: vi.fn().mockResolvedValue(responseData),
      });

      const result = await client.post<typeof requestData, typeof responseData>(
        'test',
        requestData
      );

      expect(mockKy.post).toHaveBeenCalledWith('test', { json: requestData });
      expect(result).toEqual(responseData);
    });
  });

  describe('put', () => {
    test('成功レスポンスを正しく処理する', async () => {
      const requestData = { name: 'Updated Item' };
      const responseData = { id: '1', name: 'Updated Item' };

      mockKy.put.mockReturnValue({
        json: vi.fn().mockResolvedValue(responseData),
      });

      const result = await client.put<typeof requestData, typeof responseData>(
        'test/1',
        requestData
      );

      expect(mockKy.put).toHaveBeenCalledWith('test/1', { json: requestData });
      expect(result).toEqual(responseData);
    });
  });

  describe('delete', () => {
    test('成功レスポンスを正しく処理する', async () => {
      const responseData = { message: 'Deleted successfully' };

      mockKy.delete.mockReturnValue({
        json: vi.fn().mockResolvedValue(responseData),
      });

      const result = await client.delete<typeof responseData>('test/1');

      expect(mockKy.delete).toHaveBeenCalledWith('test/1');
      expect(result).toEqual(responseData);
    });
  });

  describe('extractData', () => {
    test('成功レスポンスからデータを抽出する', () => {
      const successResponse = {
        success: true,
        data: { id: '1', name: 'Test' },
      };

      const result = TypedApiClient.extractData(successResponse);
      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    test('エラーレスポンスでApiClientErrorをthrowする', () => {
      const errorResponse = {
        success: false,
        error: {
          type: 'NOT_FOUND' as const,
          message: 'Resource not found',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(() => TypedApiClient.extractData(errorResponse)).toThrow(ApiClientError);
    });

    test('無効なレスポンス形式でエラーをthrowする', () => {
      const invalidResponse = {
        success: true,
        // dataがない
      };

      expect(() => TypedApiClient.extractData(invalidResponse)).toThrow(ApiClientError);
    });
  });

  describe('isSuccess', () => {
    test('成功レスポンスでtrueを返す', () => {
      const successResponse = {
        success: true,
        data: 'test data',
      };

      expect(TypedApiClient.isSuccess(successResponse)).toBe(true);
    });

    test('エラーレスポンスでfalseを返す', () => {
      const errorResponse = {
        success: false,
        error: {
          type: 'NOT_FOUND' as const,
          message: 'Not found',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(TypedApiClient.isSuccess(errorResponse)).toBe(false);
    });
  });

  describe('isError', () => {
    test('エラーレスポンスでtrueを返す', () => {
      const errorResponse = {
        success: false,
        error: {
          type: 'INTERNAL_ERROR' as const,
          message: 'Server error',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(TypedApiClient.isError(errorResponse)).toBe(true);
    });

    test('成功レスポンスでfalseを返す', () => {
      const successResponse = {
        success: true,
        data: 'test data',
      };

      expect(TypedApiClient.isError(successResponse)).toBe(false);
    });
  });
});

describe('ApiClientError', () => {
  test('基本的なエラー情報を正しく設定する', () => {
    const error = new ApiClientError('Test error', 'VALIDATION_ERROR', 400);

    expect(error.message).toBe('Test error');
    expect(error.type).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ApiClientError');
  });

  test('エラータイプ判定メソッドが正しく動作する', () => {
    const validationError = new ApiClientError('Validation failed', 'VALIDATION_ERROR');
    const notFoundError = new ApiClientError('Not found', 'NOT_FOUND');
    const permissionError = new ApiClientError('Access denied', 'PERMISSION_DENIED');
    const serverError = new ApiClientError('Server error', 'INTERNAL_ERROR');
    const rateLimitError = new ApiClientError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');

    expect(validationError.isValidationError).toBe(true);
    expect(validationError.isNotFoundError).toBe(false);

    expect(notFoundError.isNotFoundError).toBe(true);
    expect(notFoundError.isValidationError).toBe(false);

    expect(permissionError.isPermissionError).toBe(true);
    expect(permissionError.isServerError).toBe(false);

    expect(serverError.isServerError).toBe(true);
    expect(serverError.isRateLimitError).toBe(false);

    expect(rateLimitError.isRateLimitError).toBe(true);
    expect(rateLimitError.isPermissionError).toBe(false);
  });
});
