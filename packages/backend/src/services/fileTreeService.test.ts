import { MOCK_INVALID_PROJECT, MOCK_PROJECT } from '@kiro-lens/shared';
import mockFs from 'mock-fs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { FileTreeError, getProjectFiles } from './fileTreeService';
import { getProjectById } from './projectService';

// モック設定
vi.mock('./projectService.js', () => ({
  getProjectById: vi.fn(),
}));

const mockGetProjectById = vi.mocked(getProjectById);

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
      mockGetProjectById.mockResolvedValue(null);

      // Act & Assert
      await expect(getProjectFiles(projectId)).rejects.toThrow(FileTreeError);
      await expect(getProjectFiles(projectId)).rejects.toThrow(
        '指定されたプロジェクトが見つかりません'
      );
    });

    test('プロジェクトIDが一致しない場合はエラーを投げる', async () => {
      // Arrange
      const projectId = 'different-project-id';
      mockGetProjectById.mockResolvedValue(null);

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
      mockGetProjectById.mockResolvedValue(mockProject);

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
      mockGetProjectById.mockResolvedValue(mockProject);

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
      mockGetProjectById.mockResolvedValue(mockProject);

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
      mockGetProjectById.mockResolvedValue(mockProject);

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
      mockGetProjectById.mockResolvedValue(mockProject);

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
        path: 'config.json',
        type: 'file',
        size: expect.any(Number),
      });
      expect(sortedResult[1]).toEqual({
        id: expect.stringMatching(/^files-only-project\/.kiro\/README\.md$/),
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        size: expect.any(Number),
      });
    });

    test('実際の.kiro構造（specs/steeringフォルダ）の場合は正しいFileItem配列を返す', async () => {
      // Arrange
      const projectId = 'real-kiro-structure-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'real-kiro-structure-project',
        name: 'Real Kiro Structure Project',
        path: '/real/kiro/structure/project',
        kiroPath: '/real/kiro/structure/project/.kiro',
      };
      mockGetProjectById.mockResolvedValue(mockProject);

      // mock-fsで実際の.kiro構造を作成
      mockFs({
        '/real/kiro/structure/project/.kiro': {
          specs: {
            'file-tree-system': {
              'requirements.md': '# Requirements',
              'design.md': '# Design',
              'tasks.md': '# Tasks',
            },
            'kiro-lens-foundation': {
              'requirements.md': '# Foundation Requirements',
              'design.md': '# Foundation Design',
              'tasks.md': '# Foundation Tasks',
            },
          },
          steering: {
            'behavior.md': '# Behavior',
            'tech.md': '# Tech',
            'product.md': '# Product',
            'structure.md': '# Structure',
          },
        },
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toHaveLength(2);

      // ファイルはアルファベット順でソートされる
      const sortedResult = result.sort((a, b) => a.name.localeCompare(b.name));

      // specs フォルダの検証
      expect(sortedResult[0]).toEqual({
        id: expect.stringMatching(/^real-kiro-structure-project\/.kiro\/specs$/),
        name: 'specs',
        path: 'specs',
        type: 'folder',
        children: expect.arrayContaining([
          {
            id: expect.stringMatching(
              /^real-kiro-structure-project\/.kiro\/specs\/file-tree-system$/
            ),
            name: 'file-tree-system',
            path: 'specs/file-tree-system',
            type: 'folder',
            children: expect.arrayContaining([
              {
                id: expect.stringMatching(
                  /^real-kiro-structure-project\/.kiro\/specs\/file-tree-system\/design\.md$/
                ),
                name: 'design.md',
                path: 'specs/file-tree-system/design.md',
                type: 'file',
                size: expect.any(Number),
              },
              {
                id: expect.stringMatching(
                  /^real-kiro-structure-project\/.kiro\/specs\/file-tree-system\/requirements\.md$/
                ),
                name: 'requirements.md',
                path: 'specs/file-tree-system/requirements.md',
                type: 'file',
                size: expect.any(Number),
              },
              {
                id: expect.stringMatching(
                  /^real-kiro-structure-project\/.kiro\/specs\/file-tree-system\/tasks\.md$/
                ),
                name: 'tasks.md',
                path: 'specs/file-tree-system/tasks.md',
                type: 'file',
                size: expect.any(Number),
              },
            ]),
          },
          {
            id: expect.stringMatching(
              /^real-kiro-structure-project\/.kiro\/specs\/kiro-lens-foundation$/
            ),
            name: 'kiro-lens-foundation',
            path: 'specs/kiro-lens-foundation',
            type: 'folder',
            children: expect.arrayContaining([
              {
                id: expect.stringMatching(
                  /^real-kiro-structure-project\/.kiro\/specs\/kiro-lens-foundation\/design\.md$/
                ),
                name: 'design.md',
                path: 'specs/kiro-lens-foundation/design.md',
                type: 'file',
                size: expect.any(Number),
              },
              {
                id: expect.stringMatching(
                  /^real-kiro-structure-project\/.kiro\/specs\/kiro-lens-foundation\/requirements\.md$/
                ),
                name: 'requirements.md',
                path: 'specs/kiro-lens-foundation/requirements.md',
                type: 'file',
                size: expect.any(Number),
              },
              {
                id: expect.stringMatching(
                  /^real-kiro-structure-project\/.kiro\/specs\/kiro-lens-foundation\/tasks\.md$/
                ),
                name: 'tasks.md',
                path: 'specs/kiro-lens-foundation/tasks.md',
                type: 'file',
                size: expect.any(Number),
              },
            ]),
          },
        ]),
      });

      // steering フォルダの検証
      expect(sortedResult[1]).toEqual({
        id: expect.stringMatching(/^real-kiro-structure-project\/.kiro\/steering$/),
        name: 'steering',
        path: 'steering',
        type: 'folder',
        children: expect.arrayContaining([
          {
            id: expect.stringMatching(
              /^real-kiro-structure-project\/.kiro\/steering\/behavior\.md$/
            ),
            name: 'behavior.md',
            path: 'steering/behavior.md',
            type: 'file',
            size: expect.any(Number),
          },
          {
            id: expect.stringMatching(
              /^real-kiro-structure-project\/.kiro\/steering\/product\.md$/
            ),
            name: 'product.md',
            path: 'steering/product.md',
            type: 'file',
            size: expect.any(Number),
          },
          {
            id: expect.stringMatching(
              /^real-kiro-structure-project\/.kiro\/steering\/structure\.md$/
            ),
            name: 'structure.md',
            path: 'steering/structure.md',
            type: 'file',
            size: expect.any(Number),
          },
          {
            id: expect.stringMatching(/^real-kiro-structure-project\/.kiro\/steering\/tech\.md$/),
            name: 'tech.md',
            path: 'steering/tech.md',
            type: 'file',
            size: expect.any(Number),
          },
        ]),
      });
    });

    test('実際の.kiro構造に追加ファイルがある場合は正しいFileItem配列を返す', async () => {
      // Arrange
      const projectId = 'extended-kiro-structure-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'extended-kiro-structure-project',
        name: 'Extended Kiro Structure Project',
        path: '/extended/kiro/structure/project',
        kiroPath: '/extended/kiro/structure/project/.kiro',
      };
      mockGetProjectById.mockResolvedValue(mockProject);

      // mock-fsで実際の.kiro構造に追加ファイルを含む構造を作成
      mockFs({
        '/extended/kiro/structure/project/.kiro': {
          'config.json': '{}', // 追加のルートファイル
          specs: {
            'file-tree-system': {
              'requirements.md': '# Requirements',
              'design.md': '# Design',
              'tasks.md': '# Tasks',
            },
            'msw-integration': {
              'requirements.md': '# MSW Requirements',
              'design.md': '# MSW Design',
              'tasks.md': '# MSW Tasks',
            },
          },
          steering: {
            'behavior.md': '# Behavior',
            'tech.md': '# Tech',
            'product.md': '# Product',
          },
          'README.md': '# Project README', // 追加のルートファイル
        },
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toHaveLength(4); // config.json, README.md, specs, steering

      // ファイルとフォルダが混在していることを確認
      const fileItems = result.filter(item => item.type === 'file');
      const folderItems = result.filter(item => item.type === 'folder');

      expect(fileItems).toHaveLength(2); // config.json, README.md
      expect(folderItems).toHaveLength(2); // specs, steering

      // specsフォルダに複数のspecフォルダがあることを確認
      const specsFolder = folderItems.find(item => item.name === 'specs');
      expect(specsFolder?.children).toHaveLength(2);

      // 各specフォルダに3つのファイル（requirements.md, design.md, tasks.md）があることを確認
      const fileTreeSystemSpec = specsFolder?.children?.find(
        child => child.name === 'file-tree-system'
      );
      expect(fileTreeSystemSpec?.children).toHaveLength(3);

      // steeringフォルダに複数のファイルがあることを確認
      const steeringFolder = folderItems.find(item => item.name === 'steering');
      expect(steeringFolder?.children).toHaveLength(3);
    });

    test('複数のspecフォルダを含む実際の.kiro構造の階層確認', async () => {
      // Arrange
      const projectId = 'full-kiro-structure-project';
      const mockProject = {
        ...MOCK_PROJECT,
        id: 'full-kiro-structure-project',
        name: 'Full Kiro Structure Project',
        path: '/full/kiro/structure/project',
        kiroPath: '/full/kiro/structure/project/.kiro',
      };
      mockGetProjectById.mockResolvedValue(mockProject);

      // mock-fsで実際の.kiro構造（3階層）を作成
      mockFs({
        '/full/kiro/structure/project/.kiro': {
          specs: {
            'file-tree-system': {
              'requirements.md': '# File Tree Requirements',
              'design.md': '# File Tree Design',
              'tasks.md': '# File Tree Tasks',
            },
            'kiro-lens-foundation': {
              'requirements.md': '# Foundation Requirements',
              'design.md': '# Foundation Design',
              'tasks.md': '# Foundation Tasks',
            },
            'path-management-system': {
              'requirements.md': '# Path Management Requirements',
              'design.md': '# Path Management Design',
              'tasks.md': '# Path Management Tasks',
            },
          },
          steering: {
            'behavior.md': '# Behavior Guidelines',
            'tech.md': '# Tech Stack',
            'product.md': '# Product Overview',
            'structure.md': '# Project Structure',
            'testing-guidelines.md': '# Testing Guidelines',
          },
        },
      });

      // Act
      const result = await getProjectFiles(projectId);

      // Assert
      expect(result).toHaveLength(2); // specs, steering

      // specs フォルダの階層確認
      const specsFolder = result.find(item => item.name === 'specs');
      expect(specsFolder?.type).toBe('folder');
      expect(specsFolder?.children).toHaveLength(3); // 3つのspecフォルダ

      // 各specフォルダに3つのファイルがあることを確認
      const fileTreeSystemSpec = specsFolder?.children?.find(
        child => child.name === 'file-tree-system'
      );
      expect(fileTreeSystemSpec?.type).toBe('folder');
      expect(fileTreeSystemSpec?.children).toHaveLength(3); // requirements.md, design.md, tasks.md

      // steering フォルダの階層確認
      const steeringFolder = result.find(item => item.name === 'steering');
      expect(steeringFolder?.type).toBe('folder');
      expect(steeringFolder?.children).toHaveLength(5); // 5つのsteeringファイル

      // steeringフォルダ内はファイルのみであることを確認
      const steeringFiles = steeringFolder?.children?.every(child => child.type === 'file');
      expect(steeringFiles).toBe(true);
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
      mockGetProjectById.mockResolvedValue(mockProject);

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
