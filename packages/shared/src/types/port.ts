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
 */
export interface PortValidationResult {
  /** ポートが利用可能かどうか */
  readonly isAvailable: boolean;
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
