// ポート設定関連の型定義

/**
 * ポート番号の有効範囲
 */
export const PORT_RANGE = {
  MIN: 1,
  MAX: 65535,
  SAFE_MIN: 1024, // 特権ポートを避ける
  RANDOM_MIN: 8000, // ランダムポート生成時の最小値
} as const;

/**
 * ポート設定
 *
 * フロントエンドとバックエンドサーバーのポート設定を管理します。
 * 自動検出機能により、利用可能なポートを動的に割り当てることができます。
 *
 * @example
 * ```typescript
 * const config: PortConfiguration = {
 *   frontend: 3000,
 *   backend: 3001,
 *   autoDetected: false
 * };
 * ```
 */
export interface PortConfiguration {
  /** フロントエンドポート番号 (1-65535) */
  readonly frontend: number;
  /** バックエンドポート番号 (1-65535) */
  readonly backend: number;
  /** 自動検出されたポートかどうか */
  readonly autoDetected: boolean;
  /** 要求されたポート設定（自動検出時の元の要求） */
  readonly requestedPorts?: {
    readonly frontend?: number;
    readonly backend?: number;
  };
}

/**
 * CLIオプション
 *
 * kiro-lensコマンドで使用可能なオプションを定義します。
 * すべてのオプションは任意で、未指定時は適切なデフォルト値が使用されます。
 *
 * @example
 * ```typescript
 * const options: CLIOptions = {
 *   port: 3000,
 *   verbose: true
 * };
 * ```
 */
export interface CLIOptions {
  /** フロントエンドポート（バックエンドはport+1になります） */
  readonly port?: number;
  /** フロントエンドポート（個別指定） */
  readonly frontendPort?: number;
  /** バックエンドポート（個別指定） */
  readonly backendPort?: number;
  /** ブラウザを自動で開かない */
  readonly noOpen?: boolean;
  /** 詳細ログ出力を有効にする */
  readonly verbose?: boolean;
}

/**
 * ポート検証結果
 *
 * 指定されたポートが利用可能かどうかの検証結果を表します。
 * 利用不可能な場合は、競合プロセス情報や代替ポートの提案を含みます。
 */
export interface PortValidationResult {
  /** ポートが利用可能かどうか */
  readonly isAvailable: boolean;
  /** 競合しているプロセス情報 */
  readonly conflictingProcess?: string;
  /** 代替ポート提案 */
  readonly suggestedAlternative?: number;
}

/**
 * Foundation エラータイプ
 *
 * kiro-lens-foundationで発生する可能性のあるエラーの種類を定義します。
 */
export type FoundationErrorType =
  /** ポートが既に使用中 */
  | 'PORT_IN_USE'
  /** ポートへのアクセス権限がない */
  | 'PORT_PERMISSION_DENIED'
  /** .kiroディレクトリが見つからない */
  | 'KIRO_DIR_NOT_FOUND'
  /** サーバーの起動に失敗 */
  | 'SERVER_START_FAILED'
  /** 無効なプロジェクトディレクトリ */
  | 'INVALID_PROJECT_DIR';

/**
 * Foundation エラー
 *
 * kiro-lens-foundationで発生するエラーの詳細情報を表します。
 * 復旧可能性や推奨アクションを含み、ユーザーフレンドリーなエラー処理を支援します。
 */
export interface FoundationError {
  /** エラータイプ */
  readonly type: FoundationErrorType;
  /** ユーザー向けエラーメッセージ */
  readonly message: string;
  /** エラー詳細情報（デバッグ用） */
  readonly details?: unknown;
  /** エラー発生時刻 */
  readonly timestamp: Date;
  /** 復旧可能かどうか */
  readonly recoverable: boolean;
  /** ユーザーへの推奨アクション */
  readonly suggestedAction?: string;
}

/**
 * ポート設定検証結果
 *
 * PortConfigurationの妥当性検証の結果を表します。
 * 無効な設定の場合は、具体的なエラーメッセージの配列を含みます。
 */
export interface PortConfigurationValidationResult {
  /** 設定が有効かどうか */
  readonly isValid: boolean;
  /** エラーメッセージ一覧 */
  readonly errors: readonly string[];
}

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
 * ポート番号が特権ポート範囲かどうかを検証する
 *
 * @param port - 検証するポート番号
 * @returns 特権ポート範囲かどうか
 */
export function isPrivilegedPort(port: number): boolean {
  return port < PORT_RANGE.SAFE_MIN;
}

/**
 * ポート設定を検証する
 *
 * PortConfigurationの妥当性を包括的に検証します。
 * ポート番号の範囲、重複、特権ポートの使用などをチェックします。
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

  // 特権ポートの警告（エラーではなく警告として扱う）
  if (isPrivilegedPort(config.frontend)) {
    errors.push(
      `フロントエンドポート${config.frontend}は特権ポートです。管理者権限が必要な場合があります`
    );
  }

  if (isPrivilegedPort(config.backend)) {
    errors.push(
      `バックエンドポート${config.backend}は特権ポートです。管理者権限が必要な場合があります`
    );
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
  };
}

/**
 * 安全なランダムポート番号を生成する
 *
 * @returns 特権ポート範囲を避けたランダムポート番号
 */
export function generateRandomPort(): number {
  const range = PORT_RANGE.MAX - PORT_RANGE.RANDOM_MIN;
  return Math.floor(Math.random() * range) + PORT_RANGE.RANDOM_MIN;
}

/**
 * CLIオプションからポート設定を作成する
 *
 * CLIで指定されたオプションに基づいて、適切なPortConfigurationを生成します。
 * 優先順位: 個別ポート指定 > フロントエンドポート指定 > 自動検出
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

  // オプション未指定時はランダムポートを生成
  const randomPort = generateRandomPort();
  return Object.freeze({
    frontend: randomPort,
    backend: randomPort + 1,
    autoDetected: true,
  });
}
