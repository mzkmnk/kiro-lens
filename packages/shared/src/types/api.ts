import { BaseError } from './common.js';

export enum ApiErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface ApiError extends BaseError {
    type: ApiErrorType;
    code: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T | null;
    error?: ApiError;
}

export interface ProjectInfo {
    name: string;
    path: string;
    hasKiroDirectory: boolean;
    kiroPath?: string;
}

export function createApiResponse<T>(data?: T, error?: ApiError): ApiResponse<T> {
    if (error) {
        return { success: false, error };
    }
    return { success: true, data };
}

export function createApiError(
    type: ApiErrorType,
    message: string,
    code: string,
    details?: Record<string, any>
): ApiError {
    return { type, message, code, ...(details && { details }) };
}

export function isApiError(obj: any): obj is ApiError {
    return (
        obj !== null &&
        obj !== undefined &&
        typeof obj === 'object' &&
        typeof obj.type === 'string' &&
        typeof obj.message === 'string' &&
        typeof obj.code === 'string' &&
        Object.values(ApiErrorType).includes(obj.type)
    );
}