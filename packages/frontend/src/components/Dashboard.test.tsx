import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import type { ProjectInfo } from '@kiro-lens/shared';
import type { FileItem } from '@shared/types/file-tree';

// ProjectSidebarコンポーネントをモック
vi.mock('./ProjectSidebar', () => ({
  ProjectSidebar: ({
    onProjectSelect,
    onAddProject,
    onFileSelect,
  }: {
    onProjectSelect: (project: ProjectInfo) => void;
    onAddProject: () => void;
    onFileSelect: (file: FileItem) => void;
  }) => (
    <div data-testid='project-sidebar'>
      <button
        onClick={() =>
          onProjectSelect({
            id: '1',
            name: 'Test Project',
            path: '/test/path',
            kiroPath: '/test/path/.kiro',
            hasKiroDir: true,
            isValid: true,
            addedAt: '2024-01-01T00:00:00Z',
          })
        }
      >
        Select Project
      </button>
      <button onClick={onAddProject}>Add Project</button>
      <button
        onClick={() =>
          onFileSelect({
            id: 'file1',
            name: 'test.md',
            type: 'file',
            path: '/test/path/.kiro/test.md',
          })
        }
      >
        Select File
      </button>
    </div>
  ),
}));

// MainContentコンポーネントをモック
vi.mock('./MainContent', () => ({
  MainContent: ({ hasKiroDir }: { hasKiroDir: boolean }) => (
    <div data-testid='main-content' data-has-kiro-dir={hasKiroDir}>
      Main Content
    </div>
  ),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('プロジェクト選択時に状態が正しく更新される', () => {
    render(<Dashboard projectName='test-project' />);

    // 初期状態ではプロジェクト名が表示されていない
    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();

    // プロジェクトを選択
    fireEvent.click(screen.getByText('Select Project'));

    // プロジェクト名がヘッダーに表示される
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  test('ファイル選択時に状態が正しく更新される', () => {
    render(<Dashboard projectName='test-project' />);

    // 初期状態ではファイル名が表示されていない
    expect(screen.queryByText('test.md')).not.toBeInTheDocument();

    // ファイルを選択
    fireEvent.click(screen.getByText('Select File'));

    // ファイル名がヘッダーに表示される
    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  test('プロジェクト切り替え時にファイル選択がクリアされる', () => {
    render(<Dashboard projectName='test-project' />);

    // ファイルを選択
    fireEvent.click(screen.getByText('Select File'));
    expect(screen.getByText('test.md')).toBeInTheDocument();

    // プロジェクトを選択（切り替え）
    fireEvent.click(screen.getByText('Select Project'));

    // ファイル名が表示されなくなる（クリアされる）
    expect(screen.queryByText('test.md')).not.toBeInTheDocument();
  });

  test('プロジェクト選択時にhasKiroDirが正しく更新される', () => {
    render(<Dashboard projectName='test-project' />);

    // プロジェクトを選択
    fireEvent.click(screen.getByText('Select Project'));

    // MainContentにhasKiroDir=trueが渡される
    const mainContent = screen.getByTestId('main-content');
    expect(mainContent).toHaveAttribute('data-has-kiro-dir', 'true');
  });
});
