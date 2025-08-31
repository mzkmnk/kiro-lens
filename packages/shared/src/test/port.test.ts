import { describe, it, expect } from 'vitest';
import {
    PortConfiguration,
    CLIOptions,
    validatePortConfiguration,
    isValidPort,
    createPortConfiguration
} from '../types/port.js';

describe('ポート関連ユーティリティ', () => {
    describe('isValidPort', () => {
        it('有効なポートを検証すべき', () => {
            expect(isValidPort(3000)).toBe(true);
            expect(isValidPort(8080)).toBe(true);
            expect(isValidPort(65535)).toBe(true);
        });

        it('無効なポートを拒否すべき', () => {
            expect(isValidPort(0)).toBe(false);
            expect(isValidPort(-1)).toBe(false);
            expect(isValidPort(65536)).toBe(false);
            expect(isValidPort(1.5)).toBe(false);
        });
    });

    describe('validatePortConfiguration', () => {
        it('有効な設定を検証すべき', () => {
            const config: PortConfiguration = {
                frontend: 3000,
                backend: 3001,
                autoDetected: false
            };

            const result = validatePortConfiguration(config);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('無効なポートを検出すべき', () => {
            const config: PortConfiguration = {
                frontend: -1,
                backend: 70000,
                autoDetected: false
            };

            const result = validatePortConfiguration(config);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('ポートの競合を検出すべき', () => {
            const config: PortConfiguration = {
                frontend: 3000,
                backend: 3000,
                autoDetected: false
            };

            const result = validatePortConfiguration(config);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('フロントエンドとバックエンドのポートは同じにできません');
        });
    });

    describe('createPortConfiguration', () => {
        it('ポート指定のCLIオプションから設定を作成すべき', () => {
            const options: CLIOptions = { port: 3000 };
            const config = createPortConfiguration(options);

            expect(config.frontend).toBe(3000);
            expect(config.backend).toBe(3001);
            expect(config.autoDetected).toBe(false);
        });

        it('個別ポート指定のCLIオプションから設定を作成すべき', () => {
            const options: CLIOptions = {
                frontendPort: 4000,
                backendPort: 4001
            };
            const config = createPortConfiguration(options);

            expect(config.frontend).toBe(4000);
            expect(config.backend).toBe(4001);
            expect(config.autoDetected).toBe(false);
        });

        it('自動検出設定を作成すべき', () => {
            const options: CLIOptions = {};
            const config = createPortConfiguration(options);

            expect(config.autoDetected).toBe(true);
            expect(typeof config.frontend).toBe('number');
            expect(typeof config.backend).toBe('number');
            expect(config.backend).toBe(config.frontend + 1);
        });
    });
});