/**
 * 共通型定義
 */

/**
 * 基本エラー型
 */
export interface BaseError {
    /** エラーメッセージ */
    message: string;
    /** エラー詳細（オプション） */
    details?: Record<string, any>;
}

/**
 * バリデーション結果の基本型
 */
export interface ValidationResult {
    /** 検証が成功したかどうか */
    isValid: boolean;
    /** エラーメッセージ配列 */
    errors: string[];
}