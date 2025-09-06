/**
 * ヘルスチェックAPI用モックデータ
 *
 * ヘルスチェックエンドポイントで使用するモックレスポンスデータを定義します。
 * 既存のHealthResponse型を使用した型安全な実装。
 */

import type { HealthResponse } from '@kiro-lens/shared';
import type { MockDataSet } from '../types';

/**
 * ヘルスチェック用モックデータセット
 * 正常時とエラー時のレスポンスパターンを提供
 */
export const healthMockData: MockDataSet<HealthResponse> = {
  success: {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: 3600, // 1時間稼働
  } satisfies HealthResponse,

  error: {
    status: 'unhealthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: 0, // エラー時は稼働時間0
  } satisfies HealthResponse,
};
