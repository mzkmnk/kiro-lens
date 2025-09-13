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
  /** ファイルパス */
  path: string;
  /** アイテムの種類 */
  type: 'file' | 'folder';
  /** ファイルサイズ（ファイルの場合のみ） */
  size?: number;
  /** 子要素（フォルダの場合のみ） */
  children?: FileItem[];
}

/**
 * ファイルツリーAPIのレスポンス
 */
export interface FileTreeResponse {
  /** ファイル一覧 */
  files: FileItem[];
}
