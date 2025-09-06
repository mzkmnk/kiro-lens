/**
 * MSW ハンドラーのエクスポート管理
 *
 * 各エンドポイント別のハンドラーファイルをインポートし、
 * 統一されたハンドラー配列として提供します。
 */

import { healthHandlers } from './health';
import { projectHandlers } from './project';
import type { MSWHandler } from '../types';

/**
 * 全てのMSWハンドラーを統合した配列
 * 各エンドポイント別のハンドラーを結合して提供
 */
export const handlers: MSWHandler[] = [...healthHandlers, ...projectHandlers];

// 個別のハンドラーグループも再エクスポート
export { healthHandlers } from './health';
export { projectHandlers } from './project';
