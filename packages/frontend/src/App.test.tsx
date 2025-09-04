import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders basic dashboard layout', () => {
    render(<App />);

    // 要件3.1: 基本的なダッシュボードレイアウトを表示する
    expect(screen.getByRole('main')).toBeDefined();
    expect(screen.getByText('Kiro Lens')).toBeDefined();
  });

  test('displays project information', () => {
    render(<App />);

    // 要件3.2: プロジェクト名を表示する
    expect(screen.getByText('Kiro Lens')).toBeDefined();
  });
});
