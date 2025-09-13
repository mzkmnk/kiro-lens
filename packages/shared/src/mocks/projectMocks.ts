/**
 * プロジェクト関連の共通モックデータ
 *
 * フロントエンドとバックエンドで共通して使用するプロジェクト関連のモックデータを定義します。
 */

import type { ProjectInfo } from '../types/project';

/**
 * テスト用のプロジェクト情報
 */
export const MOCK_PROJECT: ProjectInfo = {
  id: 'test-project-id',
  name: 'test-project',
  path: '/absolute/path/to/project',
  kiroPath: '/absolute/path/to/project/.kiro',
  hasKiroDir: true,
  isValid: true,
  addedAt: '2024-01-01T00:00:00.000Z',
};

/**
 * テスト用のプロジェクト情報（API用）
 */
export const MOCK_API_PROJECT: ProjectInfo = {
  id: 'test-id',
  name: 'test-project',
  path: '/test/path',
  kiroPath: '/test/path/.kiro',
  hasKiroDir: true,
  isValid: true,
  addedAt: '2024-01-01T00:00:00.000Z',
};

/**
 * テスト用のプロジェクト情報（最終アクセス日時付き）
 */
export const MOCK_API_PROJECT_WITH_ACCESS: ProjectInfo = {
  ...MOCK_API_PROJECT,
  lastAccessedAt: '2024-01-01T01:00:00.000Z',
};

/**
 * テスト用の無効なプロジェクト情報
 */
export const MOCK_INVALID_PROJECT: ProjectInfo = {
  ...MOCK_PROJECT,
  id: 'invalid-project-id',
  name: 'invalid-project',
  path: '/absolute/path/to/invalid',
  kiroPath: '/absolute/path/to/invalid/.kiro',
  hasKiroDir: false,
  isValid: false,
};

/**
 * MSW用のモックプロジェクトデータ
 */
export const MSW_MOCK_PROJECTS: ProjectInfo[] = [
  {
    id: '1',
    name: 'kiro-lens-foundation',
    path: '/Users/demo/projects/kiro-lens-foundation',
    kiroPath: '/Users/demo/projects/kiro-lens-foundation/.kiro',
    hasKiroDir: true,
    isValid: true,
    addedAt: '2024-01-01T00:00:00Z',
    lastAccessedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'path-management-system',
    path: '/Users/demo/projects/path-management-system',
    kiroPath: '/Users/demo/projects/path-management-system/.kiro',
    hasKiroDir: true,
    isValid: true,
    addedAt: '2024-01-02T00:00:00Z',
    lastAccessedAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    name: 'invalid-project',
    path: '/Users/demo/projects/invalid-project',
    kiroPath: '/Users/demo/projects/invalid-project/.kiro',
    hasKiroDir: false,
    isValid: false,
    addedAt: '2024-01-03T00:00:00Z',
  },
];

/**
 * テスト用のプロジェクト一覧
 */
export const MOCK_PROJECT_LIST: ProjectInfo[] = [
  {
    id: 'project-1',
    name: 'project1',
    path: '/path/to/project1',
    kiroPath: '/path/to/project1/.kiro',
    hasKiroDir: true,
    isValid: true,
    addedAt: '2024-01-01T00:00:00.000Z',
  },
];

/**
 * MSW用の新しいプロジェクトデータ
 */
export const MSW_NEW_PROJECT: ProjectInfo = {
  id: '4',
  name: 'new-project',
  path: '/Users/demo/projects/new-project',
  kiroPath: '/Users/demo/projects/new-project/.kiro',
  hasKiroDir: true,
  isValid: true,
  addedAt: new Date().toISOString(),
};
