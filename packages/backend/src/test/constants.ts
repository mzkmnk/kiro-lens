/**
 * テスト用の定数とモックデータ
 *
 * テストファイル間でのモックデータの重複を避けるため、
 * 共通で使用するモックデータと定数をここに集約します。
 */

import type { AppConfig, ProjectInfo } from '@kiro-lens/shared';

// ===== ファイルシステム関連のモック戻り値 =====

/**
 * ファイルシステム操作の成功時モック戻り値
 */
export const MOCK_FS_SUCCESS = {
  /** fs.access の成功時戻り値 */
  ACCESS_SUCCESS: undefined,
  /** fs.mkdir の成功時戻り値 */
  MKDIR_SUCCESS: undefined,
  /** fs.writeFile の成功時戻り値 */
  WRITE_FILE_SUCCESS: undefined,
  /** fs.chmod の成功時戻り値 */
  CHMOD_SUCCESS: undefined,
} as const;

/**
 * ファイルシステム操作のエラー時モック戻り値
 */
export const MOCK_FS_ERRORS = {
  /** ファイル/ディレクトリが存在しない場合のエラー */
  ENOENT: new Error('ENOENT'),
  /** 権限不足エラー */
  PERMISSION_DENIED: new Error('Permission denied'),
  /** 無効なJSON */
  INVALID_JSON: 'invalid json',
} as const;

/**
 * ディレクトリ権限情報のモック
 */
export const MOCK_DIRECTORY_PERMISSIONS = {
  /** 全権限あり */
  FULL_ACCESS: {
    readable: true,
    writable: true,
    executable: true,
  },
  /** 読み取り権限なし */
  NO_READ_ACCESS: {
    readable: false,
    writable: true,
    executable: true,
  },
  /** 書き込み権限なし */
  NO_WRITE_ACCESS: {
    readable: true,
    writable: false,
    executable: true,
  },
} as const;

// ===== 設定関連のモックデータ =====

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

// ===== プロジェクト関連のモックデータ =====

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

// ===== テスト用のパス定数 =====

/**
 * テスト用のパス定数
 */
export const MOCK_PATHS = {
  /** 有効な絶対パス */
  VALID_ABSOLUTE: '/absolute/path/to/project',
  /** 無効な相対パス */
  INVALID_RELATIVE: './relative/path',
  /** 無効なチルダパス */
  INVALID_TILDE: '~/home/path',
  /** 存在しないパス */
  NON_EXISTENT: '/absolute/path/to/nonexistent',
  /** テスト用設定パス */
  TEST_CONFIG: '/home/test/.kiro-lens/config.json',
  /** API テスト用パス */
  API_TEST: '/test/path',
} as const;

// ===== API関連のモック戻り値 =====

/**
 * パス検証結果のモック
 */
export const MOCK_VALIDATION_RESULTS = {
  /** 有効なパスの検証結果 */
  VALID: {
    isValid: true,
    validatedPath: MOCK_PATHS.API_TEST,
  },
  /** 無効なパスの検証結果 */
  INVALID: {
    isValid: false,
    error: '指定されたディレクトリが存在しません',
  },
} as const;

// ===== UUID関連のモック =====

/**
 * テスト用のUUID
 */
export const MOCK_UUID = 'test-uuid-123';

// ===== 日時関連のモック =====

/**
 * テスト用の固定日時
 */
export const MOCK_DATE = '2024-01-01T00:00:00.000Z';

/**
 * テスト用の日時オブジェクト
 */
export const MOCK_DATE_OBJECT = new Date(MOCK_DATE);
