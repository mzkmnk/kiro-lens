import { describe, it, expect, beforeEach } from 'vitest';
import type { CLIOptions } from '@shared/types/port';
import { BackendPortManager } from './portManager';

describe('BackendPortManager - Simple Tests', () => {
  let portManager: BackendPortManager;

  beforeEach(() => {
    portManager = new BackendPortManager();
  });

  describe('基本的なポート検証', () => {
    it('有効なポート番号を受け入れる', async () => {
      const result = await portManager.isPortAvailable(8000);
      expect(typeof result).toBe('boolean');
    });

    it('無効なポート番号を拒否する', async () => {
      expect(await portManager.isPortAvailable(-1)).toBe(false);
      expect(await portManager.isPortAvailable(0)).toBe(false);
      expect(await portManager.isPortAvailable(70000)).toBe(false);
    });

    it('特権ポートを拒否する', async () => {
      expect(await portManager.isPortAvailable(80)).toBe(false);
      expect(await portManager.isPortAvailable(443)).toBe(false);
    });
  });

  describe('ポート検出機能', () => {
    it('利用可能なポートを見つけることができる', async () => {
      const port = await portManager.findAvailablePort(8000);
      expect(port).toBeGreaterThanOrEqual(8000);
      expect(port).toBeLessThanOrEqual(65535);
    });

    it('ランダムポートを生成できる', async () => {
      const port = await portManager.getRandomAvailablePort();
      expect(port).toBeGreaterThanOrEqual(8000);
      expect(port).toBeLessThanOrEqual(65535);
    });
  });

  describe('ポート設定検出', () => {
    it('オプション未指定時にランダムポートを割り当てる', async () => {
      const config = await portManager.detectPorts({});

      expect(config.frontend).toBeGreaterThanOrEqual(8000);
      expect(config.backend).toBe(config.frontend + 1);
      expect(config.autoDetected).toBe(true);
    });

    it('指定されたポートを使用する', async () => {
      const options: CLIOptions = {
        frontendPort: 9000,
        backendPort: 9001,
      };

      const config = await portManager.detectPorts(options);

      expect(config.frontend).toBe(9000);
      expect(config.backend).toBe(9001);
      expect(config.autoDetected).toBe(false);
    });
  });

  describe('複数プロジェクト対応', () => {
    it('複数の設定要求で異なるポートを割り当てる', async () => {
      const config1 = await portManager.detectPorts({});
      const config2 = await portManager.detectPorts({});

      expect(config1.frontend).not.toBe(config2.frontend);
      expect(config1.backend).not.toBe(config2.backend);
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なポート範囲を適切に処理する', async () => {
      // 無効なポートは安全な範囲に修正される
      const port = await portManager.findAvailablePort(-1);
      expect(port).toBeGreaterThanOrEqual(1024);
    });
  });
});
