import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import mockFs from 'mock-fs';
import { MOCK_PROJECT, MOCK_INVALID_PROJECT } from '@kiro-lens/shared';
import { getProjectFiles, FileTreeError } from './fileTreeService.js';
import { getCurrentProject } from './projectService.js';

// モック設定
vi.mock('./projectService.js', () => ({
  getCurrentProject: vi.fn(),
}));

const mockGetCurrentProject = vi.mocked(getCurrentProject);

describe('FileTreeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe('getProjectFiles', () => {
    test('プロジェクトが存在しない場合はエラーを投げる', async () => {
      // Arrange
      const projectId = 'non-existent-project';
      mockGetCurrentProject.mockResolvedValue(null);

      // Act & Assert
      await expect(getProjectFiles(projectId)).rejects.toThrow(FileTreeError);
      await expect(getProjectFiles(projectId)).rejects.toThrow('プロジェクトが見つかりません');
    });

    test('プロジェクトIDが一致しない場合はエラーを投げる', async () => {
      // Arrange
      const projectId = 'different-project-id';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'current-project-id',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(getProjectFiles(projectId)).rejects.toThrow(FileTreeError);
      await expect(getProjectFiles(projectId)).rejects.toThrow(
        '指定されたプロジェクトが見つかりません'
      );
    });

    test('プロジェクトが無効な場合はエラーを投げる', async () => {
      // Arrange
      const projectId = 'invalid-project';
      const mockProject = {
        ...MOCK_INVALID_PROJECT,
        id: 'invalid-project',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(getProjectFiles(projectId)).rejects.toThrow(FileTreeError);
      await expect(getProjectFiles(projectId)).rejects.toThrow('プロジェクトが無効です');
    });

    test('.kiroディレクトリが存在しない場合はエラーを投げる', async () => {
      // Arrange
      const projectId = 'no-kiro-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'no-kiro-project',
        name: 'No Kiro Project',
        path: '/no/kiro/project',
        kiroPath: '/no/kiro/project/.kiro',
        hasKiroDir: false,
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(getProjectFiles(projectId)).rejects.toThrow(FileTreeError);
      await expect(getProjectFiles(projectId)).rejects.toThrow('.kiroディレクトリが存在しません');
    });

    test('ファイル読み取り権限がない場合はエラーを投げる', async () => {
      // Arrange
      const projectId = 'permission-denied-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'permission-denied-project',
        name: 'Permission Denied Project',
        path: '/permission/denied/project',
        kiroPath: '/permission/denied/project/.kiro',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // mock-fsで権限エラーをシミュレート
      mockFs({
        '/permission/denied/project/.kiro': mockFs.directory({
          mode: 0o000, // 読み取り権限なし
        }),
      });

      // Act & Assert
      await expect(getProjectFiles(projectId)).rejects.toThrow(FileTreeError);
      await expect(getProjectFiles(projectId)).rejects.toThrow(
        'ディレクトリへの読み取り権限がありません'
      );
    });

    test('空の.kiroディレクトリの場合は空配列を返す', async () => {
      // Arrange
      const projectId = 'empty-kiro-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'empty-kiro-project',
        name: 'Empty Kiro Project',
        path: '/empty/kiro/project',
        kiroPath: '/empty/kiro/project/.kiro',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // mock-fsで空のディレクトリを作成
      mockFs({
        '/empty/kiro/project/.kiro': {},
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toEqual([]);
    });

    test('ファイルのみの.kiroディレクトリの場合は正しいFileItem配列を返す', async () => {
      // Arrange
      const projectId = 'files-only-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'files-only-project',
        name: 'Files Only Project',
        path: '/files/only/project',
        kiroPath: '/files/only/project/.kiro',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // mock-fsでファイルのみのディレクトリを作成
      mockFs({
        '/files/only/project/.kiro': {
          'config.json': '{}',
          'README.md': '# README',
        },
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toHaveLength(2);

      // ファイルはアルファベット順でソートされる
      const sortedResult = result.sort((a, b) => a.name.localeCompare(b.name));
      expect(sortedResult[0]).toEqual({
        id: expect.stringMatching(/^files-only-project\/.kiro\/config\.json$/),
        name: 'config.json',
        type: 'file',
      });
      expect(sortedResult[1]).toEqual({
        id: expect.stringMatching(/^files-only-project\/.kiro\/README\.md$/),
        name: 'README.md',
        type: 'file',
      });
    });

    test('フォルダのみの.kiroディレクトリの場合は正しいFileItem配列を返す', async () => {
      // Arrange
      const projectId = 'folders-only-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'folders-only-project',
        name: 'Folders Only Project',
        path: '/folders/only/project',
        kiroPath: '/folders/only/project/.kiro',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // mock-fsでフォルダのみのディレクトリを作成
      mockFs({
        '/folders/only/project/.kiro': {
          specs: {
            'feature1.md': '# Feature 1',
          },
          steering: {
            'rules.md': '# Rules',
          },
        },
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: expect.stringMatching(/^folders-only-project\/.kiro\/specs$/),
        name: 'specs',
        type: 'folder',
        children: [
          {
            id: expect.stringMatching(/^folders-only-project\/.kiro\/specs\/feature1\.md$/),
            name: 'feature1.md',
            type: 'file',
          },
        ],
      });
      expect(result[1]).toEqual({
        id: expect.stringMatching(/^folders-only-project\/.kiro\/steering$/),
        name: 'steering',
        type: 'folder',
        children: [
          {
            id: expect.stringMatching(/^folders-only-project\/.kiro\/steering\/rules\.md$/),
            name: 'rules.md',
            type: 'file',
          },
        ],
      });
    });

    test('混在する.kiroディレクトリの場合は正しいFileItem配列を返す', async () => {
      // Arrange
      const projectId = 'mixed-content-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'mixed-content-project',
        name: 'Mixed Content Project',
        path: '/mixed/content/project',
        kiroPath: '/mixed/content/project/.kiro',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // mock-fsで混在するディレクトリを作成
      mockFs({
        '/mixed/content/project/.kiro': {
          'config.json': '{}',
          specs: {
            'feature1.md': '# Feature 1',
            'feature2.md': '# Feature 2',
          },
          'README.md': '# README',
        },
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toHaveLength(3);

      // ファイルとフォルダが混在していることを確認
      const fileItems = result.filter(item => item.type === 'file');
      const folderItems = result.filter(item => item.type === 'folder');

      expect(fileItems).toHaveLength(2);
      expect(folderItems).toHaveLength(1);

      // フォルダに子要素があることを確認
      const specsFolder = folderItems.find(item => item.name === 'specs');
      expect(specsFolder?.children).toHaveLength(2);
    });

    test('ネストしたディレクトリ構造の場合は正しい階層構造を返す', async () => {
      // Arrange
      const projectId = 'nested-structure-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'nested-structure-project',
        name: 'Nested Structure Project',
        path: '/nested/structure/project',
        kiroPath: '/nested/structure/project/.kiro',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // mock-fsで3階層のネスト構造を作成
      mockFs({
        '/nested/structure/project/.kiro': {
          level1: {
            level2: {
              'deep-file.txt': 'deep content',
            },
          },
        },
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('level1');
      expect(result[0].type).toBe('folder');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].name).toBe('level2');
      expect(result[0].children![0].type).toBe('folder');
      expect(result[0].children![0].children).toHaveLength(1);
      expect(result[0].children![0].children![0].name).toBe('deep-file.txt');
      expect(result[0].children![0].children![0].type).toBe('file');
    });

    test('ファイルシステムエラーが発生した場合は適切なエラーを投げる', async () => {
      // Arrange
      const projectId = 'filesystem-error-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'filesystem-error-project',
        name: 'Filesystem Error Project',
        path: '/filesystem/error/project',
        kiroPath: '/filesystem/error/project/.kiro',
      };
      mockGetCurrentProject.mockResolvedValue(mockProject);

      // mock-fsで存在しないディレクトリを設定（ファイルシステムエラーをシミュレート）
      mockFs({
        // .kiroディレクトリを作成しない
      });

      // Act & Assert
      await expect(getProjectFiles(projectId)).rejects.toThrow(FileTreeError);
      await expect(getProjectFiles(projectId)).rejects.toThrow('ディレクトリが存在しません');
    });
  });
});
