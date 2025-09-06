/**
 * プロジェクトAPI用モックデータ
 *
 * プロジェクトエンドポイントで使用するモックレスポンスデータを定義します。
 * 今後のタスクで実装予定。
 */

import type { MockDataSet } from '../types';

// 型定義は今後のタスクでsharedパッケージから取得予定
type ProjectResponse = {
  hasKiroDirectory: boolean;
  projectName: string;
  timestamp: string;
};

/**
 * プロジェクト用モックデータセット
 * タスク5で実装予定
 */
export const projectMockData: MockDataSet<ProjectResponse> = {
  success: {
    hasKiroDirectory: true,
    projectName: 'kiro-lens',
    timestamp: new Date().toISOString(),
  },
  error: {
    hasKiroDirectory: false,
    projectName: 'unknown',
    timestamp: new Date().toISOString(),
  },
};
