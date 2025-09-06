import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainContent } from './MainContent';

describe('MainContent', () => {
  test('基本コンテンツ表示のテスト', () => {
    render(<MainContent hasKiroDir={true} />);

    // メインコンテンツエリアが表示される
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('ウェルカムメッセージ表示のテスト', () => {
    render(<MainContent hasKiroDir={true} />);

    // ウェルカムメッセージが表示される
    expect(screen.getByText(/kiro-lens/i)).toBeInTheDocument();
    expect(screen.getByText(/ダッシュボード/i)).toBeInTheDocument();
  });

  test('.kiroディレクトリ未存在時のメッセージテスト', () => {
    render(<MainContent hasKiroDir={false} />);

    // .kiroディレクトリが見つからないメッセージが表示される
    expect(screen.getByText(/\.kiroディレクトリが見つかりません/i)).toBeInTheDocument();
    expect(
      screen.getByText(/このプロジェクトのルートディレクトリに\.kiroディレクトリが存在しません/i)
    ).toBeInTheDocument();
  });

  test('.kiroディレクトリ存在時は通常のコンテンツが表示される', () => {
    render(<MainContent hasKiroDir={true} />);

    // エラーメッセージは表示されない
    expect(screen.queryByText(/\.kiroディレクトリが見つかりません/i)).not.toBeInTheDocument();

    // 通常のウェルカムコンテンツが表示される
    expect(screen.getByText(/ようこそ/i)).toBeInTheDocument();
  });
});
