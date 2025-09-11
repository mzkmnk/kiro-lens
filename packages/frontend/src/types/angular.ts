/**
 * Angular固有の型定義
 */

import { Signal } from "@angular/core";

/**
 * Angular Signalsベースの状態管理型定義
 */
export interface SignalState<T> {
  readonly value: Signal<T>;
  set: (value: T) => void;
  update: (updater: (current: T) => T) => void;
}

/**
 * Angular コンポーネントのプロパティ型定義
 */
export interface ComponentProps {
  [key: string]: unknown;
}

/**
 * Angular サービスの基底インターフェース
 */
export interface BaseService {
  readonly serviceName: string;
}

/**
 * Angular HTTP エラーレスポンス型定義
 */
export interface HttpErrorResponse {
  error: unknown;
  headers: Record<string, string>;
  status: number;
  statusText: string;
  url: string | null;
}
