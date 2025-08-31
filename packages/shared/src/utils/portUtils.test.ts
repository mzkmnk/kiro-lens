import { describe, it, expect } from 'vitest';
import type { PortConfiguration, CLIOptions } from '../types/port';
import { validatePortConfiguration, createPortConfiguration, isValidPortNumber } from './portUtils';

describe('isValidPortNumber関数', () => {
  it('有効なポート番号を正しく判定する', () => {
    expect(isValidPortNumber(3000)).toBe(true);
    expect(isValidPortNumber(8080)).toBe(true);
    expect(isValidPortNumber(65535)).toBe(true);
  });

  it('無効なポート番号を正しく判定する', () => {
    expect(isValidPortNumber(0)).toBe(false);
    expect(isValidPortNumber(-1)).toBe(false);
    expect(isValidPortNumber(65536)).toBe(false);
    expect(isValidPortNumber(3.14)).toBe(false);
  });
});

describe('validatePortConfiguration関数', () => {
  it('有効なポート設定を正しく検証する', () => {
    const config: PortConfiguration = {
      frontend: 3000,
      backend: 3001,
      autoDetected: false,
    };

    const result = validatePortConfiguration(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('無効なポート番号を検出する', () => {
    const config: PortConfiguration = {
      frontend: -1,
      backend: 70000,
      autoDetected: false,
    };

    const result = validatePortConfiguration(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('同じポート番号の使用を検出する', () => {
    const config: PortConfiguration = {
      frontend: 3000,
      backend: 3000,
      autoDetected: false,
    };

    const result = validatePortConfiguration(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('フロントエンドとバックエンドで同じポートは使用できません');
  });
});

describe('createPortConfiguration関数', () => {
  it('個別ポート指定からポート設定を作成する', () => {
    const options: CLIOptions = {
      frontendPort: 4000,
      backendPort: 5000,
    };

    const config = createPortConfiguration(options);
    expect(config.frontend).toBe(4000);
    expect(config.backend).toBe(5000);
    expect(config.autoDetected).toBe(false);
  });

  it('フロントエンドポート指定からポート設定を作成する', () => {
    const options: CLIOptions = {
      port: 3000,
    };

    const config = createPortConfiguration(options);
    expect(config.frontend).toBe(3000);
    expect(config.backend).toBe(3001);
    expect(config.autoDetected).toBe(false);
  });

  it('オプション未指定時はデフォルトポートを使用する', () => {
    const options: CLIOptions = {};

    const config = createPortConfiguration(options);
    expect(config.frontend).toBe(3000);
    expect(config.backend).toBe(3001);
    expect(config.autoDetected).toBe(true);
  });
});
