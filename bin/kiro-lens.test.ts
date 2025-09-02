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

describe('CLIヘルプ・バージョン機能', () => {
  test('--helpオプションでヘルプメッセージが表示される', async () => {
    const program = createProgram();

    // ヘルプ出力をキャプチャするためのモック
    let helpOutput = '';
    const originalWrite = process.stdout.write;
    process.stdout.write = (chunk: string | Uint8Array) => {
      helpOutput += chunk.toString();
      return true;
    };

    try {
      await program.parseAsync(['node', 'kiro-lens', '--help']);
    } catch (_error) {
      // Commander.jsは--helpでプロセスを終了しようとするため、エラーをキャッチ
    } finally {
      process.stdout.write = originalWrite;
    }

    expect(helpOutput).toContain('Usage:');
    expect(helpOutput).toContain('kiro-lens');
    expect(helpOutput).toContain('Options:');
    expect(helpOutput).toContain('-p, --port');
    expect(helpOutput).toContain('-f, --frontend-port');
    expect(helpOutput).toContain('-b, --backend-port');
    expect(helpOutput).toContain('--no-open');
    expect(helpOutput).toContain('-v, --verbose');
  });

  test('--versionオプションでバージョンが表示される', async () => {
    const program = createProgram();

    // バージョン出力をキャプチャするためのモック
    let versionOutput = '';
    const originalWrite = process.stdout.write;
    process.stdout.write = (chunk: string | Uint8Array) => {
      versionOutput += chunk.toString();
      return true;
    };

    try {
      await program.parseAsync(['node', 'kiro-lens', '--version']);
    } catch (_error) {
      // Commander.jsは--versionでプロセスを終了しようとするため、エラーをキャッチ
    } finally {
      process.stdout.write = originalWrite;
    }

    expect(versionOutput).toContain('1.0.0');
  });

  test('package.jsonからバージョンを取得する', () => {
    const program = createProgram();

    // プログラムのバージョンがpackage.jsonと一致することを確認
    expect(program.version()).toBe('1.0.0');
  });

  test('ヘルプメッセージに使用例が含まれる', async () => {
    const program = createProgram();

    let helpOutput = '';
    const originalWrite = process.stdout.write;
    process.stdout.write = (chunk: string | Uint8Array) => {
      helpOutput += chunk.toString();
      return true;
    };

    try {
      await program.parseAsync(['node', 'kiro-lens', '--help']);
    } catch (_error) {
      // Commander.jsは--helpでプロセスを終了しようとするため、エラーをキャッチ
    } finally {
      process.stdout.write = originalWrite;
    }

    // 使用例が含まれることを確認
    expect(helpOutput).toContain('Examples:');
    expect(helpOutput).toContain('npx kiro-lens');
    expect(helpOutput).toContain('npx kiro-lens --port 3000');
    expect(helpOutput).toContain('Notes:');
    expect(helpOutput).toContain('automatically detected');
  });
});
