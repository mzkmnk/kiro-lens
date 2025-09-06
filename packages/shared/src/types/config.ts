// 設定管理関連の型定義

import type { ProjectInfo } from './project';

/**
 * アプリケーション設定
 *
 * kiro-lensの設定情報を管理するための型定義です。
 * ユーザーホームディレクトリの.kiro-lensフォルダに保存されます。
 */
export interface AppConfig {
  /** 設定ファイルのバージョン */
  readonly version: string;
  /** 管理対象のプロジェクト一覧 */
  readonly projects: readonly ProjectInfo[];
  /** アプリケーション設定 */
  readonly settings: AppSettings;
  /** 設定ファイルのメタデータ */
  readonly metadata: ConfigMetadata;
}

/**
 * アプリケーション設定項目
 *
 * ユーザーが設定可能な項目を定義します。
 */
export interface AppSettings {
  /** 最後に選択されたプロジェクトID */
  readonly lastSelectedProject?: string;
  /** UIテーマ */
  readonly theme: 'light' | 'dark' | 'system';
  /** 自動保存機能の有効/無効 */
  readonly autoSave: boolean;
  /** 最近使用したプロジェクトの最大保持数 */
  readonly maxRecentProjects: number;
}

/**
 * 設定ファイルメタデータ
 *
 * 設定ファイルの管理情報を含みます。
 */
export interface ConfigMetadata {
  /** 設定ファイル作成日時 */
  readonly createdAt: string;
  /** 設定ファイル最終更新日時 */
  readonly updatedAt: string;
  /** 設定ファイルのパス */
  readonly configPath: string;
}
