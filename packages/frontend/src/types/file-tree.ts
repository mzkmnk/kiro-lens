import { FileItem } from '@shared/types/file-tree';

/**
 * ファイルツリーに関する型定義
 */

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
