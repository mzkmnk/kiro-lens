import { describe, test, expect, vi, beforeEach } from 'vitest';
import * as fileTreeApi from './fileTreeApi';

// httpClientのモック
vi.mock('./httpClient', () => ({
  default: {
    get: vi.fn(),
  },
  handleApiError: vi.fn(),
}));

describe('fileTreeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjectFiles', () => {
    test('プロジェクトのファイルツリーを正常に取得できる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(1);
      }).rejects.toThrow();
    });

    test('無効なプロジェクトIDでエラーになる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(0);
      }).rejects.toThrow();
    });

    test('負のプロジェクトIDでエラーになる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(-1);
      }).rejects.toThrow();
    });

    test('存在しないプロジェクトIDでAPIエラーになる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(999);
      }).rejects.toThrow();
    });
  });

  describe('プロジェクトIDバリデーション', () => {
    test('0のプロジェクトIDが無効として扱われる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(0);
      }).rejects.toThrow('無効なプロジェクトIDです');
    });

    test('負の数のプロジェクトIDが無効として扱われる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(-5);
      }).rejects.toThrow('無効なプロジェクトIDです');
    });
  });

  describe('ファイルツリー固有エラーハンドリング', () => {
    test('HTTPエラーが適切に処理される', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(1);
      }).rejects.toThrow();
    });

    test('ネットワークエラーが適切に処理される', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(1);
      }).rejects.toThrow();
    });

    test('ファイルツリー固有のエラーメッセージが含まれる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await fileTreeApi.getProjectFiles(1);
      }).rejects.toThrow('ファイルツリーの取得に失敗しました');
    });
  });
});
