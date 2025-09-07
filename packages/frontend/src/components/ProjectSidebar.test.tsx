import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ProjectSidebar } from './ProjectSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ApiClient } from '@/services/api';
import type { ProjectInfo, ProjectListResponse } from '@kiro-lens/shared';

// ApiClientをモック
vi.mock('@/services/api');
const mockApiClient = vi.mocked(ApiClient);

describe('ProjectSidebar', () => {
  const mockOnProjectSelect = vi.fn();
  const mockOnAddProject = vi.fn();
  const mockOnFileSelect = vi.fn();

  // テスト用のラッパーコンポーネント
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<SidebarProvider>{component}</SidebarProvider>);
  };

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

  test('プロジェクト選択時にAPIが呼び出される', async () => {
    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // プロジェクトをクリック
    fireEvent.click(screen.getByText('Project 1'));

    await waitFor(() => {
      expect(mockApiClient.prototype.selectProject).toHaveBeenCalledWith('1');
      expect(mockOnProjectSelect).toHaveBeenCalledWith(mockProjects[0]);
    });
  });

  test('無効なプロジェクトは選択できない', async () => {
    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });

    // 無効なプロジェクトをクリック
    fireEvent.click(screen.getByText('Project 2'));

    // APIが呼び出されない
    expect(mockApiClient.prototype.selectProject).not.toHaveBeenCalled();
    expect(mockOnProjectSelect).not.toHaveBeenCalled();
  });

  test('フォルダ展開状態が正しく管理される', async () => {
    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        currentProject={mockProjects[0]}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('specs')).toBeInTheDocument();
    });

    // 初期状態では子要素が表示されていない
    expect(screen.queryByText('kiro-lens-foundation')).not.toBeInTheDocument();

    // specsフォルダをクリックして展開
    fireEvent.click(screen.getByText('specs'));

    // サブフォルダが表示される
    await waitFor(() => {
      expect(screen.getByText('kiro-lens-foundation')).toBeInTheDocument();
    });

    // 再度クリックして折りたたみ
    fireEvent.click(screen.getByText('specs'));

    // サブフォルダが非表示になる
    await waitFor(() => {
      expect(screen.queryByText('kiro-lens-foundation')).not.toBeInTheDocument();
    });
  });

  test('プロジェクト削除時に確認ダイアログが表示される', async () => {
    // window.confirmをモック
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /プロジェクト Project 1 を削除/ });
    fireEvent.click(deleteButton);

    // 確認ダイアログが表示される
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('プロジェクト「Project 1」を削除しますか？')
    );

    await waitFor(() => {
      expect(mockApiClient.prototype.removeProject).toHaveBeenCalledWith('1');
    });

    mockConfirm.mockRestore();
  });

  test('プロジェクト削除をキャンセルした場合はAPIが呼び出されない', async () => {
    // window.confirmをモック（falseを返す）
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /プロジェクト Project 1 を削除/ });
    fireEvent.click(deleteButton);

    // 確認ダイアログが表示される
    expect(mockConfirm).toHaveBeenCalled();

    // APIが呼び出されない
    expect(mockApiClient.prototype.removeProject).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  test('エラー発生時に再試行機能が動作する', async () => {
    // エラーを返すモック
    const mockGetProjects = vi.fn().mockRejectedValue(new Error('ネットワークエラー'));
    mockApiClient.prototype.getProjects = mockGetProjects;

    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ネットワークエラー')).toBeInTheDocument();
    });

    // 初回呼び出しを確認
    expect(mockGetProjects).toHaveBeenCalledTimes(1);

    // 再試行ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText('再試行'));
    });

    // 2回目の呼び出しを確認
    expect(mockGetProjects).toHaveBeenCalledTimes(2);
  });

  test('プロジェクト削除後にプロジェクト一覧が再読み込みされる', async () => {
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: /プロジェクト Project 1 を削除/ });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockApiClient.prototype.removeProject).toHaveBeenCalledWith('1');
    });

    // プロジェクト一覧が再読み込みされる（初回 + 削除後の再読み込み）
    expect(mockApiClient.prototype.getProjects).toHaveBeenCalledTimes(2);

    mockConfirm.mockRestore();
  });

  test('ファイル選択時にコールバックが呼び出される', async () => {
    renderWithProvider(
      <ProjectSidebar
        onProjectSelect={mockOnProjectSelect}
        currentProject={mockProjects[0]}
        onAddProject={mockOnAddProject}
        onFileSelect={mockOnFileSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('specs')).toBeInTheDocument();
    });

    // specsフォルダを展開
    fireEvent.click(screen.getByText('specs'));

    await waitFor(() => {
      expect(screen.getByText('kiro-lens-foundation')).toBeInTheDocument();
    });

    // kiro-lens-foundationフォルダを展開
    fireEvent.click(screen.getByText('kiro-lens-foundation'));

    await waitFor(() => {
      expect(screen.getByText('requirements.md')).toBeInTheDocument();
    });

    // ファイルをクリック
    fireEvent.click(screen.getByText('requirements.md'));

    expect(mockOnFileSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'requirements.md',
        type: 'file',
      })
    );
  });
});
