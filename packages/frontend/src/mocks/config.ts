/**
 * MSWハンドラー共通設定
 *
 * 全てのMSWハンドラーで使用される共通設定を管理します。
 * 環境変数の取得、URL構築、共通ユーティリティを提供します。
 */

/**
 * 環境変数からAPIベースURLを取得
 * フォールバック値を含む安全な取得
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * APIエンドポイントのURL構築ユーティリティ
 *
 * @param path - APIパス（例: '/api/health'）
 * @returns 相対URLと絶対URLの配列
 */
export const createApiUrls = (path: string): string[] => {
  return [
    path, // 相対URL
    `${API_BASE_URL}${path}`, // 絶対URL
  ];
};

/**
 * 共通のログ出力
 *
 * @param handlerName - ハンドラー名
 * @param message - ログメッセージ
 * @param error - エラーオブジェクト（オプション）
 */
export const logMSWError = (handlerName: string, message: string, error?: unknown): void => {
  console.error(`MSW ${handlerName} Handler Error: ${message}`, error);
};
