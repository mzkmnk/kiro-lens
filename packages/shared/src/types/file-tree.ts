/**
 * ファイルツリーに関する型定義
 */

/**
 * ファイルまたはフォルダを表すアイテム
 */
export interface FileItem {
  /** 一意のID */
  id: string;
  /** ファイル/フォルダ名 */
  name: string;
  /** アイテムの種類 */
  type: 'file' | 'folder';
  /** 子要素（フォルダの場合のみ） */
  children?: FileItem[];
}
