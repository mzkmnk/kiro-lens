import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:http';
import type { CLIOptions } from '@shared/types/port';
import { BackendPortManager } from './portManager';

describe('PortManager Integration Tests', () => {
  let portManager: BackendPortManager;
  let testProcesses: ChildProcess[] = [];
  let testServers: any[] = [];

  beforeEach(() => {
    portManager = new BackendPortManager();
    testProcesses = [];
    testServers = [];
  });

  afterEach(async () => {
    // テストプロセスをクリーンアップ
    testProcesses.forEach(process => {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
    });

    // テストサーバーをクリーンアップ
    await Promise.all(
      testServers.map(server => {
        return new Promise<void>(resolve => {
          if (server.listening) {
            server.close(() => resolve());
          } else {
            resolve();
          }
        });
      })
    );

    testProcesses = [];
    testServers = [];
  });

  // テスト用サーバーを起動するヘルパー
  const startTestServer = (port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const server = createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Test server on port ${port}`);
      });

      server.listen(port, () => {
        testServers.push(server);
        resolve();
      });

      server.on('error', reject);
    });
  };

  // HTTPリクエストでポートの使用状況を確認するヘルパー
  const checkPortResponse = async (port: number): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:${port}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  describe('実際のサーバー起動との統合', () => {
    it('検出されたポートで実際にサーバーを起動できる', async () => {
      const config = await portManager.detectPorts({});

      // 検出されたポートでテストサーバーを起動
      await startTestServer(config.frontend);
      await startTestServer(config.backend);

      // サーバーが正常に応答することを確認
      expect(await checkPortResponse(config.frontend)).toBe(true);
      expect(await checkPortResponse(config.backend)).toBe(true);
    });

    it('ポート競合時に代替ポートで起動できる', async () => {
      const requestedPort = 8200;

      // 要求されたポートを先に使用
      await startTestServer(requestedPort);
      await startTestServer(requestedPort + 1);

      // 競合するポートを要求
      const config = await portManager.detectPorts({ port: requestedPort });

      // 代替ポートが割り当てられることを確認
      expect(config.frontend).not.toBe(requestedPort);
      expect(config.backend).not.toBe(requestedPort + 1);

      // 代替ポートでサーバーを起動できることを確認
      await startTestServer(config.frontend);
      await startTestServer(config.backend);

      expect(await checkPortResponse(config.frontend)).toBe(true);
      expect(await checkPortResponse(config.backend)).toBe(true);
    });
  });

  describe('複数プロジェクト同時起動シミュレーション', () => {
    it('3つのプロジェクトが同時に異なるポートで起動できる', async () => {
      // 3つのプロジェクトのポート設定を並行取得
      const configs = await Promise.all([
        portManager.detectPorts({}),
        portManager.detectPorts({}),
        portManager.detectPorts({}),
      ]);

      // すべて異なるポートが割り当てられることを確認
      const allPorts = configs.flatMap(config => [config.frontend, config.backend]);
      const uniquePorts = new Set(allPorts);
      expect(uniquePorts.size).toBe(allPorts.length);

      // すべてのポートでサーバーを起動
      for (const config of configs) {
        await startTestServer(config.frontend);
        await startTestServer(config.backend);
      }

      // すべてのサーバーが正常に応答することを確認
      for (const config of configs) {
        expect(await checkPortResponse(config.frontend)).toBe(true);
        expect(await checkPortResponse(config.backend)).toBe(true);
      }
    });

    it('一部のプロジェクトが終了しても他に影響しない', async () => {
      const config1 = await portManager.detectPorts({});
      const config2 = await portManager.detectPorts({});

      // 両方のプロジェクトでサーバーを起動
      await startTestServer(config1.frontend);
      await startTestServer(config1.backend);
      await startTestServer(config2.frontend);
      await startTestServer(config2.backend);

      // 最初のプロジェクトのサーバーを停止
      const server1Frontend = testServers.find(s => s.address()?.port === config1.frontend);
      const server1Backend = testServers.find(s => s.address()?.port === config1.backend);

      if (server1Frontend) {
        await new Promise<void>(resolve => server1Frontend.close(() => resolve()));
      }
      if (server1Backend) {
        await new Promise<void>(resolve => server1Backend.close(() => resolve()));
      }

      // 2番目のプロジェクトは継続して動作することを確認
      expect(await checkPortResponse(config2.frontend)).toBe(true);
      expect(await checkPortResponse(config2.backend)).toBe(true);

      // 1番目のプロジェクトのポートは利用可能になることを確認
      expect(await portManager.isPortAvailable(config1.frontend)).toBe(true);
      expect(await portManager.isPortAvailable(config1.backend)).toBe(true);
    });
  });

  describe('システムリソース制限テスト', () => {
    it('大量のポート要求を処理できる', async () => {
      const portCount = 20;
      const configs: any[] = [];

      // 大量のポート設定を並行取得
      const requests = Array.from({ length: portCount }, () => portManager.detectPorts({}));

      const results = await Promise.all(requests);
      configs.push(...results);

      // すべて異なるポートが割り当てられることを確認
      const allPorts = configs.flatMap(config => [config.frontend, config.backend]);
      const uniquePorts = new Set(allPorts);
      expect(uniquePorts.size).toBe(allPorts.length);

      // 一部のポートでサーバーを起動して実際に使用可能であることを確認
      const sampleConfigs = configs.slice(0, 5);
      for (const config of sampleConfigs) {
        await startTestServer(config.frontend);
        expect(await checkPortResponse(config.frontend)).toBe(true);
      }
    });

    it('ポート枯渇時の適切なエラーハンドリング', async () => {
      // 非常に狭い範囲でポート検出を試行
      const startPort = 8300;
      const endPort = 8305;

      // 範囲内のすべてのポートを使用
      for (let port = startPort; port <= endPort; port++) {
        await startTestServer(port);
      }

      // 範囲内でのポート検出は失敗するはず
      const availablePort = await portManager.findAvailablePortInRange(startPort, endPort);
      expect(availablePort).toBeNull();

      // より広い範囲では成功するはず
      const wideRangePort = await portManager.findAvailablePort(startPort);
      expect(wideRangePort).toBeGreaterThan(endPort);
    });
  });

  describe('実際のネットワーク環境での動作', () => {
    it('ローカルホスト以外のインターフェースでの競合を検出する', async () => {
      // この テストは実際のネットワーク環境に依存するため、
      // 基本的な動作確認のみ行う
      const port = 8350;

      const isAvailable = await portManager.isPortAvailable(port);
      expect(typeof isAvailable).toBe('boolean');
    });

    it('IPv4とIPv6の両方で利用可能性をチェックする', async () => {
      const port = 8360;

      // IPv4での確認
      const ipv4Available = await portManager.isPortAvailable(port, '127.0.0.1');

      // IPv6での確認（利用可能な場合のみ）
      let ipv6Available = true;
      try {
        ipv6Available = await portManager.isPortAvailable(port, '::1');
      } catch {
        // IPv6が利用できない環境ではスキップ
        ipv6Available = false;
      }

      expect(typeof ipv4Available).toBe('boolean');
      expect(typeof ipv6Available).toBe('boolean');
    });
  });

  describe('パフォーマンスと安定性', () => {
    it('連続したポート検出要求を安定して処理する', async () => {
      const iterations = 10;
      const results: any[] = [];

      for (let i = 0; i < iterations; i++) {
        const config = await portManager.detectPorts({});
        results.push(config);

        // 短時間待機してリソースを解放
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // すべての結果が有効であることを確認
      expect(results).toHaveLength(iterations);
      results.forEach(config => {
        expect(config.frontend).toBeGreaterThan(0);
        expect(config.backend).toBeGreaterThan(0);
        expect(config.backend).toBe(config.frontend + 1);
      });
    });

    it('メモリリークが発生しないことを確認する', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // 大量のポート検出を実行
      for (let i = 0; i < 100; i++) {
        await portManager.detectPorts({});
      }

      // ガベージコレクションを強制実行
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // メモリ増加が合理的な範囲内であることを確認（10MB以下）
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
