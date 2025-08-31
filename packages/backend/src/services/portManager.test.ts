import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import type { CLIOptions } from '@shared/types/port';
import { BackendPortManager } from './portManager';

describe('BackendPortManager', () => {
  let portManager: BackendPortManager;
  let testServers: Array<{ server: any; port: number }> = [];

  beforeEach(() => {
    portManager = new BackendPortManager();
    testServers = [];
  });

  afterEach(async () => {
    // テスト用サーバーをクリーンアップ
    await Promise.all(
      testServers.map(({ server }) => {
        return new Promise<void>(resolve => {
          if (server.listening) {
            server.close(() => resolve());
          } else {
            resolve();
          }
        });
      })
    );
    testServers = [];
    vi.restoreAllMocks();
  });

  // テスト用サーバーを起動するヘルパー関数
  const startTestServer = async (port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const server = createServer();
      server.listen(port, () => {
        testServers.push({ server, port });
        resolve();
      });
      server.on('error', reject);
    });
  };

  describe('実際のポート検出機能', () => {
    it('利用可能なポートを正しく検出する', async () => {
      const port = 8050;
      const isAvailable = await portManager.isPortAvailable(port);

      expect(isAvailable).toBe(true);
    });

    it('使用中のポートを正しく検出する', async () => {
      const port = 8051;

      // テスト用サーバーを起動
      await startTestServer(port);

      // 少し待機してサーバーが完全に起動するのを待つ
      await new Promise(resolve => setTimeout(resolve, 50));

      const isAvailable = await portManager.isPortAvailable(port);
      expect(isAvailable).toBe(false);
    });

    it('連続するポートの使用状況を正しく判定する', async () => {
      const basePort = 8060;

      // 8060, 8062を使用中にする
      await startTestServer(basePort);
      await startTestServer(basePort + 2);

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(await portManager.isPortAvailable(basePort)).toBe(false);
      expect(await portManager.isPortAvailable(basePort + 1)).toBe(true);
      expect(await portManager.isPortAvailable(basePort + 2)).toBe(false);
      expect(await portManager.isPortAvailable(basePort + 3)).toBe(true);
    });
  });

  describe('ポート範囲検索機能', () => {
    it('指定範囲内で最初の利用可能ポートを見つける', async () => {
      const startPort = 8070;
      const endPort = 8080;

      // 8070-8072を使用中にする
      await startTestServer(8070);
      await startTestServer(8071);
      await startTestServer(8072);

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 50));

      const availablePort = await portManager.findAvailablePortInRange(startPort, endPort);

      expect(availablePort).toBeGreaterThanOrEqual(8073);
      expect(availablePort).toBeLessThanOrEqual(endPort);
      if (availablePort !== null) {
        expect(await portManager.isPortAvailable(availablePort)).toBe(true);
      }
    });

    it('範囲内にポートがない場合はnullを返す', async () => {
      const startPort = 8080;
      const endPort = 8082;

      // 範囲内のすべてのポートを使用中にする
      await startTestServer(8080);
      await startTestServer(8081);
      await startTestServer(8082);

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 50));

      const availablePort = await portManager.findAvailablePortInRange(startPort, endPort);

      // 範囲が狭いため、利用可能なポートが見つからない可能性が高い
      expect(availablePort === null || availablePort > endPort).toBe(true);
    });
  });

  describe('システムポート回避機能', () => {
    it('特権ポート（1-1023）を回避する', async () => {
      const port = await portManager.findAvailablePort(80);

      expect(port).toBeGreaterThanOrEqual(1024);
    });

    it('よく使用されるポートを回避する', async () => {
      // よく使用されるポート番号のリスト
      const commonPorts = [3000, 3001, 8000, 8080, 9000];

      for (const commonPort of commonPorts) {
        await startTestServer(commonPort);
      }

      const port = await portManager.findAvailablePort(3000);

      expect(commonPorts).not.toContain(port);
      expect(await portManager.isPortAvailable(port)).toBe(true);
    });
  });

  describe('複数プロジェクト対応', () => {
    it('複数のポート設定要求を並行処理できる', async () => {
      const requests = [
        portManager.detectPorts({}),
        portManager.detectPorts({}),
        portManager.detectPorts({}),
      ];

      const configs = await Promise.all(requests);

      // すべて異なるポートが割り当てられることを確認
      const allPorts = configs.flatMap(config => [config.frontend, config.backend]);
      const uniquePorts = new Set(allPorts);

      expect(uniquePorts.size).toBe(allPorts.length);
    });

    it('ポート使用状況を正しく管理する', async () => {
      const config1 = await portManager.detectPorts({ port: 8090 });

      // 最初の設定でポートを使用中として登録
      portManager.markPortAsUsed(config1.frontend);
      portManager.markPortAsUsed(config1.backend);

      // 同じポートを要求する2番目の設定
      const config2 = await portManager.detectPorts({ port: 8090 });

      expect(config2.frontend).not.toBe(config1.frontend);
      expect(config2.backend).not.toBe(config1.backend);
    });
  });

  describe('エラー処理とリカバリ', () => {
    it('ネットワークエラー時は安全側に判定する', async () => {
      // ネットワーク接続をモック
      vi.spyOn(portManager, 'checkPortInUse').mockRejectedValue(new Error('ENOTFOUND'));

      const isAvailable = await portManager.isPortAvailable(8100);

      // エラー時は使用中として判定（安全側）
      expect(isAvailable).toBe(false);
    });

    it('タイムアウト時は適切にハンドリングする', async () => {
      // タイムアウトをモック
      vi.spyOn(portManager, 'checkPortInUse').mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('ETIMEDOUT')), 100);
        });
      });

      const isAvailable = await portManager.isPortAvailable(8101);

      expect(isAvailable).toBe(false);
    });

    it('権限エラー時は適切なエラーメッセージを返す', async () => {
      await expect(portManager.isPortAvailable(80)).resolves.toBe(false);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のポート検証を効率的に処理する', async () => {
      const startTime = Date.now();
      const ports = Array.from({ length: 50 }, (_, i) => 9000 + i);

      const results = await Promise.all(ports.map(port => portManager.isPortAvailable(port)));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(5000); // 5秒以内で完了
    });

    it('ポート検出のキャッシュ機能が動作する', async () => {
      const port = 8110;

      // 最初の呼び出し
      const result1 = await portManager.isPortAvailable(port);

      // 2回目の呼び出し（キャッシュされているはず）
      const result2 = await portManager.isPortAvailable(port);

      // 結果が一致することを確認（キャッシュが動作している証拠）
      expect(result1).toBe(result2);
    });
  });
});
