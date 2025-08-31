import { describe, it, expect } from 'vitest';
import type { ApiResponse, ApiError, ApiErrorType, ProjectResponse } from './api';

describe('ApiResponse型', () => {
  it('成功レスポンスを作成できる', () => {
    const response: ApiResponse<string> = {
      success: true,
      data: 'test data',
    };

    expect(response.success).toBe(true);
    expect(response.data).toBe('test data');
    expect(response.error).toBeUndefined();
  });

  it('エラーレスポンスを作成できる', () => {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: new Date(),
      },
    };

    expect(response.success).toBe(false);
    expect(response.data).toBeUndefined();
    expect(response.error?.type).toBe('VALIDATION_ERROR');
    expect(response.error?.message).toBe('Invalid input');
  });

  it('データなしの成功レスポンスを作成できる', () => {
    const response: ApiResponse = {
      success: true,
    };

    expect(response.success).toBe(true);
    expect(response.data).toBeUndefined();
  });
});

describe('ApiErrorType列挙型', () => {
  it('すべてのAPIエラータイプが定義されている', () => {
    const errorTypes: ApiErrorType[] = [
      'VALIDATION_ERROR',
      'NOT_FOUND',
      'INTERNAL_ERROR',
      'PERMISSION_DENIED',
      'RATE_LIMIT_EXCEEDED',
    ];

    errorTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });
});

describe('ApiError型', () => {
  it('基本的なAPIエラーを作成できる', () => {
    const error: ApiError = {
      type: 'NOT_FOUND',
      message: 'リソースが見つかりません',
      timestamp: new Date(),
    };

    expect(error.type).toBe('NOT_FOUND');
    expect(error.message).toBe('リソースが見つかりません');
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('詳細情報を含むAPIエラーを作成できる', () => {
    const error: ApiError = {
      type: 'VALIDATION_ERROR',
      message: 'バリデーションエラー',
      details: {
        field: 'port',
        value: -1,
        constraint: 'must be positive',
      },
      timestamp: new Date(),
    };

    expect(error.details).toEqual({
      field: 'port',
      value: -1,
      constraint: 'must be positive',
    });
  });
});

describe('ProjectResponse型', () => {
  it('基本的なプロジェクトレスポンスを作成できる', () => {
    const response: ProjectResponse = {
      name: 'test-project',
      hasKiroDir: true,
    };

    expect(response.name).toBe('test-project');
    expect(response.hasKiroDir).toBe(true);
    expect(response.kiroPath).toBeUndefined();
  });

  it('.kiroパスを含むプロジェクトレスポンスを作成できる', () => {
    const response: ProjectResponse = {
      name: 'test-project',
      hasKiroDir: true,
      kiroPath: '/path/to/project/.kiro',
    };

    expect(response.kiroPath).toBe('/path/to/project/.kiro');
  });

  it('.kiroディレクトリが存在しない場合のレスポンスを作成できる', () => {
    const response: ProjectResponse = {
      name: 'test-project',
      hasKiroDir: false,
    };

    expect(response.hasKiroDir).toBe(false);
    expect(response.kiroPath).toBeUndefined();
  });
});
