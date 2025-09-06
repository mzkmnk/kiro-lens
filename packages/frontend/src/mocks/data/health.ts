/**
 * ヘルスチェックAPI用モックデータ
 *
 * ヘルスチェックエンドポイントで使用するモックレスポンスデータを定義します。
 * 今後のタスクで実装予定。
 */

import type { MockDataSet } from '../types';

// 型定義は今後のタスクでsharedパッケージから取得予定
type HealthResponse = {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  error?: string;
};

/**
 * ヘルスチェック用モックデータセット
 * タスク4で実装予定
 */
export const healthMockData: MockDataSet<HealthResponse> = {
  success: {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  },
  error: {
    status: 'unhealthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    error: 'Database connection failed',
  },
};
