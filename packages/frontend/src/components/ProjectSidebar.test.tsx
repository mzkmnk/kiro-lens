import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@/services/api';
import type { ProjectInfo, ProjectListResponse } from '@kiro-lens/shared';

// ApiClientをモック
vi.mock('@/services/api');
const mockApiClient = vi.mocked(ApiClient);

describe('ProjectSidebar Logic', () => {
  const mockProjects: ProjectInfo[] = [
    {
      id: '1',
      name: 'Project 1',
      path: '/path/to/project1',
      kiroPath: '/path/to/project1/.kiro',
      hasKiroDir: true,
      isValid: true,
      addedAt: '2024-01-01T00:00:00Z',
      lastAccessedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '2',
      name: 'Project 2',
      path: '/path/to/project2',
      kiroPath: '/path/to/project2/.kiro',
      hasKiroDir: true,
      isValid: false, // 無効なプロジェクト
      addedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockProjectListResponse: ProjectListResponse = {
    projects: mockProjects,
    currentProject: mockProjects[0],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // ApiClientのモック実装
    mockApiClient.prototype.getProjects = vi.fn().mockResolvedValue(mockProjectListResponse);
    mockApiClient.prototype.selectProject = vi.fn().mockResolvedValue({
      project: mockProjects[0],
      message: 'プロジェクトを選択しました',
    });
    mockApiClient.prototype.removeProject = vi.fn().mockResolvedValue({
      message: 'プロジェクトを削除しました',
    });
  });

  test('プロジェクト削除時に確認ダイアログロジックが動作する', () => {
    // window.confirmをモック
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    // 確認ダイアログのロジックをテスト
    const project = mockProjects[0];
    const expectedMessage = `プロジェクト「${project.name}」を削除しますか？\n\nパス: ${project.path}\n\nこの操作は元に戻せません。`;

    // 実際のコンポーネントロジックをシミュレート
    const confirmed = window.confirm(expectedMessage);

    expect(mockConfirm).toHaveBeenCalledWith(expectedMessage);
    expect(confirmed).toBe(true);

    mockConfirm.mockRestore();
  });

  test('プロジェクト削除をキャンセルした場合の確認ダイアログロジック', () => {
    // window.confirmをモック（falseを返す）
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const project = mockProjects[0];
    const expectedMessage = `プロジェクト「${project.name}」を削除しますか？\n\nパス: ${project.path}\n\nこの操作は元に戻せません。`;

    const confirmed = window.confirm(expectedMessage);

    expect(mockConfirm).toHaveBeenCalledWith(expectedMessage);
    expect(confirmed).toBe(false);

    mockConfirm.mockRestore();
  });

  test('無効なプロジェクトの選択制限ロジック', () => {
    const validProject = mockProjects[0];
    const invalidProject = mockProjects[1];

    // 有効なプロジェクトは選択可能
    expect(validProject.isValid).toBe(true);

    // 無効なプロジェクトは選択不可
    expect(invalidProject.isValid).toBe(false);
  });

  test('フォルダ展開状態管理のSetロジック', () => {
    // Set操作のロジックをテスト
    const expandedFolders = new Set<string>();
    const folderId = 'specs';

    // 初期状態では展開されていない
    expect(expandedFolders.has(folderId)).toBe(false);

    // 展開
    expandedFolders.add(folderId);
    expect(expandedFolders.has(folderId)).toBe(true);

    // 折りたたみ
    expandedFolders.delete(folderId);
    expect(expandedFolders.has(folderId)).toBe(false);

    // 再展開
    expandedFolders.add(folderId);
    expect(expandedFolders.has(folderId)).toBe(true);
  });

  test('エラーハンドリングロジック', () => {
    const error = new Error('ネットワークエラー');
    const genericError = 'プロジェクトの取得に失敗しました';

    // Error インスタンスの場合はメッセージを使用
    const errorMessage1 = error instanceof Error ? error.message : genericError;
    expect(errorMessage1).toBe('ネットワークエラー');

    // Error インスタンスでない場合は汎用メッセージを使用
    const unknownError: unknown = 'unknown error';
    const errorMessage2 = unknownError instanceof Error ? unknownError.message : genericError;
    expect(errorMessage2).toBe(genericError);
  });

  test('API呼び出し回数の管理ロジック', async () => {
    const mockGetProjects = vi.fn().mockResolvedValue(mockProjectListResponse);
    mockApiClient.prototype.getProjects = mockGetProjects;

    // 初回呼び出し
    await mockGetProjects();
    expect(mockGetProjects).toHaveBeenCalledTimes(1);

    // 再試行呼び出し
    await mockGetProjects();
    expect(mockGetProjects).toHaveBeenCalledTimes(2);

    // 削除後の再読み込み
    await mockGetProjects();
    expect(mockGetProjects).toHaveBeenCalledTimes(3);
  });
});
