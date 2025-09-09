import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PathInput } from './PathInput';

// validatePath関数をモック
vi.mock('@/services', () => ({
  validatePath: vi.fn(),
}));

import { validatePath } from '@/services';

const mockValidatePath = validatePath as vi.MockedFunction<typeof validatePath>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PathInput', () => {
  test('初期状態で正しくレンダリングされる', () => {
    const onPathConfirm = vi.fn();

    render(<PathInput onPathConfirm={onPathConfirm} />);

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /プロジェクトを追加/ })).toBeDisabled();
  });

  test('パス入力時にバリデーションが実行される', async () => {
    const onPathConfirm = vi.fn();
    mockValidatePath.mockResolvedValue({
      isValid: true,
      error: undefined,
    });

    render(<PathInput onPathConfirm={onPathConfirm} />);

    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '/valid/path' } });

    await waitFor(() => {
      expect(mockValidatePath).toHaveBeenCalledWith('/valid/path');
    });
  });

  test('有効なパスでボタンが有効になる', async () => {
    const onPathConfirm = vi.fn();
    mockValidatePath.mockResolvedValue({
      isValid: true,
      error: undefined,
    });

    render(<PathInput onPathConfirm={onPathConfirm} />);

    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '/valid/path' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /プロジェクトを追加/ })).not.toBeDisabled();
    });
  });

  test('無効なパスでバリデーションが実行される', async () => {
    const onPathConfirm = vi.fn();
    mockValidatePath.mockResolvedValue({
      isValid: false,
      error: '.kiroディレクトリが見つかりません',
    });

    render(<PathInput onPathConfirm={onPathConfirm} />);

    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '/invalid/path' } });

    // バリデーションが実行されることを確認（エラーメッセージは表示されない）
    await waitFor(() => {
      expect(mockValidatePath).toHaveBeenCalledWith('/invalid/path');
    });
  });

  test('確定ボタンクリックでコールバックが呼ばれる', async () => {
    const onPathConfirm = vi.fn();
    mockValidatePath.mockResolvedValue({
      isValid: true,
      error: undefined,
    });

    render(<PathInput onPathConfirm={onPathConfirm} />);

    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '/valid/path' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /プロジェクトを追加/ })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /プロジェクトを追加/ }));

    expect(onPathConfirm).toHaveBeenCalledWith('/valid/path');
  });

  test('Enterキーでも確定できる', async () => {
    const onPathConfirm = vi.fn();
    mockValidatePath.mockResolvedValue({
      isValid: true,
      error: undefined,
    });

    render(<PathInput onPathConfirm={onPathConfirm} />);

    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '/valid/path' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /プロジェクトを追加/ })).not.toBeDisabled();
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onPathConfirm).toHaveBeenCalledWith('/valid/path');
  });
});
