import type { FileItem } from '@kiro-lens/shared';
import type { ProjectInfo } from '@kiro-lens/shared';

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

/**
 * プロジェクト状態管理の型定義
 */
export interface ProjectState {
  // 状態
  projects: ProjectInfo[];
  currentProject?: ProjectInfo;
  selectedFile?: FileItem;
  isAddingProject: boolean;
  isLoading: boolean;
  error?: string;

  // 計算プロパティ
  hasKiroDir: boolean;

  // アクション
  loadProjects: () => Promise<void>;
  addProject: (path: string) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;
  selectProject: (project: ProjectInfo) => Promise<void>;
  setSelectedFile: (file?: FileItem) => void;
  setAddingProjectMode: (isAdding: boolean) => void;
  clearError: () => void;
  setError: (error: string) => void;
}
