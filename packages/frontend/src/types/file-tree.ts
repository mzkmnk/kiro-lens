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

/**
 * ファイルツリーのプロパティ
 */
export interface FileTreeProps {
  /** 表示するファイルアイテムのリスト */
  items: FileItem[];
  /** ファイル選択時のコールバック */
  onFileSelect?: (file: FileItem) => void;
  /** フォルダ展開状態変更時のコールバック */
  onFolderToggle?: (folder: FileItem, isOpen: boolean) => void;
}

/**
 * ファイルツリーアイテムのプロパティ
 */
export interface FileTreeItemProps {
  /** 表示するファイルアイテム */
  item: FileItem;
  /** ファイル選択時のコールバック */
  onFileSelect?: (file: FileItem) => void;
  /** フォルダ展開状態変更時のコールバック */
  onFolderToggle?: (folder: FileItem, isOpen: boolean) => void;
}