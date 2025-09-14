import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  getFileContent,
  safeGetFileContent,
  validateFileContentRequest,
} from './fileContent';

// apiClientのモック
vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const { apiClient } = await import('./apiClient');
const mockPost = vi.mocked(apiClient.post);

describe('fileContent API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFileContent', () => {
    test('正常なファイル内容取得', async () => {
      // Arrange
      const projectId = 'test-project';
      const filePath = 'test.md';
      const expectedContent = 'テストファイルの内容';

      mockPost.mockResolvedValue({
        success: true,
        data: { content: expectedContent },
      });

      // Act
      const result = await getFileContent(projectId, filePath);

      // Assert
      expect(result).toBe(expectedContent);
      expect(mockPost).toHaveBeenCalledWith(
        '/api/projects/test-project/files/content',
        { filePath: 'test.md' },
      );
    });

    test('APIエラーの場合は例外を投げる', async () => {
      // Arrange
      mockPost.mockResolvedValue({
        success: false,
        error: { message: 'ファイルが見つかりません' },
      });

      // Act & Assert
      await expect(getFileContent('test-project', 'test.md')).rejects.toThrow(
        'ファイルが見つかりません',
      );
    });

    test('エラーメッセージがない場合はデフォルトメッセージを使用', async () => {
      // Arrange
      mockPost.mockResolvedValue({
        success: false,
        error: {},
      });

      // Act & Assert
      await expect(getFileContent('test-project', 'test.md')).rejects.toThrow(
        'ファイル内容の取得に失敗しました',
      );
    });
  });

  describe('safeGetFileContent', () => {
    test('正常なファイル内容取得', async () => {
      // Arrange
      const expectedContent = 'テストファイルの内容';
      mockPost.mockResolvedValue({
        success: true,
        data: { content: expectedContent },
      });

      // Act
      const result = await safeGetFileContent('test-project', 'test.md');

      // Assert
      expect(result).toEqual({
        success: true,
        content: expectedContent,
      });
    });

    test('エラーの場合は安全にエラー情報を返す', async () => {
      // Arrange
      mockPost.mockResolvedValue({
        success: false,
        error: { message: 'ファイルが見つかりません' },
      });

      // Act
      const result = await safeGetFileContent('test-project', 'test.md');

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'ファイルが見つかりません',
      });
    });
  });

  describe('validateFileContentRequest', () => {
    test('正常なリクエストはvalidationを通過', () => {
      const result = validateFileContentRequest('test-project', 'test.md');
      expect(result).toEqual({ valid: true });
    });

    test('空のプロジェクトIDはvalidationエラー', () => {
      const result = validateFileContentRequest('', 'test.md');
      expect(result).toEqual({
        valid: false,
        error: 'プロジェクトIDが必要です',
      });
    });

    test('空のファイルパスはvalidationエラー', () => {
      const result = validateFileContentRequest('test-project', '');
      expect(result).toEqual({
        valid: false,
        error: 'ファイルパスが必要です',
      });
    });

    test('パストラバーサル攻撃はvalidationエラー', () => {
      const result = validateFileContentRequest(
        'test-project',
        '../../../etc/passwd',
      );
      expect(result).toEqual({
        valid: false,
        error: '不正なファイルパスです',
      });
    });

    test('絶対パスはvalidationエラー', () => {
      const result = validateFileContentRequest('test-project', '/etc/passwd');
      expect(result).toEqual({
        valid: false,
        error: '絶対パスは使用できません',
      });
    });
  });
});
