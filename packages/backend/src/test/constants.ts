/**
 * テスト用の定数とモックデータ
 *
 * テストファイル間でのモックデータの重複を避けるため、
 * 共通で使用するモックデータと定数をここに集約します。
 */

import type { AppConfig } from '@kiro-lens/shared';
import {
  MOCK_PROJECT,
  MOCK_API_PROJECT,
  MOCK_API_PROJECT_WITH_ACCESS,
  MOCK_INVALID_PROJECT,
  MOCK_PROJECT_LIST,
  MOCK_DEFAULT_CONFIG,
  MOCK_CUSTOM_CONFIG,
  MOCK_CONFIG_WITH_PROJECT,
  MOCK_CONFIG_WITH_SELECTED_PROJECT,
  MOCK_VALIDATION_RESULTS,
} from '@kiro-lens/shared';

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

// ===== 共通モックデータを再エクスポート =====

// 設定関連のモックデータ
export {
  MOCK_DEFAULT_CONFIG,
  MOCK_CUSTOM_CONFIG,
  MOCK_CONFIG_WITH_PROJECT,
  MOCK_CONFIG_WITH_SELECTED_PROJECT,
} from '@kiro-lens/shared';

// プロジェクト関連のモックデータ
export {
  MOCK_PROJECT,
  MOCK_API_PROJECT,
  MOCK_API_PROJECT_WITH_ACCESS,
  MOCK_INVALID_PROJECT,
  MOCK_PROJECT_LIST,
} from '@kiro-lens/shared';

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

// パス検証結果のモック（共通モックデータを使用）
export { MOCK_VALIDATION_RESULTS } from '@kiro-lens/shared';

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
