/**
 * MSW ハンドラー関連の型定義
 *
 * 型安全なハンドラー定義とレスポンス管理のための型を提供します。
 */

import type { RequestHandler } from 'msw';

/**
 * MSWハンドラーの基本型
 */
export type MSWHandler = RequestHandler;

/**
 * ハンドラーグループの型定義
 * エンドポイント別にハンドラーをグループ化するために使用
 */
export interface HandlerGroup {
  /** ハンドラーグループの名前 */
  name: string;
  /** ハンドラーの配列 */
  handlers: MSWHandler[];
}

/**
 * モックデータセットの型定義
 * 成功・エラー・ローディング状態のデータを管理
 */
export interface MockDataSet<T> {
  /** 成功時のレスポンスデータ */
  success: T;
  /** エラー時のレスポンスデータ（オプション） */
  error?: T;
  /** ローディング時のレスポンスデータ（オプション） */
  loading?: T;
}

/**
 * MSW環境変数の型定義
 */
export interface MSWEnvironment {
  /** MSW有効/無効切り替えフラグ */
  VITE_ENABLE_MSW: 'true' | 'false';
}
