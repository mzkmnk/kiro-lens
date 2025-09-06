/**
 * ヘルスチェックAPI用MSWハンドラー
 *
 * GET /api/health エンドポイントのモックレスポンスを提供します。
 * エラーシミュレーション機能を含み、型安全な実装を実現します。
 */

import { http, HttpResponse } from 'msw';
import type { HealthResponse } from '@kiro-lens/shared';
import type { MSWHandler } from '../types';
import { createApiUrls, logMSWError } from '../config';

/**
 * ヘルスチェックハンドラーの共通ロジック
 */
const createHealthHandler =
  () =>
  ({ request }: { request: Request }) => {
    try {
      const url = new URL(request.url);

      // エラーシミュレーション機能
      if (url.searchParams.get('error') === 'true') {
        const errorResponse: HealthResponse = {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          uptime: 0,
        };
        return HttpResponse.json(errorResponse, { status: 500 });
      }

      // 正常レスポンス
      const successResponse: HealthResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: Math.floor(Math.random() * 3600) + 60, // 1分〜1時間のランダム稼働時間
      };

      return HttpResponse.json(successResponse);
    } catch (error) {
      logMSWError('Health', 'Handler execution failed', error);

      // エラー時のフォールバック
      const fallbackResponse: HealthResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: 0,
      };

      return HttpResponse.json(fallbackResponse, { status: 500 });
    }
  };

// APIエンドポイントのURL配列を生成
const healthUrls = createApiUrls('/api/health');

export const healthHandlers: MSWHandler[] = healthUrls.map(url =>
  http.get(url, createHealthHandler())
);
