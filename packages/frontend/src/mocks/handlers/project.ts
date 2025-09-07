/**
 * プロジェクトAPI用MSWハンドラー
 *
 * パス管理システムのプロジェクト関連エンドポイントのモックレスポンスを提供します。
 * 正常系のみのシンプルな実装。
 */

import { http, HttpResponse } from 'msw';
import type { MSWHandler } from '../types';
import { createApiUrls } from '../config';
import {
  projectListMockData,
  addProjectMockData,
  removeProjectMockData,
  validatePathMockData,
  selectProjectMockData,
  projectMockData, // 後方互換性
} from '../data/project';

// APIエンドポイントのURL配列を生成
const projectsUrls = createApiUrls('/api/projects');
const validatePathUrls = createApiUrls('/api/projects/validate-path');

/**
 * プロジェクトAPI用ハンドラー配列
 */
export const projectHandlers: MSWHandler[] = [
  // プロジェクト一覧取得: GET /api/projects
  ...projectsUrls.map(url => http.get(url, () => HttpResponse.json(projectListMockData))),

  // プロジェクト追加: POST /api/projects
  ...projectsUrls.map(url =>
    http.post(url, () => HttpResponse.json(addProjectMockData, { status: 201 }))
  ),

  // プロジェクト削除: DELETE /api/projects/:id
  ...projectsUrls.map(url =>
    http.delete(`${url}/:id`, () => HttpResponse.json(removeProjectMockData))
  ),

  // パス検証: POST /api/projects/validate-path
  ...validatePathUrls.map(url => http.post(url, () => HttpResponse.json(validatePathMockData))),

  // プロジェクト選択: PUT /api/projects/:id/select
  ...projectsUrls.map(url =>
    http.put(`${url}/:id/select`, () => HttpResponse.json(selectProjectMockData))
  ),

  // 後方互換性: GET /api/project (既存のエンドポイント)
  http.get('/api/project', () => HttpResponse.json(projectMockData.success)),
];
