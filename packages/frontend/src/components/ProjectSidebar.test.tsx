import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProjectSidebar } from './ProjectSidebar';
import type { ProjectInfo } from '@kiro-lens/shared';

describe('ProjectSidebar', () => {
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

  const defaultProps = {
    projects: mockProjects,
    currentProject: mockProjects[0],
    isLoading: false,
    error: undefined as string | undefined,
    onProjectSelect: vi.fn(),
    onProjectDelete: vi.fn(),
    onAddProject: vi.fn(),
    onFileSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // テストヘルパー関数
  const renderWithProvider = (props = defaultProps) => {
    return render(
      <SidebarProvider>
        <ProjectSidebar {...props} />
      </SidebarProvider>
    );
  };

  test('プロジェクト一覧が正しく表示される', () => {
    renderWithProvider();

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
    expect(screen.getByText('プロジェクトを追加')).toBeInTheDocument();
  });

  test('ローディング状態が正しく表示される', () => {
    renderWithProvider({ ...defaultProps, isLoading: true });

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  test('エラー状態が正しく表示される', () => {
    const errorMessage = 'プロジェクトの取得に失敗しました';
    renderWithProvider({ ...defaultProps, error: errorMessage });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('再読み込み')).toBeInTheDocument();
  });

  test('プロジェクト追加ボタンクリック時にコールバックが呼ばれる', () => {
    const mockOnAddProject = vi.fn();
    renderWithProvider({ ...defaultProps, onAddProject: mockOnAddProject });

    fireEvent.click(screen.getByText('プロジェクトを追加'));
    expect(mockOnAddProject).toHaveBeenCalledTimes(1);
  });

  test('有効なプロジェクト選択時にコールバックが呼ばれる', () => {
    const mockOnProjectSelect = vi.fn();
    renderWithProvider({ ...defaultProps, onProjectSelect: mockOnProjectSelect });

    fireEvent.click(screen.getByText('Project 1'));
    expect(mockOnProjectSelect).toHaveBeenCalledWith(mockProjects[0]);
  });

  test('無効なプロジェクトは選択できない', () => {
    const mockOnProjectSelect = vi.fn();
    renderWithProvider({ ...defaultProps, onProjectSelect: mockOnProjectSelect });

    // 無効なプロジェクトをクリック
    fireEvent.click(screen.getByText('Project 2'));
    expect(mockOnProjectSelect).not.toHaveBeenCalled();
  });

  test('プロジェクト削除確認ダイアログが表示される', () => {
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const mockOnProjectDelete = vi.fn();

    renderWithProvider({ ...defaultProps, onProjectDelete: mockOnProjectDelete });

    // 削除ボタンを探してクリック（X アイコン）
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(
      button => button.querySelector('svg') && button.getAttribute('aria-label')?.includes('削除')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockOnProjectDelete).toHaveBeenCalledWith('1');
    }

    mockConfirm.mockRestore();
  });
});
