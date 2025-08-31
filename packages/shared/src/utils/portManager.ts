import type { PortConfiguration, CLIOptions, PortValidationResult } from '../types/port';
import { PORT_RANGE } from '../types/port';
import { createPortConfiguration, validatePortConfiguration } from './portUtils';

/**
 * ポート管理クラス
 *
 * 利用可能ポートの検出、ポート競合の検出、ランダムポート割り当てなどの
 * ポート管理機能を提供します。
 */
export class PortManager {
  protected readonly usedPorts = new Set<number>();
  private readonly portCache = new Map<number, { isAvailable: boolean; timestamp: number }>();
  private readonly cacheTimeout = 5000; // 5秒でキャッシュを無効化
  private readonly maxRetries = 100; // ポート検索の最大試行回数

  /**
   * 指定されたポートが利用可能かどうかを確認する
   *
   * @param port - 確認するポート番号
   * @returns ポートが利用可能かどうか
   */
  async isPortAvailable(port: number): Promise<boolean> {
    // 無効なポート番号の場合はfalseを返す
    if (!this.isValidPort(port)) {
      return false;
    }

    // 特権ポートは避ける
    if (port < PORT_RANGE.SAFE_MIN) {
      return false;
    }

    // 使用中として登録されているポートはfalse
    if (this.usedPorts.has(port)) {
      return false;
    }

    // キャッシュをチェック
    const cached = this.portCache.get(port);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.isAvailable;
    }

