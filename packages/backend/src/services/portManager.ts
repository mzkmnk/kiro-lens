import { createServer } from 'node:net';
import type { PortConfiguration, CLIOptions } from '@shared/types/port';
import { PortManager as BasePortManager } from '@shared/utils/portManager';

/**
 * バックエンド用ポート管理クラス
 *
 * 実際のネットワーク機能を使用してポートの利用可能性をチェックします。
 */
export class BackendPortManager extends BasePortManager {
  /**
   * 実際のネットワーク接続を使用してポートの使用状況をチェックする
   *
   * @param port - チェックするポート番号
   * @param host - ホスト名（デフォルト: localhost）
   * @returns ポートが使用中かどうか
   */
  async checkPortInUse(port: number, host: string = 'localhost'): Promise<boolean> {
    return new Promise(resolve => {
      const server = createServer();
      let resolved = false;

      // タイムアウト設定（短縮して高速化）
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          server.close();
          resolve(true); // タイムアウト時は使用中として判定
        }
      }, 500);

      server.listen(port, host, () => {
        // ポートが利用可能（サーバーが起動できた）
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          server.close(() => {
            resolve(false);
          });
        }
      });

      server.on('error', (err: any) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          if (err.code === 'EADDRINUSE') {
            // ポートが使用中
            resolve(true);
          } else if (err.code === 'EACCES') {
            // 権限がない（特権ポートなど）
            resolve(true);
          } else if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
            // ネットワークエラー
            resolve(true);
          } else {
            // その他のエラーは使用中として判定
            resolve(true);
          }
        }
      });
    });
  }

  /**
   * IPv4とIPv6の両方でポートの利用可能性をチェックする
   *
   * @param port - チェックするポート番号
   * @returns ポートが利用可能かどうか
   */
  async isPortAvailable(port: number, host?: string): Promise<boolean> {
    // 無効なポート番号の場合はfalseを返す
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return false;
    }

    // 特権ポートは避ける
    if (port < 1024) {
      return false;
    }

    // 使用中として登録されているポートはfalse
    if (this.usedPorts.has(port)) {
      return false;
    }

    try {
      // 指定されたホストでのチェック
      if (host) {
        const isInUse = await this.checkPortInUse(port, host);
        return !isInUse;
      }

      // IPv4でのチェック
      const ipv4InUse = await this.checkPortInUse(port, '127.0.0.1');
      if (ipv4InUse) {
        return false;
      }

      // IPv6でのチェック（利用可能な場合のみ）
      try {
        const ipv6InUse = await this.checkPortInUse(port, '::1');
        if (ipv6InUse) {
          return false;
        }
      } catch {
        // IPv6が利用できない環境では無視
      }

      return true;
    } catch (error) {
      // エラー時は安全側に倒す
      return false;
    }
  }

  /**
   * システムでよく使用されるポートを避けてポートを検索する
   *
   * @param startPort - 検索開始ポート
   * @returns 利用可能なポート番号
   */
  async findAvailablePort(startPort: number): Promise<number> {
    // よく使用されるポート番号のリスト
    const commonPorts = new Set([
      3000,
      3001,
      3002,
      3003, // 開発サーバー
      8000,
      8001,
      8080,
      8081, // HTTP代替
      9000,
      9001,
      9090,
      9091, // その他の開発用
      5000,
      5001,
      5432,
      5984, // データベース等
    ]);

    let currentPort = Math.max(startPort, 1024); // 特権ポートを避ける

    while (currentPort <= 65535) {
      // よく使用されるポートをスキップ
      if (commonPorts.has(currentPort)) {
        currentPort++;
        continue;
      }

      if (await this.isPortAvailable(currentPort)) {
        return currentPort;
      }

      currentPort++;
    }

    throw new Error('利用可能なポートが見つかりません');
  }

  /**
   * 複数のポート設定要求を並行処理する
   *
   * @param optionsList - 複数のCLIオプション
   * @returns 検出されたポート設定の配列
   */
  async detectMultiplePorts(optionsList: CLIOptions[]): Promise<PortConfiguration[]> {
    const results: PortConfiguration[] = [];
    const usedPorts = new Set<number>();

    for (const options of optionsList) {
      const config = await this.detectPorts(options);

      // 他の設定と重複しないことを確認
      while (usedPorts.has(config.frontend) || usedPorts.has(config.backend)) {
        const newFrontend = await this.findAvailablePort(config.frontend + 1);
        const newBackend = await this.findAvailablePort(newFrontend + 1);

        Object.assign(config, {
          frontend: newFrontend,
          backend: newBackend,
          autoDetected: true,
        });
      }

      // 使用ポートとして登録
      usedPorts.add(config.frontend);
      usedPorts.add(config.backend);
      this.markPortAsUsed(config.frontend);
      this.markPortAsUsed(config.backend);

      results.push(config);
    }

    return results;
  }

  /**
   * ポート検出のパフォーマンス最適化のためのバッチ処理
   *
   * @param ports - チェックするポート番号の配列
   * @param concurrency - 並行処理数（デフォルト: 10）
   * @returns 各ポートの利用可能性
   */
  async checkMultiplePortsAvailability(
    ports: number[],
    concurrency: number = 10
  ): Promise<Map<number, boolean>> {
    const results = new Map<number, boolean>();

    // 並行処理数を制限してポートをチェック
    for (let i = 0; i < ports.length; i += concurrency) {
      const batch = ports.slice(i, i + concurrency);
      const promises = batch.map(async port => {
        const isAvailable = await this.isPortAvailable(port);
        return { port, isAvailable };
      });

      const batchResults = await Promise.all(promises);

      for (const { port, isAvailable } of batchResults) {
        results.set(port, isAvailable);
      }
    }

    return results;
  }

  /**
   * ポート使用状況の統計情報を取得する
   *
   * @param startPort - 開始ポート
   * @param endPort - 終了ポート
   * @returns 使用状況の統計
   */
  async getPortUsageStats(
    startPort: number,
    endPort: number
  ): Promise<{
    total: number;
    available: number;
    used: number;
    availablePorts: number[];
  }> {
    const total = endPort - startPort + 1;
    const ports = Array.from({ length: total }, (_, i) => startPort + i);

    const availability = await this.checkMultiplePortsAvailability(ports);

    const availablePorts = ports.filter(port => availability.get(port) === true);
    const available = availablePorts.length;
    const used = total - available;

    return {
      total,
      available,
      used,
      availablePorts,
    };
  }

  /**
   * 効率的なポート範囲検索（バイナリサーチ風のアプローチ）
   *
   * @param startPort - 開始ポート
   * @param endPort - 終了ポート
   * @param count - 必要なポート数
   * @returns 利用可能なポートの配列
   */
  async findMultipleAvailablePorts(
    startPort: number,
    endPort: number,
    count: number
  ): Promise<number[]> {
    const availablePorts: number[] = [];
    const batchSize = Math.min(50, endPort - startPort + 1);

    for (
      let current = startPort;
      current <= endPort && availablePorts.length < count;
      current += batchSize
    ) {
      const batchEnd = Math.min(current + batchSize - 1, endPort);
      const batch = Array.from({ length: batchEnd - current + 1 }, (_, i) => current + i);

      const availability = await this.checkMultiplePortsAvailability(batch, 5);

      for (const port of batch) {
        if (availability.get(port) === true) {
          availablePorts.push(port);
          if (availablePorts.length >= count) {
            break;
          }
        }
      }
    }

    return availablePorts;
  }

  /**
   * ポート管理の健全性チェック
   *
   * @returns 健全性チェック結果
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    issues: string[];
    stats: {
      usedPortsCount: number;
      cacheSize: number;
      testPortAvailable: boolean;
    };
  }> {
    const issues: string[] = [];
    const stats = this.getUsageStats();

    // テストポートで基本機能をチェック
    let testPortAvailable = false;
    try {
      testPortAvailable = await this.isPortAvailable(65432);
    } catch (error) {
      issues.push('基本的なポート検証機能に問題があります');
    }

    // 使用中ポート数の異常チェック
    if (stats.usedPortsCount > 1000) {
      issues.push('使用中ポート数が異常に多いです');
    }

    // キャッシュサイズの異常チェック
    if (stats.cacheSize > 10000) {
      issues.push('キャッシュサイズが異常に大きいです');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      stats: {
        ...stats,
        testPortAvailable,
      },
    };
  }
}
