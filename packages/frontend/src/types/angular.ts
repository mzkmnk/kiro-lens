/**
 * Angular固有の型定義
 */

import { Signal } from "@angular/core";

/**
 * Signalベースの状態管理用型定義
 */
export interface SignalState<T> {
  readonly value: Signal<T>;
  readonly set: (value: T) => void;
  readonly update: (updateFn: (current: T) => T) => void;
}

/**
 * コンポーネントの基本プロパティ
 */
export interface BaseComponentProps {
  readonly id?: string;
  readonly className?: string;
  readonly disabled?: boolean;
}

/**
 * エラー状態管理用型定義
 */
export interface ErrorState {
  readonly hasError: boolean;
  readonly message?: string;
  readonly code?: string;
}

/**
 * ローディング状態管理用型定義
 */
export interface LoadingState {
  readonly isLoading: boolean;
  readonly operation?: string;
}

/**
 * フォーム状態管理用型定義
 */
export interface FormState<T> {
  readonly value: T;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly errors?: Record<string, string>;
}

/**
 * リスト操作用型定義
 */
export interface ListOperations<T> {
  readonly add: (item: T) => void;
  readonly remove: (id: string) => void;
  readonly update: (id: string, item: Partial<T>) => void;
  readonly clear: () => void;
}

/**
 * 選択状態管理用型定義
 */
export interface SelectionState<T> {
  readonly selected: T | null;
  readonly select: (item: T) => void;
  readonly deselect: () => void;
}
