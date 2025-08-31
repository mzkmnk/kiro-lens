import { describe, it, expect } from 'vitest';
import type {
  PortConfiguration,
  CLIOptions,
  PortValidationResult,
  FoundationErrorType,
  FoundationError,
} from './port';
import { validatePortConfiguration, createPortConfiguration } from './port';

describe('PortConfiguration型', () => {
  it('有効なポート設定オブジェクトを作成できる', () => {
    const config: PortConfiguration = {
      frontend: 3000,
      backend: 3001,
      autoDetected: false,
    };

    expect(config.frontend).toBe(3000);
    expect(config.backend).toBe(3001);
    expect(config.autoDetected).toBe(false);
  });

  it('自動検出されたポート設定を作成できる', () => {
    const config: PortConfiguration = {
      frontend: 8247,
      backend: 8248,
      autoDetected: true,
      requestedPorts: {
        frontend: 3000,
        backend: 3001,
      },
    };

    expect(config.autoDetected).toBe(true);
    expect(config.requestedPorts?.frontend).toBe(3000);
    expect(config.requestedPorts?.backend).toBe(3001);
  });

  it('requestedPortsはオプショナルである', () => {
    const config: PortConfiguration = {
      frontend: 3000,
      backend: 3001,
      autoDetected: false,
    };

    expect(config.requestedPorts).toBeUndefined();
  });
});

describe('CLIOptions型', () => {
  it('すべてのオプションが未指定でも有効', () => {
    const options: CLIOptions = {};

    expect(options.port).toBeUndefined();
    expect(options.frontendPort).toBeUndefined();
    expect(options.backendPort).toBeUndefined();
    expect(options.noOpen).toBeUndefined();
    expect(options.verbose).toBeUndefined();
  });

  it('ポート番号を指定できる', () => {
    const options: CLIOptions = {
      port: 3000,
      frontendPort: 4000,
      backendPort: 4001,
    };

    expect(options.port).toBe(3000);
    expect(options.frontendPort).toBe(4000);
    expect(options.backendPort).toBe(4001);
  });

  it('ブール値オプションを指定できる', () => {
    const options: CLIOptions = {
      noOpen: true,
      verbose: true,
    };

    expect(options.noOpen).toBe(true);
    expect(options.verbose).toBe(true);
  });
});

describe('PortValidationResult型', () => {
  it('利用可能なポートの検証結果を作成できる', () => {
    const result: PortValidationResult = {
      isAvailable: true,
    };

    expect(result.isAvailable).toBe(true);
    expect(result.conflictingProcess).toBeUndefined();
    expect(result.suggestedAlternative).toBeUndefined();
  });

  it('利用不可能なポートの検証結果を作成できる', () => {
    const result: PortValidationResult = {
      isAvailable: false,
      conflictingProcess: 'node server.js',
      suggestedAlternative: 3001,
    };

    expect(result.isAvailable).toBe(false);
    expect(result.conflictingProcess).toBe('node server.js');
    expect(result.suggestedAlternative).toBe(3001);
  });
});

describe('FoundationErrorType列挙型', () => {
  it('すべてのエラータイプが定義されている', () => {
    const errorTypes: FoundationErrorType[] = [
      'PORT_IN_USE',
      'PORT_PERMISSION_DENIED',
      'KIRO_DIR_NOT_FOUND',
      'SERVER_START_FAILED',
      'INVALID_PROJECT_DIR',
    ];

    errorTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });
});

describe('FoundationError型', () => {
  it('基本的なエラーオブジェクトを作成できる', () => {
    const error: FoundationError = {
      type: 'PORT_IN_USE',
      message: 'ポート3000は既に使用されています',
      timestamp: new Date(),
      recoverable: true,
    };

    expect(error.type).toBe('PORT_IN_USE');
    expect(error.message).toBe('ポート3000は既に使用されています');
    expect(error.recoverable).toBe(true);
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('詳細情報と推奨アクションを含むエラーを作成できる', () => {
    const error: FoundationError = {
      type: 'PORT_IN_USE',
      message: 'ポート3000は既に使用されています',
      details: { port: 3000, process: 'node server.js' },
      timestamp: new Date(),
      recoverable: true,
      suggestedAction: '--port 3001 を使用してください',
    };

    expect(error.details).toEqual({ port: 3000, process: 'node server.js' });
    expect(error.suggestedAction).toBe('--port 3001 を使用してください');
  });
});

describe('validatePortConfiguration関数', () => {
  it('有効なポート設定を検証できる', () => {
    const config: PortConfiguration = {
      frontend: 3000,
      backend: 3001,
      autoDetected: false,
    };

    const result = validatePortConfiguration(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('無効なポート番号を検出できる', () => {
    const config: PortConfiguration = {
      frontend: -1,
      backend: 70000,
      autoDetected: false,
    };

    const result = validatePortConfiguration(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('同じポート番号の使用を検出できる', () => {
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
  it('CLIオプションからポート設定を作成できる', () => {
    const options: CLIOptions = {
      port: 3000,
    };

    const config = createPortConfiguration(options);
    expect(config.frontend).toBe(3000);
    expect(config.backend).toBe(3001);
    expect(config.autoDetected).toBe(false);
  });

  it('個別ポート指定からポート設定を作成できる', () => {
    const options: CLIOptions = {
      frontendPort: 4000,
      backendPort: 5000,
    };

    const config = createPortConfiguration(options);
    expect(config.frontend).toBe(4000);
    expect(config.backend).toBe(5000);
    expect(config.autoDetected).toBe(false);
  });

  it('オプション未指定時はランダムポートを使用する', () => {
    const options: CLIOptions = {};

    const config = createPortConfiguration(options);
    expect(config.autoDetected).toBe(true);
    expect(config.frontend).toBeGreaterThan(1024);
    expect(config.backend).toBeGreaterThan(1024);
    expect(config.backend).toBe(config.frontend + 1);
  });
});
