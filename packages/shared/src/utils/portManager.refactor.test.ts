import { describe, it, expect, beforeEach } from 'vitest';
import { PortManager } from './portManager';

describe('PortManager - Refactored Features', () => {
  let portManager: PortManager;

  beforeEach(() => {
    portManager = new PortManager();
  });

  describe('キャッシュ管理機能', () => {
    it('キャッシュをクリアできる', async () => {
      // ポートをチェックしてキャッシュに保存
      await portManager.isPortAvailable(8000);

      let stats = portManager.getUsageStats();
      expect(stats.cacheSize).toBeGreaterThan(0);

      // キャッシュをクリア
      portManager.clearCache();

      stats = portManager.getUsageStats();
      expect(stats.cacheSize).toBe(0);
    });

    it('特定のポートのキャッシュをクリアできる', async () => {
      // 複数のポートをチェック
      await portManager.isPortAvailable(8000);
      await portManager.isPortAvailable(8001);

      let stats = portManager.getUsageStats();
      expect(stats.cacheSize).toBe(2);

      // 特定のポートのキャッシュをクリア
      portManager.clearCache(8000);

      stats = portManager.getUsageStats();
      expect(stats.cacheSize).toBe(1);
    });
  });

  describe('統計情報機能', () => {
    it('使用状況の統計を取得できる', () => {
      portManager.markPortAsUsed(3000);
      portManager.markPortAsUsed(3001);

      const stats = portManager.getUsageStats();

      expect(stats.usedPortsCount).toBe(2);
      expect(stats.usedPorts).toEqual([3000, 3001]);
      expect(typeof stats.cacheSize).toBe('number');
    });

    it('使用中ポートがソートされて返される', () => {
      portManager.markPortAsUsed(3001);
      portManager.markPortAsUsed(3000);
      portManager.markPortAsUsed(3002);

      const stats = portManager.getUsageStats();

      expect(stats.usedPorts).toEqual([3000, 3001, 3002]);
    });
  });

  describe('リセット機能', () => {
    it('すべての状態をリセットできる', async () => {
      // 状態を設定
      portManager.markPortAsUsed(3000);
      await portManager.isPortAvailable(8000);

      let stats = portManager.getUsageStats();
      expect(stats.usedPortsCount).toBeGreaterThan(0);
      expect(stats.cacheSize).toBeGreaterThan(0);

      // リセット
      portManager.reset();

      stats = portManager.getUsageStats();
      expect(stats.usedPortsCount).toBe(0);
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe('エラーハンドリングの改善', () => {
    it('試行回数を含むエラーメッセージを表示する', async () => {
      // すべてのポートを使用中にする
      for (let port = 1024; port <= 1124; port++) {
        portManager.markPortAsUsed(port);
      }

      await expect(portManager.findAvailablePort(1024)).rejects.toThrow(/\d+回試行/);
    });
  });

  describe('パフォーマンス最適化', () => {
    it('大量のポート検証を効率的に処理する', async () => {
      const startTime = Date.now();

      // 50個のポートを並行チェック
      const promises = Array.from({ length: 50 }, (_, i) => portManager.isPortAvailable(9000 + i));

      const results = await Promise.all(promises);

      const duration = Date.now() - startTime;

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(2000); // 2秒以内で完了
    });
  });
});
