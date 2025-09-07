/**
 * 設定関連の共通モックデータ
 *
 * フロントエンドとバックエンドで共通して使用する設定関連のモックデータを定義します。
 */

import type { AppConfig } from '../types/config';
import { MOCK_PROJECT } from './projectMocks';

/**
 * テスト用のデフォルト設定
 */
export const MOCK_DEFAULT_CONFIG: AppConfig = {
  version: '1.0.0',
  projects: [],
  settings: {
    theme: 'system',
    autoSave: true,
    maxRecentProjects: 10,
  },
  metadata: {
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    configPath: '/home/test/.kiro-lens/config.json',
  },
};

/**
 * テスト用のカスタム設定
 */
export const MOCK_CUSTOM_CONFIG: AppConfig = {
  version: '1.0.0',
  projects: [],
  settings: {
    theme: 'dark',
    autoSave: false,
    maxRecentProjects: 5,
  },
  metadata: {
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    configPath: '/home/test/.kiro-lens/config.json',
  },
};

/**
 * プロジェクトを含む設定
 */
export const MOCK_CONFIG_WITH_PROJECT: AppConfig = {
  ...MOCK_DEFAULT_CONFIG,
  projects: [MOCK_PROJECT],
};

/**
 * 選択されたプロジェクトを含む設定
 */
export const MOCK_CONFIG_WITH_SELECTED_PROJECT: AppConfig = {
  ...MOCK_CONFIG_WITH_PROJECT,
  settings: {
    ...MOCK_DEFAULT_CONFIG.settings,
    lastSelectedProject: MOCK_PROJECT.id,
  },
};
