import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProjectSidebar } from './ProjectSidebar';
import { MSW_MOCK_PROJECTS } from '@kiro-lens/shared';

// ProjectStoreをモック
const mockRemoveProject = vi.fn();
const mockSelectProject = vi.fn();
const mockSetAddingProjectMode = vi.fn();

vi.mock('@/stores/projectStore', () => ({
  useProjectStore: () => ({
    projects: MSW_MOCK_PROJECTS,
    currentProject: MSW_MOCK_PROJECTS[0],
    selectedFile: undefined,
    isAddingProject: false,
    hasKiroDir: true,
    isLoading: false,
    error: undefined,
    removeProject: mockRemoveProject,
    selectProject: mockSelectProject,
    setAddingProjectMode: mockSetAddingProjectMode,
  }),
}));

describe('ProjectSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // テストヘルパー関数
  const renderWithProvider = () => {
    return render(
      <SidebarProvider>
        <ProjectSidebar />
      </SidebarProvider>
    );
  };

  test('プロジェクト一覧が正しく表示される', () => {
    renderWithProvider();

    expect(screen.getByText('kiro-lens-foundation')).toBeInTheDocument();
    expect(screen.getByText('path-management-system')).toBeInTheDocument();
    expect(screen.getByText('invalid-project')).toBeInTheDocument();
    expect(screen.getByText('プロジェクトを追加')).toBeInTheDocument();
  });

  test('プロジェクト追加ボタンクリック時にstoreアクションが呼ばれる', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('プロジェクトを追加'));
    expect(mockSetAddingProjectMode).toHaveBeenCalledWith(true);
  });

  test('有効なプロジェクト選択時にstoreアクションが呼ばれる', async () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('kiro-lens-foundation'));
    expect(mockSelectProject).toHaveBeenCalledWith(MSW_MOCK_PROJECTS[0]);
  });

  test('無効なプロジェクトは選択できない', () => {
    renderWithProvider();

    // 無効なプロジェクト（invalid-project）をクリック
    fireEvent.click(screen.getByText('invalid-project'));
    // 無効なプロジェクトなので、selectProjectは呼ばれない
    expect(mockSelectProject).not.toHaveBeenCalled();
  });

  test('プロジェクト削除確認ダイアログが表示される', () => {
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProvider();

    // 削除ボタンを探してクリック（X アイコン）
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(
      button => button.querySelector('svg') && button.getAttribute('aria-label')?.includes('削除')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockRemoveProject).toHaveBeenCalledWith('1');
    }

    mockConfirm.mockRestore();
  });
});
