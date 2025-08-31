// ポート関連のユーティリティ関数

import type {
  PortConfiguration,
  CLIOptions,
  PortConfigurationValidationResult,
} from '../types/port';
import { PORT_RANGE } from '../types/port';

/**
 * ポート番号が有効な範囲内かどうかを検証する
 *
 * @param port - 検証するポート番号
 * @returns ポート番号が有効かどうか
 */
export function isValidPortNumber(port: number): boolean {
  return Number.isInteger(port) && port >= PORT_RANGE.MIN && port <= PORT_RANGE.MAX;
}

/**
 * ポート設定を検証する
 *
 * PortConfigurationの妥当性を包括的に検証します。
 * ポート番号の範囲、重複などをチェックします。
 *
 * @param config - 検証するポート設定
 * @returns 検証結果
 */
export function validatePortConfiguration(
  config: PortConfiguration
): PortConfigurationValidationResult {
  const errors: string[] = [];

  // ポート番号の範囲チェック
  if (!isValidPortNumber(config.frontend)) {
    errors.push(
      `フロントエンドポートは${PORT_RANGE.MIN}-${PORT_RANGE.MAX}の範囲で指定してください`
    );
  }

  if (!isValidPortNumber(config.backend)) {
    errors.push(`バックエンドポートは${PORT_RANGE.MIN}-${PORT_RANGE.MAX}の範囲で指定してください`);
  }

  // 同じポート番号の使用チェック
  if (config.frontend === config.backend) {
    errors.push('フロントエンドとバックエンドで同じポートは使用できません');
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
  };
}

/**
 * CLIオプションからポート設定を作成する
 *
 * CLIで指定されたオプションに基づいて、適切なPortConfigurationを生成します。
 * 優先順位: 個別ポート指定 > フロントエンドポート指定 > デフォルト値
 *
 * @param options - CLIオプション
 * @returns 生成されたポート設定
 */
export function createPortConfiguration(options: CLIOptions): PortConfiguration {
  // 個別ポート指定がある場合
  if (options.frontendPort && options.backendPort) {
    return Object.freeze({
      frontend: options.frontendPort,
      backend: options.backendPort,
      autoDetected: false,
    });
  }

  // フロントエンドポートのみ指定がある場合
  if (options.port) {
    return Object.freeze({
      frontend: options.port,
      backend: options.port + 1,
      autoDetected: false,
    });
  }

  // オプション未指定時はデフォルトポートを使用
  return Object.freeze({
    frontend: 3000,
    backend: 3001,
    autoDetected: true,
  });
}
