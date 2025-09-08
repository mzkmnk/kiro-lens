import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainContent } from './MainContent';

// PathInputコンポーネントをモック
vi.mock('./PathInput', () => ({
  PathInput: ({ onPathConfirm }: { onPathConfirm: (path: string) => void }) => (
    <div data-testid='path-input'>
      <button onClick={() => onPathConfirm('/test/path')}>Mock PathInput</button>
    </div>
  ),
}));

// ProjectStoreをモック
const mockAddProject = vi.fn();

vi.mock('@/stores/projectStore', () => ({
  useProjectStore: () => ({
    hasKiroDir: false, // デフォルトはfalse（プロジェクト追加画面を表示）
    addProject: mockAddProject,
  }),
}));

describe('MainContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('基本コンテンツ表示のテスト', () => {
    render(<MainContent />);

    // メインコンテンツエリアが表示される
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('プロジェクト追加画面が表示される（hasKiroDir: false）', () => {
    render(<MainContent />);

    // PathInputコンポーネントが表示される（デフォルトのモック設定）
    expect(screen.getByTestId('path-input')).toBeInTheDocument();
  });

  test('プロジェクト追加時にstoreアクションが呼ばれる', async () => {
    render(<MainContent />);

    // PathInputのモックボタンをクリック
    const mockButton = screen.getByText('Mock PathInput');
    mockButton.click();

    expect(mockAddProject).toHaveBeenCalledWith('/test/path');
  });
});