    try {
      // 実際のポート使用状況をチェック
      const isInUse = await this.checkPortInUse(port);
      const isAvailable = !isInUse;

      // 結果をキャッシュ
      this.portCache.set(port, {
        isAvailable,
        timestamp: Date.now(),
      });

      return isAvailable;
    } catch (error) {
      // エラー時は安全側に倒してfalseを返す
      return false;
    }
  }

  /**
   * 指定されたポートが実際に使用中かどうかをチェックする
   *
   * @param port - チェックするポート番号
   * @returns ポートが使用中かどうか
   */
  async checkPortInUse(port: number): Promise<boolean> {
    // 基本実装では、実際のネットワークチェックは行わない
    // バックエンド実装でオーバーライドされる
    return Promise.resolve(false);
  }

  /**
   * 指定されたポートから利用可能なポートを検索する
   *
   * @param startPort - 検索開始ポート
   * @returns 利用可能なポート番号
   */
  async findAvailablePort(startPort: number): Promise<number> {
    if (!this.isValidPort(startPort)) {
      throw new Error('無効なポート番号です');
    }

    // 特権ポートは避ける
    const searchStart = Math.max(startPort, PORT_RANGE.SAFE_MIN);
    let attempts = 0;

    for (
      let port = searchStart;
      port <= PORT_RANGE.MAX && attempts < this.maxRetries;
      port++, attempts++
    ) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }

    throw new Error(`利用可能なポートが見つかりません（${attempts}回試行）`);
  }

  /**
   * ランダムな利用可能ポートを取得する
   *
   * @param minPort - 最小ポート番号（デフォルト: 8000）
   * @param maxPort - 最大ポート番号（デフォルト: 65535）
   * @returns 利用可能なランダムポート
   */
  async getRandomAvailablePort(
    minPort: number = PORT_RANGE.RANDOM_MIN,
    maxPort: number = PORT_RANGE.MAX
  ): Promise<number> {
    const attempts = 10; // 最大試行回数

    for (let i = 0; i < attempts; i++) {
      const randomPort = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;

      if (await this.isPortAvailable(randomPort)) {
        return randomPort;
      }
    }

    // ランダム検索で見つからない場合は順次検索
    return this.findAvailablePort(minPort);
  }

  /**
   * CLIオプションに基づいてポート設定を検出する
   *
   * @param options - CLIオプション
   * @returns 検出されたポート設定
   */
  async detectPorts(options: CLIOptions): Promise<PortConfiguration> {
    // 基本的なポート設定を作成
    const baseConfig = createPortConfiguration(options);

    // オプション未指定時（autoDetected=true）はランダムポートを使用
    if (baseConfig.autoDetected && !options.port && !options.frontendPort && !options.backendPort) {
      const randomFrontend = await this.getRandomAvailablePort();
      const randomBackend = await this.findAvailablePort(randomFrontend + 1);

      // 使用中として登録
      this.markPortAsUsed(randomFrontend);
      this.markPortAsUsed(randomBackend);

      return {
        frontend: randomFrontend,
        backend: randomBackend,
        autoDetected: true,
      };
    }

    // 指定されたポートが利用可能かチェック
    const frontendAvailable = await this.isPortAvailable(baseConfig.frontend);
    const backendAvailable = await this.isPortAvailable(baseConfig.backend);

    // 両方とも利用可能な場合はそのまま返す
    if (frontendAvailable && backendAvailable) {
      // 使用中として登録
      this.markPortAsUsed(baseConfig.frontend);
      this.markPortAsUsed(baseConfig.backend);
      return baseConfig;
    }

    // ポート競合がある場合は代替ポートを検出
    const alternativeFrontend = await this.findAvailablePort(
      baseConfig.autoDetected ? PORT_RANGE.RANDOM_MIN : baseConfig.frontend + 1
    );
    const alternativeBackend = await this.findAvailablePort(alternativeFrontend + 1);

    // 代替ポートを使用中として登録
    this.markPortAsUsed(alternativeFrontend);
    this.markPortAsUsed(alternativeBackend);

    return {
      frontend: alternativeFrontend,
      backend: alternativeBackend,
      autoDetected: true, // 代替ポートが自動検出された
      requestedPorts: baseConfig.autoDetected
        ? undefined
        : {
            frontend: baseConfig.frontend,
            backend: baseConfig.backend,
          },
    };
  }

  /**
   * ポートを使用中として登録する
   *
   * @param port - 使用中として登録するポート
   */
  markPortAsUsed(port: number): void {
    this.usedPorts.add(port);
    // キャッシュも更新
    this.portCache.set(port, {
      isAvailable: false,
      timestamp: Date.now(),
    });
  }

  /**
   * ポートを解放する
   *
   * @param port - 解放するポート
   */
  releasePort(port: number): void {
    this.usedPorts.delete(port);
    // キャッシュをクリア
    this.portCache.delete(port);
  }

  /**
   * 指定範囲内で利用可能なポートを検索する
   *
   * @param startPort - 開始ポート
   * @param endPort - 終了ポート
   * @returns 利用可能なポート番号、見つからない場合はnull
   */
  async findAvailablePortInRange(startPort: number, endPort: number): Promise<number | null> {
    for (let port = startPort; port <= endPort; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    return null;
  }

  /**
   * ポート番号が有効かどうかを確認する
   *
   * @param port - 確認するポート番号
   * @returns ポート番号が有効かどうか
   */
  private isValidPort(port: number): boolean {
    return Number.isInteger(port) && port >= PORT_RANGE.MIN && port <= PORT_RANGE.MAX;
  }

  /**
   * キャッシュをクリアする
   *
   * @param port - 特定のポートのキャッシュをクリア（未指定時は全てクリア）
   */
  clearCache(port?: number): void {
    if (port !== undefined) {
      this.portCache.delete(port);
    } else {
      this.portCache.clear();
    }
  }

  /**
   * 期限切れのキャッシュエントリを削除する
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [port, entry] of this.portCache.entries()) {
      if (now - entry.timestamp > this.cacheTimeout) {
        this.portCache.delete(port);
      }
    }
  }

  /**
   * 使用中ポートの統計情報を取得する
   *
   * @returns 使用中ポートの統計
   */
  getUsageStats(): {
    usedPortsCount: number;
    cacheSize: number;
    usedPorts: number[];
  } {
    this.cleanupExpiredCache();

    return {
      usedPortsCount: this.usedPorts.size,
      cacheSize: this.portCache.size,
      usedPorts: Array.from(this.usedPorts).sort((a, b) => a - b),
    };
  }

  /**
   * すべてのポートを解放し、キャッシュをクリアする
   */
  reset(): void {
    this.usedPorts.clear();
    this.portCache.clear();
  }
}
