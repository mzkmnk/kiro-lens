import { describe, test, expect, beforeEach } from 'vitest';
import { FileContentService } from './fileContentService.js';
import { MOCK_UUID } from '../test/constants.js';

// テスト用の定数
const TEST_PROJECT_ID = MOCK_UUID;
const NON_EXISTENT_PROJECT_ID = 'non-existent-project';
const TEST_FILE_PATH = 'test.md';
const MALICIOUS_FILE_PATH = '../../../etc/passwd';

describe('FileContentService', () => {
  let service: FileContentService;

  beforeEach(() => {
    service = new FileContentService();
  });

  test('プロジェクトが存在しない場合はPROJECT_NOT_FOUNDエラーを投げる', async () => {
    await expect(service.getFileContent(NON_EXISTENT_PROJECT_ID, TEST_FILE_PATH)).rejects.toThrow(
      expect.objectContaining({
        code: 'PROJECT_NOT_FOUND',
      })
    );
  });

  test('不正なファイルパスの場合はINVALID_PATHエラーを投げる', async () => {
    await expect(service.getFileContent(TEST_PROJECT_ID, MALICIOUS_FILE_PATH)).rejects.toThrow(
      expect.objectContaining({
        code: expect.stringMatching(/PROJECT_NOT_FOUND|INVALID_PATH/),
      })
    );
  });
});
