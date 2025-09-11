import { create } from 'zustand';
import { projectApiService, ApiClientError } from '@/services';
import type { ProjectInfo, FileItem } from '@kiro-lens/shared/types/generated';
import type { ProjectState } from '@/types/project-store';

// TypeBoxスキーマベースのprojectApiServiceを使用

export const useProjectStore = create<ProjectState>((set, get) => ({
  // 初期状態
  projects: [],
  currentProject: undefined,
  selectedFile: undefined,
  isAddingProject: false,
  isLoading: false,
  error: undefined,

  // 計算プロパティ
  get hasKiroDir() {
    const state = get();
    if (state.isAddingProject) {
      return false;
    }
    return state.currentProject?.hasKiroDir || false;
  },

  // プロジェクト一覧を取得
  loadProjects: async () => {
    try {
      set({ isLoading: true, error: undefined });
      const { projects } = await projectApiService.getProjects();
      set({
        projects: [...projects],
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'プロジェクトの取得に失敗しました';

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  // プロジェクトを追加
  addProject: async (path: string) => {
    try {
      set({ error: undefined });
      const { project } = await projectApiService.addProject(path);
      const { projects } = get();

      // 新しいプロジェクトを追加して選択、プロジェクト追加モードを終了
      set({
        projects: [...projects, project],
        currentProject: project,
        isAddingProject: false,
        selectedFile: undefined, // プロジェクト変更時にファイル選択をクリア
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'プロジェクトの追加に失敗しました';

      set({
        error: errorMessage,
      });
    }
  },

  // プロジェクトを削除
  removeProject: async (projectId: string) => {
    try {
      set({ error: undefined });
      await projectApiService.deleteProject(projectId);
      const { projects, currentProject } = get();

      // プロジェクトを削除
      const updatedProjects = projects.filter(p => p.id !== projectId);
      const newCurrentProject = currentProject?.id === projectId ? undefined : currentProject;

      set({
        projects: updatedProjects,
        currentProject: newCurrentProject,
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'プロジェクトの削除に失敗しました';

      set({
        error: errorMessage,
      });
    }
  },

  // プロジェクトを選択
  selectProject: async (project: ProjectInfo) => {
    if (!project.isValid) {
      return;
    }

    try {
      set({ error: undefined });
      const { project: selectedProject } = await projectApiService.selectProject(project.id);
      set({
        currentProject: selectedProject,
        selectedFile: undefined, // プロジェクト切り替え時にファイル選択をクリア
        isAddingProject: false, // プロジェクト追加モードを終了
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'プロジェクトの選択に失敗しました';

      set({
        error: errorMessage,
      });
    }
  },

  // ファイルを選択
  setSelectedFile: (file?: FileItem) => {
    set({ selectedFile: file });
  },

  // プロジェクト追加モードを設定
  setAddingProjectMode: (isAdding: boolean) => {
    set({
      isAddingProject: isAdding,
      selectedFile: isAdding ? undefined : get().selectedFile, // 追加モード開始時はファイル選択をクリア
      error: isAdding ? undefined : get().error, // 追加モード開始時はエラーをクリア
    });
  },

  // エラーをクリア
  clearError: () => set({ error: undefined }),

  // エラーを設定
  setError: (error: string) => set({ error }),
}));
