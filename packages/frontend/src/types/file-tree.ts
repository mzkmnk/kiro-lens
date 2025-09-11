import type { FileItem } from '@kiro-lens/shared';

/**
 * ファイルツリーコンポーネントのプロパティ
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
 * ファイルツリーアイテムコンポーネントのプロパティ
 */
export interface FileTreeItemProps {
  /** 表示するファイルアイテム */
  item: FileItem;
  /** ファイル選択時のコールバック */
  onFileSelect?: (file: FileItem) => void;
  /** フォルダ展開状態変更時のコールバック */
  onFolderToggle?: (folder: FileItem, isOpen: boolean) => void;
}
