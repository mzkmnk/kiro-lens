import { describe, test, expect } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { Type } from '@sinclair/typebox';
import {
  ApiErrorSchema,
  ApiResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  EmptyResponseSchema,
  PaginationSchema,
  PaginatedResponseSchema,
  isApiSuccess,
  isApiError,
} from '../api/common';

describe('Common API Schema', () => {
  describe('ApiErrorSchema', () => {
    test('基本的なAPIエラーを受け入れる', () => {
      const apiError = {
        type: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(ApiErrorSchema, apiError)).toBe(true);
    });

    test('詳細情報付きAPIエラーを受け入れる', () => {
      const apiError = {
        type: 'NOT_FOUND',
        message: 'Resource not found',
        timestamp: '2024-01-01T00:00:00.000Z',
        details: {
          resourceId: 'project-123',
          resourceType: 'project',
        },
      };

      expect(Value.Check(ApiErrorSchema, apiError)).toBe(true);
    });

    test('無効なエラータイプを拒否する', () => {
      const invalidError = {
        type: 'INVALID_ERROR_TYPE',
        message: 'Test error',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(ApiErrorSchema, invalidError)).toBe(false);
    });

    test('空のメッセージを拒否する', () => {
      const invalidError = {
        type: 'INTERNAL_ERROR',
        message: '',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(ApiErrorSchema, invalidError)).toBe(false);
    });
  });

  describe('ApiResponseSchema', () => {
    test('成功レスポンスを受け入れる', () => {
      const dataSchema = Type.Object({
        id: Type.String(),
        name: Type.String(),
      });

      const successResponse = {
        success: true,
        data: {
          id: 'test-id',
          name: 'Test Name',
        },
      };

      expect(Value.Check(ApiResponseSchema(dataSchema), successResponse)).toBe(true);
    });

    test('エラーレスポンスを受け入れる', () => {
      const dataSchema = Type.String();

      const errorResponse = {
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: 'Resource not found',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(Value.Check(ApiResponseSchema(dataSchema), errorResponse)).toBe(true);
    });

    test('データとエラー両方があるレスポンスを受け入れる', () => {
      const dataSchema = Type.String();

      const mixedResponse = {
        success: false,
        data: 'some data',
        error: {
          type: 'INTERNAL_ERROR',
          message: 'Server error',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(Value.Check(ApiResponseSchema(dataSchema), mixedResponse)).toBe(true);
    });
  });

  describe('SuccessResponseSchema', () => {
    test('成功レスポンスを受け入れる', () => {
      const dataSchema = Type.Object({
        message: Type.String(),
      });

      const successResponse = {
        success: true,
        data: {
          message: 'Operation completed successfully',
        },
      };

      expect(Value.Check(SuccessResponseSchema(dataSchema), successResponse)).toBe(true);
    });

    test('success: falseを拒否する', () => {
      const dataSchema = Type.String();

      const invalidResponse = {
        success: false,
        data: 'test data',
      };

      expect(Value.Check(SuccessResponseSchema(dataSchema), invalidResponse)).toBe(false);
    });
  });

  describe('ErrorResponseSchema', () => {
    test('エラーレスポンスを受け入れる', () => {
      const errorResponse = {
        success: false,
        error: {
          type: 'PERMISSION_DENIED',
          message: 'Access denied',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(Value.Check(ErrorResponseSchema, errorResponse)).toBe(true);
    });

    test('success: trueを拒否する', () => {
      const invalidResponse = {
        success: true,
        error: {
          type: 'INTERNAL_ERROR',
          message: 'Error',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(Value.Check(ErrorResponseSchema, invalidResponse)).toBe(false);
    });
  });

  describe('EmptyResponseSchema', () => {
    test('空のレスポンスを受け入れる', () => {
      const emptyResponse = {
        success: true,
      };

      expect(Value.Check(EmptyResponseSchema, emptyResponse)).toBe(true);
    });

    test('success: falseを拒否する', () => {
      const invalidResponse = {
        success: false,
      };

      expect(Value.Check(EmptyResponseSchema, invalidResponse)).toBe(false);
    });
  });

  describe('PaginationSchema', () => {
    test('基本的なページネーション情報を受け入れる', () => {
      const pagination = {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
      };

      expect(Value.Check(PaginationSchema, pagination)).toBe(true);
    });

    test('0ページを拒否する', () => {
      const invalidPagination = {
        page: 0,
        limit: 20,
        total: 100,
        totalPages: 5,
      };

      expect(Value.Check(PaginationSchema, invalidPagination)).toBe(false);
    });

    test('制限を超えるlimitを拒否する', () => {
      const invalidPagination = {
        page: 1,
        limit: 101,
        total: 100,
        totalPages: 1,
      };

      expect(Value.Check(PaginationSchema, invalidPagination)).toBe(false);
    });
  });

  describe('PaginatedResponseSchema', () => {
    test('ページネーション対応レスポンスを受け入れる', () => {
      const itemSchema = Type.Object({
        id: Type.String(),
        name: Type.String(),
      });

      const paginatedResponse = {
        success: true,
        data: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };

      expect(Value.Check(PaginatedResponseSchema(itemSchema), paginatedResponse)).toBe(true);
    });
  });

  describe('型ガード関数', () => {
    describe('isApiSuccess', () => {
      test('成功レスポンスでtrueを返す', () => {
        const successResponse = {
          success: true,
          data: 'test data',
        };

        expect(isApiSuccess(successResponse)).toBe(true);
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

        expect(isApiSuccess(errorResponse)).toBe(false);
      });

      test('dataがundefinedの場合falseを返す', () => {
        const responseWithoutData = {
          success: true,
        };

        expect(isApiSuccess(responseWithoutData)).toBe(false);
      });
    });

    describe('isApiError', () => {
      test('エラーレスポンスでtrueを返す', () => {
        const errorResponse = {
          success: false,
          error: {
            type: 'INTERNAL_ERROR' as const,
            message: 'Server error',
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        };

        expect(isApiError(errorResponse)).toBe(true);
      });

      test('成功レスポンスでfalseを返す', () => {
        const successResponse = {
          success: true,
          data: 'test data',
        };

        expect(isApiError(successResponse)).toBe(false);
      });

      test('errorがundefinedの場合falseを返す', () => {
        const responseWithoutError = {
          success: false,
        };

        expect(isApiError(responseWithoutError)).toBe(false);
      });
    });
  });
});
