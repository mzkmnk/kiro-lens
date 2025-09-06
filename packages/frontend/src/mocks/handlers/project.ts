/**
 * プロジェクトAPI用MSWハンドラー
 *
 * GET /api/project エンドポイントのモックレスポンスを提供します。
 */

import { http, HttpResponse } from 'msw';
import type { MSWHandler } from '../types';
import { projectMockData } from '../data/project';

/**
 * GET /api/project ハンドラー
 * プロジェクト情報を返すモックレスポンス
 */
const getProjectHandler = http.get('/api/project', () => {
  // 通常は成功レスポンスを返す
  // エラーシミュレーションが必要な場合は projectMockData.error を使用
  return HttpResponse.json(projectMockData.success);
});

/**
 * プロジェクトAPI用ハンドラー配列
 */
export const projectHandlers: MSWHandler[] = [getProjectHandler];
