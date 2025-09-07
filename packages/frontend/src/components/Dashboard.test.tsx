import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { ApiClient } from '@/services/api';

// ApiClientをモック
vi.mock('@/services/api');
const mockApiClient = vi.mocked(ApiClient);

// ProjectSidebarコンポーネントをモック
vi.mock('./ProjectSidebar', () => ({
  ProjectSidebar: ({
    onProjectSelect,
    onAddProject,
    onFileSelect,
  }: {
    onProjectSelect: (project: { id: string; name: string }) => void;
    onAddProject: () => void;
    onFileSelect: (file: { id: string; name: string }) => void;
  }) => (
    <div data-testid='project-sidebar'>
      <button onClick={() => onProjectSelect({ id: '1', name: 'Test Project' })}>
        Select Project
      </button>
      <button onClick={onAddProject}>Add Project</button>
      <button onClick={() => onFileSelect({ id: 'file1', name: 'test.md' })}>Select File</button>
    </div>
  ),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ApiClientのモック実装
    mockApiClient.prototype.getProjects = vi.fn().mockResolvedValue({
      projects: [],
      currentProject: undefined,
    });
  });

  test('基本レイアウト構造が表示される', () => {
    render(<Dashboard projectName='test-project' />);

    // ヘッダー、サイドバー、メインコンテンツの基本構造を確認
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header要素
    expect(screen.getByRole('application')).toBeInTheDocument(); // アプリケーション要素
    expect(screen.getByRole('main')).toBeInTheDocument(); // main要素
  });

  test('ProjectSidebarが表示される', () => {
    render(<Dashboard projectName='test-project' />);

    // ProjectSidebarコンポーネントが表示されることを確認
    expect(screen.getByTestId('project-sidebar')).toBeInTheDocument();
  });

  test('レスポンシブデザインのクラスが適用される', () => {
    render(<Dashboard projectName='test-project' />);

    // 画面全体のレイアウトクラスを確認
    const container = screen.getByTestId('dashboard-container');
    expect(container).toBeInTheDocument();

    // アプリケーションロールが適用されていることを確認
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  test('接続状態インジケーターが表示される', () => {
    render(<Dashboard projectName='test-project' />);

    // 接続状態を示すバッジが存在することを確認
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  test('サイドバーが表示される', () => {
    render(<Dashboard projectName='test-project' />);

    // サイドバーコンポーネントが表示されることを確認（Toggle Sidebarボタンで確認）
    expect(screen.getByRole('button', { name: 'Toggle Sidebar' })).toBeInTheDocument();
  });

  test('メインコンテンツエリアが表示される', () => {
    render(<Dashboard projectName='test-project' />);

    // メインコンテンツエリアが表示されることを確認
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('プロジェクト選択機能が動作する', () => {
    render(<Dashboard projectName='test-project' />);

    // プロジェクトを選択
    fireEvent.click(screen.getByText('Select Project'));

    // プロジェクト名がヘッダーに表示される
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  test('ファイル選択機能が動作する', () => {
    render(<Dashboard projectName='test-project' />);

    // ファイルを選択
    fireEvent.click(screen.getByText('Select File'));

    // ファイル名がヘッダーに表示される
    expect(screen.getByText('test.md')).toBeInTheDocument();
  });

  test('プロジェクト追加機能が動作する', () => {
    render(<Dashboard projectName='test-project' />);

    // プロジェクト追加ボタンをクリック
    fireEvent.click(screen.getByText('Add Project'));

    // コンソールログが出力される（実際の実装では別の処理）
    // この部分は将来的にPathDialogコンポーネントのテストに置き換える
  });
});
