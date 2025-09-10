import type { FileItem, ProjectInfo } from '@kiro-lens/shared';

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
