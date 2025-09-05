import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
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
});
