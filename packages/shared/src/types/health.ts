// ヘルスチェック関連の型定義

/**
 * ヘルスチェック状態
 *
 * サーバーの全体的な健康状態を表します。
 */
export type HealthStatus =
  /** サーバーが正常に動作している */
  | 'healthy'
  /** サーバーに問題がある */
  | 'unhealthy';

/**
 * サーバー状態
 *
 * 個別のサーバー（フロントエンド/バックエンド）の動作状態を表します。
 */
export type ServerState =
  /** サーバーが起動中 */
  | 'running'
  /** サーバーが停止中 */
  | 'stopped'
  /** サーバーでエラーが発生 */
  | 'error';

/**
 * ヘルスチェックレスポンス
 *
 * GET /api/health エンドポイントのレスポンス形式を定義します。
 * サーバーの基本的な状態情報を含みます。
 *
 * @example
 * ```typescript
 * const response: HealthResponse = {
 *   status: 'healthy',
 *   timestamp: '2024-01-01T00:00:00.000Z',
 *   version: '1.0.0',
 *   uptime: 3600
 * };
 * ```
 */
export interface HealthResponse {
  /** サーバーの全体的な健康状態 */
  readonly status: HealthStatus;
  /** レスポンス生成時刻（ISO 8601形式） */
  readonly timestamp: string;
  /** アプリケーションバージョン */
  readonly version: string;
  /** サーバー稼働時間（秒） */
  readonly uptime: number;
}

/**
 * 個別サーバー情報
 *
 * フロントエンドまたはバックエンドサーバーの詳細情報を表します。
 */
export interface ServerInfo {
  /** ポート番号 */
  readonly port: number;
  /** アクセスURL */
  readonly url: string;
  /** サーバー状態 */
  readonly status: ServerState;
}

/**
 * サーバー状態情報
 *
 * フロントエンドとバックエンドサーバーの状態を包括的に管理します。
 * 各サーバーのポート、URL、状態を含みます。
 */
export interface ServerStatus {
  /** フロントエンドサーバー情報 */
  readonly frontend: ServerInfo;
  /** バックエンドサーバー情報 */
  readonly backend: ServerInfo;
}
