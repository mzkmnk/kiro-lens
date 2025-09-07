import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { ApiClient } from '@/services/api';

// ApiClientをモック
vi.mock('@/services/api');
const mockApiClient = vi.mocked(ApiClient);

// ProjectManagerコンポーネントをモック
vi.mock('./ProjectManager', () => ({
  ProjectManager: ({
    onProjectSelect,
    onAddProject,
  }: {
    onProjectSelect: (project: { id: string; name: string }) => void;
    onAddProject: () => void;
  }) => (
    <div data-testid='project-manager'>
      <button onClick={() => onProjectSelect({ id: '1', name: 'Test Project' })}>
        Select Project
      </button>
      <button onClick={onAddProject}>Add Project</button>
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

  test('プロジェクト名が表示される', () => {
    const projectName = 'my-test-project';
    render(<Dashboard projectName={projectName} />);

    // プロジェクト名がサイドバーに表示されることを確認（titleで特定）
    expect(screen.getByTitle(projectName)).toHaveTextContent(projectName);
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

  test('プロジェクト管理ボタンが表示される', () => {
    render(<Dashboard projectName='test-project' />);

    // プロジェクト管理ボタンが表示されることを確認
    expect(screen.getByLabelText('プロジェクト管理を切り替え')).toBeInTheDocument();
  });

  test('プロジェクト管理ボタンをクリックするとProjectManagerが表示される', () => {
    render(<Dashboard projectName='test-project' />);

    // 初期状態ではProjectManagerは表示されない
    expect(screen.queryByTestId('project-manager')).not.toBeInTheDocument();

    // プロジェクト管理ボタンをクリック
    fireEvent.click(screen.getByLabelText('プロジェクト管理を切り替え'));

    // ProjectManagerが表示される
    expect(screen.getByTestId('project-manager')).toBeInTheDocument();
  });

  test('プロジェクト選択時にプロジェクト名が更新される', () => {
    render(<Dashboard projectName='test-project' />);

    // プロジェクト管理を表示
    fireEvent.click(screen.getByLabelText('プロジェクト管理を切り替え'));

    // プロジェクトを選択
    fireEvent.click(screen.getByText('Select Project'));

    // プロジェクト名が更新される
    expect(screen.getByTitle('Test Project')).toBeInTheDocument();
  });
});
