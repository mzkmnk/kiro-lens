import { describe, test, expect, vi } from 'vitest';
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

describe('MainContent', () => {
  test('基本コンテンツ表示のテスト', () => {
    render(<MainContent hasKiroDir={true} />);

    // メインコンテンツエリアが表示される
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('プロジェクト選択時は空の状態が表示される', () => {
    render(<MainContent hasKiroDir={true} />);

    // PathInputコンポーネントは表示されない
    expect(screen.queryByTestId('path-input')).not.toBeInTheDocument();
  });

  test('プロジェクト追加画面が表示される', () => {
    render(<MainContent hasKiroDir={false} />);

    // PathInputコンポーネントが表示される
    expect(screen.getByTestId('path-input')).toBeInTheDocument();
  });

  test('PathInputコンポーネントが表示される', () => {
    render(<MainContent hasKiroDir={false} />);

    // PathInputコンポーネントが表示される
    expect(screen.getByTestId('path-input')).toBeInTheDocument();
  });

  test('プロジェクト追加コールバックが正しく動作する', () => {
    const onProjectAdd = vi.fn();
    render(<MainContent hasKiroDir={false} onProjectAdd={onProjectAdd} />);

    // PathInputのモックボタンをクリック
    const mockButton = screen.getByText('Mock PathInput');
    mockButton.click();

    expect(onProjectAdd).toHaveBeenCalledWith('/test/path');
  });

  test('.kiroディレクトリ存在時は空の状態が表示される', () => {
    render(<MainContent hasKiroDir={true} />);

    // PathInputコンポーネントは表示されない
    expect(screen.queryByTestId('path-input')).not.toBeInTheDocument();
  });
});
