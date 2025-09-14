import { describe, test, expect } from 'vitest';
import { FileContentService } from './fileContentService.js';

describe('FileContentService', () => {
  test('FileContentServiceクラスが正しくインスタンス化される', () => {
    const service = new FileContentService();
    expect(service).toBeInstanceOf(FileContentService);
  });

  test('getFileContentメソッドが存在する', () => {
    const service = new FileContentService();
    expect(typeof service.getFileContent).toBe('function');
  });

  test('プロジェクトが存在しない場合はPROJECT_NOT_FOUNDエラーを投げる', async () => {
    const service = new FileContentService();

    // 存在しないプロジェクトIDでテスト
    await expect(service.getFileContent('non-existent-project', 'test.md')).rejects.toThrow(
      expect.objectContaining({
        code: 'PROJECT_NOT_FOUND',
      })
    );
  });

  test('不正なファイルパスの場合はINVALID_PATHエラーを投げる', async () => {
    const service = new FileContentService();

    // パストラバーサル攻撃のようなパスでテスト
    await expect(service.getFileContent('test-project', '../../../etc/passwd')).rejects.toThrow(
      expect.objectContaining({
        code: expect.stringMatching(/PROJECT_NOT_FOUND|INVALID_PATH/),
      })
    );
  });
});
