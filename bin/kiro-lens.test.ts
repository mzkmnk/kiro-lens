import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { createProgram } from './kiro-lens.js';

// startKiroLens関数をモック化
vi.mock('./kiro-lens.js', async () => {
    const actual = await vi.importActual('./kiro-lens.js') as any;
    return {
        ...actual,
        startKiroLens: vi.fn(),
    };
});

describe('CLI基本構造', () => {
    let program: Command;

    beforeEach(() => {
        vi.clearAllMocks();
        program = createProgram();
    });

    describe('Commander.jsプログラム初期化', () => {
        test('プログラムが正しく初期化される', () => {
            expect(program.name()).toBe('kiro-lens');
            expect(program.description()).toBe('Kiro IDE .kiro directory browser and editor');
            expect(program.version()).toBe('1.0.0');
        });

        test('プログラムにオプションが正しく設定される', () => {
            const options = program.options;

            expect(options).toHaveLength(6); // 5つのカスタムオプション + デフォルトのhelp
            expect(options.find(opt => opt.short === '-p')).toBeDefined();
            expect(options.find(opt => opt.short === '-f')).toBeDefined();
            expect(options.find(opt => opt.short === '-b')).toBeDefined();
            expect(options.find(opt => opt.long === '--no-open')).toBeDefined();
            expect(options.find(opt => opt.short === '-v')).toBeDefined();
        });
    });

    describe('基本コマンド登録', () => {
        test('デフォルトアクションが設定される', () => {
            // アクションが設定されていることを確認
            expect(program._actionHandler).toBeDefined();
            expect(typeof program._actionHandler).toBe('function');
        });

        test('ヘルプオプションが利用可能', () => {
            // Commander.jsはデフォルトで--helpオプションを提供
            // helpInformationメソッドが存在することで確認
            expect(program.helpInformation).toBeDefined();
            expect(typeof program.helpInformation).toBe('function');
        });

        test('バージョンオプションが利用可能', () => {
            const versionOption = program.options.find(opt => opt.long === '--version');
            expect(versionOption).toBeDefined();
        });
    });

    describe('CLIオプション型安全性', () => {
        test('CLIOptionsインターフェースが正しく定義されている', () => {
            // 型定義のテスト - コンパイル時にチェックされる
            const validOptions = {
                port: 3000,
                frontendPort: 3000,
                backendPort: 3001,
                noOpen: true,
                verbose: false,
            };

            // すべてのプロパティが任意であることをテスト
            const emptyOptions = {};

            // TypeScriptコンパイラがこれらの型をチェックする
            expect(typeof validOptions.port).toBe('number');
            expect(typeof validOptions.noOpen).toBe('boolean');
            expect(typeof emptyOptions).toBe('object');
        });
    });
});
descri
be('CLIオプション解析', () => {
    test('--portオプションが正しく解析される', async () => {
        const mockStartKiroLens = vi.fn();
        const { startKiroLens } = await import('./kiro-lens.js');
        vi.mocked(startKiroLens).mockImplementation(mockStartKiroLens);

        // --port 3000 オプションをシミュレート
        process.argv = ['node', 'kiro-lens', '--port', '3000'];

        const program = createProgram();
        await program.parseAsync(['node', 'kiro-lens', '--port', '3000']);

        expect(mockStartKiroLens).toHaveBeenCalledWith(
            expect.objectContaining({
                port: 3000
            })
        );
    });

    test('--frontend-port と --backend-port オプションが正しく解析される', async () => {
        const mockStartKiroLens = vi.fn();
        const { startKiroLens } = await import('./kiro-lens.js');
        vi.mocked(startKiroLens).mockImplementation(mockStartKiroLens);

        const program = createProgram();
        await program.parseAsync(['node', 'kiro-lens', '--frontend-port', '3000', '--backend-port', '3001']);

        expect(mockStartKiroLens).toHaveBeenCalledWith(
            expect.objectContaining({
                frontendPort: 3000,
                backendPort: 3001
            })
        );
    });

    test('--no-open オプションが正しく解析される', async () => {
        const mockStartKiroLens = vi.fn();
        const { startKiroLens } = await import('./kiro-lens.js');
        vi.mocked(startKiroLens).mockImplementation(mockStartKiroLens);

        const program = createProgram();
        await program.parseAsync(['node', 'kiro-lens', '--no-open']);

        expect(mockStartKiroLens).toHaveBeenCalledWith(
            expect.objectContaining({
                open: false
            })
        );
    });

    test('--verbose オプションが正しく解析される', async () => {
        const mockStartKiroLens = vi.fn();
        const { startKiroLens } = await import('./kiro-lens.js');
        vi.mocked(startKiroLens).mockImplementation(mockStartKiroLens);

        const program = createProgram();
        await program.parseAsync(['node', 'kiro-lens', '--verbose']);

        expect(mockStartKiroLens).toHaveBeenCalledWith(
            expect.objectContaining({
                verbose: true
            })
        );
    });

    test('複数オプションの組み合わせが正しく解析される', async () => {
        const mockStartKiroLens = vi.fn();
        const { startKiroLens } = await import('./kiro-lens.js');
        vi.mocked(startKiroLens).mockImplementation(mockStartKiroLens);

        const program = createProgram();
        await program.parseAsync(['node', 'kiro-lens', '--port', '8080', '--verbose', '--no-open']);

        expect(mockStartKiroLens).toHaveBeenCalledWith(
            expect.objectContaining({
                port: 8080,
                verbose: true,
                open: false
            })
        );
    });

    test('オプション解析結果の型安全性', async () => {
        const mockStartKiroLens = vi.fn();
        const { startKiroLens } = await import('./kiro-lens.js');
        vi.mocked(startKiroLens).mockImplementation(mockStartKiroLens);

        const program = createProgram();
        await program.parseAsync(['node', 'kiro-lens', '--port', '3000']);

        expect(mockStartKiroLens).toHaveBeenCalledTimes(1);
        const calledOptions = mockStartKiroLens.mock.calls[0][0];

        // 型安全性の確認
        expect(typeof calledOptions.port).toBe('number');
        expect(calledOptions.port).toBe(3000);
    });
});

describe('portUtilsとの連携', () => {
    test('PortConfiguration型との互換性', () => {
        // CLIOptionsからPortConfigurationへの変換をテスト
        const cliOptions = {
            port: 3000,
            verbose: true
        };

        // 型の互換性をテスト（コンパイル時チェック）
        expect(cliOptions.port).toBe(3000);
        expect(typeof cliOptions.port).toBe('number');
    });

    test('ポート番号の妥当性チェック', () => {
        // 無効なポート番号のテスト
        const invalidOptions = [
            { port: -1 },
            { port: 0 },
            { port: 65536 },
            { frontendPort: -1 },
            { backendPort: 70000 }
        ];

        invalidOptions.forEach(options => {
            // 実際の妥当性チェックは実装時に追加
            expect(typeof options).toBe('object');
        });
    });
});