import { describe, test, expect } from 'vitest';
import { createProgram } from './kiro-lens.js';

describe('CLI基本機能', () => {
  test('プログラムが正しく初期化される', () => {
    const program = createProgram();
    expect(program.name()).toBe('kiro-lens');
    expect(program.description()).toBe('Kiro IDE .kiro directory browser and editor');
    expect(program.version()).toBe('1.0.0');
  });

  test('無効なポート番号でエラーになる', async () => {
    const program = createProgram();

    await expect(async () => {
      await program.parseAsync(['node', 'kiro-lens', '--port', 'invalid']);
    }).rejects.toThrow('Port must be a number');
  });

  test('範囲外のポート番号でエラーになる', async () => {
    const program = createProgram();

    await expect(async () => {
      await program.parseAsync(['node', 'kiro-lens', '--port', '70000']);
    }).rejects.toThrow('Port must be between 1 and 65535');
  });

  test('負のポート番号でエラーになる', async () => {
    const program = createProgram();

    await expect(async () => {
      await program.parseAsync(['node', 'kiro-lens', '--port', '-1']);
    }).rejects.toThrow('Port must be a positive number');
  });

  test('同じポート番号でエラーになる', async () => {
    const program = createProgram();

    await expect(async () => {
      await program.parseAsync([
        'node',
        'kiro-lens',
        '--frontend-port',
        '3000',
        '--backend-port',
        '3000',
      ]);
    }).rejects.toThrow('Frontend and backend ports must be different');
  });
});
