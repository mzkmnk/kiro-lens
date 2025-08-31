import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { PortConfiguration, CLIOptions } from '../types/port';
import { PortManager } from './portManager';

describe('PortManager', () => {
  let portManager: PortManager;

  beforeEach(() => {
    portManager = new PortManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('利用可能ポート検出機能', () => {
    it('指定されたポートが利用可能な場合はそのポートを返す', async () => {
      const port = 8000;
      const result = await portManager.findAvailablePort(port);

      expect(result).toBe(port);
    });

    it('指定されたポートが使用中の場合は次の利用可能ポートを返す', async () => {
      // ポート8000が使用中の場合をモック
      vi.spyOn(portManager, 'isPortAvailable').mockImplementation(async port => {
        return port !== 8000;
      });

      const result = await portManager.findAvailablePort(8000);

      expect(result).toBeGreaterThan(8000);
      expect(await portManager.isPortAvailable(result)).toBe(true);
    });

    it('連続する複数のポートが使用中の場合は最初の利用可能ポートを返す', async () => {
      // ポート8000-8002が使用中の場合をモック
      vi.spyOn(portManager, 'isPortAvailable').mockImplementation(async port => {
        return port < 8000 || port > 8002;
      });

      const result = await portManager.findAvailablePort(8000);

      expect(result).toBeGreaterThan(8002);
    });

    it('最大ポート数に達した場合はエラーを投げる', async () => {
      // すべてのポートが使用中の場合をモック
      vi.spyOn(portManager, 'isPortAvailable').mockResolvedValue(false);

      await expect(portManager.findAvailablePort(65530)).rejects.toThrow(
        '利用可能なポートが見つかりません'
      );
    });
  });

  describe('ポート競合検出機能', () => {
    it('ポートが利用可能な場合はtrueを返す', async () => {
      const result = await portManager.isPortAvailable(8000);

      expect(result).toBe(true);
    });

    it('ポートが使用中の場合はfalseを返す', async () => {
      // ポートが使用中の場合をモック
      vi.spyOn(portManager, 'checkPortInUse').mockResolvedValue(true);

      const result = await portManager.isPortAvailable(8000);

      expect(result).toBe(false);
    });

    it('無効なポート番号の場合はfalseを返す', async () => {
      const result = await portManager.isPortAvailable(-1);

      expect(result).toBe(false);
    });

    it('権限のないポートの場合はfalseを返す', async () => {
      const result = await portManager.isPortAvailable(80);

      expect(result).toBe(false);
    });
  });

  describe('ランダムポート割り当て機能', () => {
    it('ランダムな利用可能ポートを返す', async () => {
      const result = await portManager.getRandomAvailablePort();

      expect(result).toBeGreaterThanOrEqual(8000);
      expect(result).toBeLessThanOrEqual(65535);
      expect(await portManager.isPortAvailable(result)).toBe(true);
    });

    it('複数回呼び出しても異なるポートを返す可能性がある', async () => {
      const port1 = await portManager.getRandomAvailablePort();
      const port2 = await portManager.getRandomAvailablePort();

      // 必ずしも異なるとは限らないが、両方とも有効なポートであることを確認
      expect(await portManager.isPortAvailable(port1)).toBe(true);
      expect(await portManager.isPortAvailable(port2)).toBe(true);
    });

    it('指定範囲内でランダムポートを生成する', async () => {
      const minPort = 9000;
      const maxPort = 9100;
      const result = await portManager.getRandomAvailablePort(minPort, maxPort);

      expect(result).toBeGreaterThanOrEqual(minPort);
      expect(result).toBeLessThanOrEqual(maxPort);
    });
  });

  describe('複数プロジェクト同時起動サポート', () => {
    it('複数のポート設定を同時に検出できる', async () => {
      const options1: CLIOptions = {};
      const options2: CLIOptions = {};

      const config1 = await portManager.detectPorts(options1);
      const config2 = await portManager.detectPorts(options2);

      // 異なるポートが割り当てられることを確認
      expect(config1.frontend).not.toBe(config2.frontend);
      expect(config1.backend).not.toBe(config2.backend);

      // 割り当てられたポートは使用中として登録されているため利用不可
      expect(await portManager.isPortAvailable(config1.frontend)).toBe(false);
      expect(await portManager.isPortAvailable(config1.backend)).toBe(false);
      expect(await portManager.isPortAvailable(config2.frontend)).toBe(false);
      expect(await portManager.isPortAvailable(config2.backend)).toBe(false);
    });

    it('ポート競合時に代替ポートを提案する', async () => {
      // 最初のプロジェクトでポート3000-3001を使用
      const config1 = await portManager.detectPorts({ port: 3000 });

      // 同じポートを要求する2番目のプロジェクト
      const config2 = await portManager.detectPorts({ port: 3000 });

      expect(config1.frontend).toBe(3000);
      expect(config1.backend).toBe(3001);

      // 2番目のプロジェクトには代替ポートが割り当てられる
      expect(config2.frontend).not.toBe(3000);
      expect(config2.backend).not.toBe(3001);
      expect(config2.autoDetected).toBe(true); // 代替ポートが自動検出されたことを示す
    });

    it('使用中ポートのリストを管理する', async () => {
      const port1 = 8000;
      const port2 = 8001;

      // ポートを使用中として登録
      portManager.markPortAsUsed(port1);
      portManager.markPortAsUsed(port2);

      // 使用中ポートは利用不可として判定される
      expect(await portManager.isPortAvailable(port1)).toBe(false);
      expect(await portManager.isPortAvailable(port2)).toBe(false);

      // ポートを解放
      portManager.releasePort(port1);
      expect(await portManager.isPortAvailable(port1)).toBe(true);
      expect(await portManager.isPortAvailable(port2)).toBe(false);
    });
  });

  describe('detectPorts メソッド', () => {
    it('個別ポート指定時は指定されたポートを使用する', async () => {
      const options: CLIOptions = {
        frontendPort: 4000,
        backendPort: 5000,
      };

      const config = await portManager.detectPorts(options);

      expect(config.frontend).toBe(4000);
      expect(config.backend).toBe(5000);
      expect(config.autoDetected).toBe(false);
    });

    it('フロントエンドポート指定時はバックエンドポートを自動計算する', async () => {
      const options: CLIOptions = {
        port: 3000,
      };

      const config = await portManager.detectPorts(options);

      expect(config.frontend).toBe(3000);
      expect(config.backend).toBe(3001);
      expect(config.autoDetected).toBe(false);
    });

    it('オプション未指定時はランダムポートを自動検出する', async () => {
      const options: CLIOptions = {};

      const config = await portManager.detectPorts(options);

      expect(config.frontend).toBeGreaterThanOrEqual(8000);
      expect(config.backend).toBe(config.frontend + 1);
      expect(config.autoDetected).toBe(true);
    });

    it('指定ポートが使用中の場合は代替ポートを提案する', async () => {
      // ポート3000が使用中の場合をモック
      vi.spyOn(portManager, 'isPortAvailable').mockImplementation(async port => {
        return port !== 3000 && port !== 3001;
      });

      const options: CLIOptions = {
        port: 3000,
      };

      const config = await portManager.detectPorts(options);

      expect(config.frontend).not.toBe(3000);
      expect(config.backend).not.toBe(3001);
      expect(config.autoDetected).toBe(true); // 代替ポートが自動検出された
      expect(config.requestedPorts?.frontend).toBe(3000);
    });

    it('バックエンドポートが競合する場合は両方とも代替ポートを使用する', async () => {
      // ポート3001が使用中の場合をモック
      vi.spyOn(portManager, 'isPortAvailable').mockImplementation(async port => {
        return port !== 3001;
      });

      const options: CLIOptions = {
        port: 3000,
      };

      const config = await portManager.detectPorts(options);

      expect(config.frontend).not.toBe(3000);
      expect(config.backend).not.toBe(3001);
      expect(config.autoDetected).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なポート範囲が指定された場合はエラーを投げる', async () => {
      await expect(portManager.findAvailablePort(-1)).rejects.toThrow('無効なポート番号です');
    });

    it('ポート検出でネットワークエラーが発生した場合は適切にハンドリングする', async () => {
      vi.spyOn(portManager, 'checkPortInUse').mockRejectedValue(new Error('Network error'));

      // ネットワークエラーが発生してもfalseを返す（安全側に倒す）
      const result = await portManager.isPortAvailable(8000);
      expect(result).toBe(false);
    });
  });
});
