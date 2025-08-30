/**
 * API関連の型定義
 */

import type { FileTreeNode, FileContent } from './file.js';

// 共通レスポンス型
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    timestamp: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
}

// ファイル関連API
export interface GetFilesResponse {
    files: FileTreeNode[];
    projectName: string;
    rootPath: string;
}

export interface GetFileResponse extends FileContent { }

export interface UpdateFileRequest {
    content: string;
    lastModified?: string;
}

export interface UpdateFileResponse {
    success: boolean;
    lastModified: string;
    path: string;
}

// エラー型定義
export enum ErrorType {
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
    WEBSOCKET_CONNECTION_FAILED = 'WEBSOCKET_CONNECTION_FAILED',
    FILE_CONFLICT = 'FILE_CONFLICT',
    NETWORK_ERROR = 'NETWORK_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export interface AppError {
    type: ErrorType;
    message: string;
    details?: any;
    timestamp: Date;
    recoverable: boolean;
}