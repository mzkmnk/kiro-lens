import { create } from 'zustand';
import { ApiClient } from '@/services/api';
import type { ProjectInfo } from '@kiro-lens/shared';

interface ProjectState {
  // 状態
  projects: ProjectInfo[];
  currentProject?: ProjectInfo;
  isLoading: boolean;
  error?: string;

  // アクション
  loadProjects: () => Promise<void>;
  addProject: (path: string) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;
  selectProject: (project: ProjectInfo) => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
}

const apiClient = new ApiClient();

export const useProjectStore = create<ProjectState>((set, get) => ({
  // 初期状態
  projects: [],
  currentProject: undefined,
  isLoading: false,
  error: undefined,

  // プロジェクト一覧を取得
  loadProjects: async () => {
    try {
      set({ isLoading: true, error: undefined });
      const response = await apiClient.getProjects();
      set({
        projects: [...response.projects],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'プロジェクトの取得に失敗しました',
        isLoading: false,
      });
    }
  },

  // プロジェクトを追加
  addProject: async (path: string) => {
    try {
      set({ error: undefined });
      const response = await apiClient.addProject(path);
      const { projects } = get();

      // 新しいプロジェクトを追加して選択
      set({
        projects: [...projects, response.project],
        currentProject: response.project,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'プロジェクトの追加に失敗しました',
      });
      throw error; // 呼び出し元でエラーハンドリングできるように再スロー
    }
  },

  // プロジェクトを削除
  removeProject: async (projectId: string) => {
    try {
      set({ error: undefined });
      await apiClient.removeProject(projectId);
      const { projects, currentProject } = get();

      // プロジェクトを削除
      const updatedProjects = projects.filter(p => p.id !== projectId);
      const newCurrentProject = currentProject?.id === projectId ? undefined : currentProject;

      set({
        projects: updatedProjects,
        currentProject: newCurrentProject,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'プロジェクトの削除に失敗しました',
      });
      throw error;
    }
  },

  // プロジェクトを選択
  selectProject: async (project: ProjectInfo) => {
    if (!project.isValid) {
      return;
    }

    try {
      set({ error: undefined });
      await apiClient.selectProject(project.id);
      set({ currentProject: project });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'プロジェクトの選択に失敗しました',
      });
      throw error;
    }
  },

  // エラーをクリア
  clearError: () => set({ error: undefined }),

  // エラーを設定
  setError: (error: string) => set({ error }),
}));
