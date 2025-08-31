import { describe, it, expect } from 'vitest';
import {
    ApiError,
    ApiErrorType,
    createApiResponse,
    createApiError,
    isApiError
} from '../types/api.js';

describe('API関連ユーティリティ', () => {
    describe('createApiResponse', () => {
        it('成功レスポンスを作成すべき', () => {
            const data = { message: '成功' };
            const response = createApiResponse(data);

            expect(response.success).toBe(true);
            expect(response.data).toEqual(data);
            expect(response.error).toBeUndefined();
        });

        it('エラーレスポンスを作成すべき', () => {
            const error: ApiError = {
                type: ApiErrorType.VALIDATION_ERROR,
                message: 'バリデーションに失敗しました',
                code: 'VALIDATION_FAILED'
            };
            const response = createApiResponse(undefined, error);

            expect(response.success).toBe(false);
            expect(response.error).toEqual(error);
            expect(response.data).toBeUndefined();
        });
    });

    describe('createApiError', () => {
        it('APIエラーを作成すべき', () => {
            const error = createApiError(
                ApiErrorType.NOT_FOUND,
                'リソースが見つかりません',
                'RESOURCE_NOT_FOUND'
            );

            expect(error.type).toBe(ApiErrorType.NOT_FOUND);
            expect(error.message).toBe('リソースが見つかりません');
            expect(error.code).toBe('RESOURCE_NOT_FOUND');
        });

        it('詳細付きのAPIエラーを作成すべき', () => {
            const details = { resourceId: '123' };
            const error = createApiError(
                ApiErrorType.NOT_FOUND,
                'リソースが見つかりません',
                'RESOURCE_NOT_FOUND',
                details
            );

            expect(error.details).toEqual(details);
        });
    });

    describe('isApiError', () => {
        it('APIエラーを識別すべき', () => {
            const error: ApiError = {
                type: ApiErrorType.VALIDATION_ERROR,
                message: 'エラー',
                code: 'ERROR'
            };

            expect(isApiError(error)).toBe(true);
        });

        it('非APIエラーオブジェクトを拒否すべき', () => {
            expect(isApiError({})).toBe(false);
            expect(isApiError(null)).toBe(false);
            expect(isApiError('error')).toBe(false);
            expect(isApiError({ message: 'error' })).toBe(false);
        });
    });
});