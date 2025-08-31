import { describe, it, expect, beforeEach } from 'vitest';
import { BackendPortManager } from './portManager';

describe('BackendPortManager - Refactored Features', () => {
  let portManager: BackendPortManager;

  beforeEach(() => {
    portManager = new BackendPortManager();
  });

  describe('バッチ処理機能', () => {
    it('複数ポートの並行チェックができる', async () => {
      const ports = [9000, 9001, 9002, 9003, 9004];

      const results = await portManager.checkMultiplePortsAvailability(ports);

      expect(results.size).toBe(ports.length);
      for (const port of ports) {
        expect(results.has(port)).toBe(true);
        expect(typeof results.get(port)).toBe('boolean');
      }
    });

    it('並行処理数を制限できる', async () => {
      const ports = Array.from({ length: 20 }, (_, i) => 9100 + i);

      const startTime = Date.now();
      const results = await portManager.checkMultiplePortsAvailability(ports, 5);
      const duration = Date.now() - startTime;

      expect(results.size).toBe(ports.length);
      expect(duration).toBeLessThan(5000); // 5秒以内で完了
    });
  });

  describe('複数ポート検索機能', () => {
    it('指定数の利用可能ポートを見つけることができる', async () => {
      const ports = await portManager.findMultipleAvailablePorts(9200, 9300, 5);

      expect(ports).toHaveLength(5);
      expect(ports.every(port => port >= 9200 && port <= 9300)).toBe(true);

      // 重複がないことを確認
      const uniquePorts = new Set(ports);
      expect(uniquePorts.size).toBe(ports.length);
    });

    it('利用可能なポートが少ない場合は見つかった分だけ返す', async () => {
      // 狭い範囲で大量のポートを要求
      const ports = await portManager.findMultipleAvailablePorts(9350, 9355, 20);

      expect(ports.length).toBeLessThanOrEqual(6); // 範囲内の最大数
      expect(ports.every(port => port >= 9350 && port <= 9355)).toBe(true);
    });
  });

  describe('ポート使用状況統計', () => {
    it('指定範囲のポート使用状況を取得できる', async () => {
      const stats = await portManager.getPortUsageStats(9400, 9410);

      expect(stats.total).toBe(11); // 9400-9410 = 11ポート
      expect(stats.available).toBeGreaterThanOrEqual(0);
      expect(stats.used).toBeGreaterThanOrEqual(0);
      expect(stats.available + stats.used).toBe(stats.total);
      expect(Array.isArray(stats.availablePorts)).toBe(true);
    });
  });

  describe('健全性チェック機能', () => {
    it('基本的な健全性チェックができる', async () => {
      const health = await portManager.healthCheck();

      expect(typeof health.isHealthy).toBe('boolean');
      expect(Array.isArray(health.issues)).toBe(true);
      expect(typeof health.stats.usedPortsCount).toBe('number');
      expect(typeof health.stats.cacheSize).toBe('number');
      expect(typeof health.stats.testPortAvailable).toBe('boolean');
    });

    it('正常な状態では健全と判定される', async () => {
      const health = await portManager.healthCheck();

      expect(health.isHealthy).toBe(true);
      expect(health.issues).toHaveLength(0);
    });
  });

  describe('パフォーマンス改善', () => {
    it('タイムアウト時間が短縮されている', async () => {
      const startTime = Date.now();

      // 存在しないホストでのチェック（タイムアウトが発生）
      const result = await portManager.isPortAvailable(9500, 'nonexistent.host');

      const duration = Date.now() - startTime;

      expect(result).toBe(false); // タイムアウト時はfalse
      expect(duration).toBeLessThan(1000); // 1秒以内（以前は1秒だったが、500msに短縮）
    });

    it('エラー処理が改善されている', async () => {
      // 無効なホスト名でのテスト
      const result = await portManager.isPortAvailable(9501, 'invalid..host');

      expect(typeof result).toBe('boolean');
      expect(result).toBe(false); // エラー時は安全側に倒す
    });
  });
});
