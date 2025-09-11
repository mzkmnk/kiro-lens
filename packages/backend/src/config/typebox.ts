import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value } from '@sinclair/typebox/value';
import type { TSchema } from '@sinclair/typebox';

/**
 * 高性能TypeBoxバリデーター
 *
 * スキーマをコンパイルしてキャッシュすることで、
 * バリデーションのパフォーマンスを大幅に向上させます。
 */
export class OptimizedValidator {
  private static compiledValidators = new Map<string, any>();
  private static compiledCheckers = new Map<string, any>();

  /**
   * スキーマをコンパイルしてキャッシュ
   *
   * @param schema - TypeBoxスキーマ
   * @param key - キャッシュキー
   * @returns コンパイル済みバリデーター
   */
  static compile<T extends TSchema>(schema: T, key: string) {
    if (!this.compiledValidators.has(key)) {
      const compiled = TypeCompiler.Compile(schema);
      this.compiledValidators.set(key, compiled);
    }
    return this.compiledValidators.get(key);
  }

  /**
   * 高速バリデーション実行
   *
   * @param schema - TypeBoxスキーマ
   * @param value - 検証する値
   * @param key - キャッシュキー
   * @returns バリデーション結果
   */
  static validate<T extends TSchema>(schema: T, value: unknown, key: string): boolean {
    const validator = this.compile(schema, key);
    return validator.Check(value);
  }

  /**
   * エラー詳細付きバリデーション
   *
   * @param schema - TypeBoxスキーマ
   * @param value - 検証する値
   * @param key - キャッシュキー
   * @returns バリデーション結果とエラー詳細
   */
  static validateWithErrors<T extends TSchema>(schema: T, value: unknown, key: string) {
    const validator = this.compile(schema, key);
    const errors = [...validator.Errors(value)];
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Value.Checkを使用した軽量バリデーション
   *
   * @param schema - TypeBoxスキーマ
   * @param value - 検証する値
   * @param key - キャッシュキー（統計用）
   * @returns バリデーション結果
   */
  static check<T extends TSchema>(schema: T, value: unknown, key?: string): boolean {
    if (key && !this.compiledCheckers.has(key)) {
      this.compiledCheckers.set(key, schema);
    }
    return Value.Check(schema, value);
  }

  /**
   * キャッシュ統計情報を取得
   *
   * @returns キャッシュ統計
   */
  static getCacheStats() {
    return {
      compiledValidators: this.compiledValidators.size,
      compiledCheckers: this.compiledCheckers.size,
      totalCached: this.compiledValidators.size + this.compiledCheckers.size,
    };
  }

  /**
   * キャッシュをクリア
   */
  static clearCache() {
    this.compiledValidators.clear();
    this.compiledCheckers.clear();
  }

  /**
   * 特定のキーのキャッシュを削除
   *
   * @param key - 削除するキャッシュキー
   */
  static removeFromCache(key: string) {
    this.compiledValidators.delete(key);
    this.compiledCheckers.delete(key);
  }
}

/**
 * TypeBoxパフォーマンス設定
 */
export const TypeBoxConfig = {
  /**
   * AJV設定（Fastifyで使用）
   */
  ajvOptions: {
    // 厳密モードを無効化してパフォーマンスを向上
    strict: false,
    // 型強制を有効化
    coerceTypes: true,
    // デフォルト値を使用
    useDefaults: true,
    // 追加プロパティを削除
    removeAdditional: true,
    // エラーメッセージを詳細化
    allErrors: false,
    // JSONスキーマドラフトバージョン
    schemaId: 'auto',
    // パフォーマンス最適化
    cache: new Map(),
  },

  /**
   * TypeCompiler設定
   */
  compilerOptions: {
    // 最適化レベル
    optimize: true,
    // エラー詳細レベル
    errorDetail: 'minimal' as const,
  },

  /**
   * バリデーション設定
   */
  validationOptions: {
    // 早期終了（最初のエラーで停止）
    earlyExit: true,
    // 型変換を許可
    allowTypeCoercion: true,
    // 追加プロパティを許可しない
    additionalProperties: false,
  },
} as const;

/**
 * パフォーマンス測定ユーティリティ
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  /**
   * パフォーマンス測定開始
   *
   * @param key - 測定キー
   * @returns 測定開始時刻
   */
  static start(key: string): number {
    return performance.now();
  }

  /**
   * パフォーマンス測定終了
   *
   * @param key - 測定キー
   * @param startTime - 測定開始時刻
   */
  static end(key: string, startTime: number) {
    const duration = performance.now() - startTime;

    if (!this.measurements.has(key)) {
      this.measurements.set(key, []);
    }

    const measurements = this.measurements.get(key)!;
    measurements.push(duration);

    // 最新100件のみ保持
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  /**
   * パフォーマンス統計を取得
   *
   * @param key - 測定キー
   * @returns パフォーマンス統計
   */
  static getStats(key: string) {
    const measurements = this.measurements.get(key) || [];

    if (measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);

    return {
      count: measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      avg: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * すべての統計を取得
   *
   * @returns 全パフォーマンス統計
   */
  static getAllStats() {
    const stats: Record<string, any> = {};

    for (const [key] of this.measurements) {
      stats[key] = this.getStats(key);
    }

    return stats;
  }

  /**
   * 統計をクリア
   */
  static clear() {
    this.measurements.clear();
  }
}
