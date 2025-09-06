/**
 * プロジェクトAPI用モックデータ
 *
 * プロジェクトエンドポイントで使用するモックレスポンスデータを定義します。
 * 既存のProjectResponse型を使用した型安全な実装。
 */

import type { ProjectResponse } from '@kiro-lens/shared';
import type { MockDataSet } from '../types';

/**
 * プロジェクト用モックデータセット
 * 正常時とエラー時のレスポンスパターンを提供
 */
export const projectMockData: MockDataSet<ProjectResponse> = {
  success: {
    name: 'kiro-lens-demo',
    hasKiroDir: true,
    kiroPath: '/Users/demo/projects/kiro-lens-demo/.kiro',
  } satisfies ProjectResponse,

  error: {
    name: 'unknown-project',
    hasKiroDir: false,
    // kiroPathはundefinedなので省略
  } satisfies ProjectResponse,
};
