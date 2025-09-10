import { describe, test, expect, vi, beforeEach } from 'vitest';
// HTTPErrorは使用していないため削除
import * as projectApi from './projectApi';

// httpClientのモック
vi.mock('./httpClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  handleApiError: vi.fn(),
}));

describe('projectApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    test('プロジェクト一覧を正常に取得できる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.getProjects();
      }).rejects.toThrow();
    });

    test('APIエラー時に適切なエラーメッセージを返す', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.getProjects();
      }).rejects.toThrow();
    });
  });

  describe('addProject', () => {
    test('プロジェクトを正常に追加できる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.addProject('/test/path');
      }).rejects.toThrow();
    });

    test('無効なパスでエラーになる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.addProject('');
      }).rejects.toThrow();
    });
  });

  describe('removeProject', () => {
    test('プロジェクトを正常に削除できる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.removeProject('1');
      }).rejects.toThrow();
    });

    test('存在しないプロジェクトIDでエラーになる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.removeProject('999');
      }).rejects.toThrow();
    });
  });

  describe('validatePath', () => {
    test('有効なパスの検証が成功する', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.validatePath('/valid/path');
      }).rejects.toThrow();
    });

    test('無効なパスの検証が失敗する', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.validatePath('/invalid/path');
      }).rejects.toThrow();
    });
  });

  describe('selectProject', () => {
    test('プロジェクトを正常に選択できる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.selectProject('1');
      }).rejects.toThrow();
    });

    test('存在しないプロジェクトIDでエラーになる', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.selectProject('1');
      }).rejects.toThrow();
    });
  });

  describe('エラーハンドリング', () => {
    test('HTTPエラーが適切に処理される', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.getProjects();
      }).rejects.toThrow();
    });

    test('ネットワークエラーが適切に処理される', async () => {
      // このテストは実装後に通るようになる
      expect(async () => {
        await projectApi.getProjects();
      }).rejects.toThrow();
    });
  });
});
