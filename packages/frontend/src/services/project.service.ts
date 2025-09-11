import { Injectable, computed, inject, signal } from "@angular/core";
import type {
  AddProjectRequest,
  ProjectInfo,
  ValidationResult,
} from "@kiro-lens/shared";
import { firstValueFrom } from "rxjs";
import { ApiService } from "./api.service";

/**
 * プロジェクト管理サービス
 * Signalsベースの状態管理でプロジェクト操作を提供
 */
@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private readonly apiService = inject(ApiService);

  // 基本状態のSignals
  readonly projects = signal<ProjectInfo[]>([]);
  readonly selectedProject = signal<ProjectInfo | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // 派生状態のcomputed
  readonly hasProjects = computed(() => this.projects().length > 0);
  readonly validProjects = computed(() =>
    this.projects().filter((project) => project.isValid),
  );
  readonly invalidProjects = computed(() =>
    this.projects().filter((project) => !project.isValid),
  );

  /**
   * プロジェクト一覧を読み込み
   */
  async loadProjects(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.apiService.getProjects());
      this.projects.set([...response.projects]);
    } catch (error) {
      this.error.set("プロジェクトの読み込みに失敗しました");
      this.projects.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * プロジェクトを追加
   */
  async addProject(request: AddProjectRequest): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.apiService.addProject(request));
      // プロジェクト一覧を再読み込み
      await this.loadProjects();
      return true;
    } catch (error) {
      this.error.set("プロジェクトの追加に失敗しました");
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * プロジェクトを削除
   */
  async removeProject(projectId: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.apiService.removeProject(projectId));

      // 選択中のプロジェクトが削除された場合は選択を解除
      if (this.selectedProject()?.id === projectId) {
        this.selectedProject.set(null);
      }

      // プロジェクト一覧を再読み込み
      await this.loadProjects();
      return true;
    } catch (error) {
      this.error.set("プロジェクトの削除に失敗しました");
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * パスを検証
   */
  async validatePath(path: string): Promise<ValidationResult> {
    this.error.set(null);

    try {
      return await firstValueFrom(this.apiService.validatePath(path));
    } catch (error) {
      this.error.set("パスの検証に失敗しました");
      return { isValid: false, error: "パスの検証に失敗しました" };
    }
  }

  /**
   * プロジェクトを選択
   */
  async selectProject(projectId: string): Promise<boolean> {
    this.error.set(null);

    // プロジェクトが存在するかチェック
    const project = this.projects().find((p) => p.id === projectId);
    if (!project) {
      return false;
    }

    try {
      await firstValueFrom(this.apiService.selectProject(projectId));
      this.selectedProject.set(project);
      return true;
    } catch (error) {
      this.error.set("プロジェクトの選択に失敗しました");
      return false;
    }
  }

  /**
   * エラー状態をクリア
   */
  clearError(): void {
    this.error.set(null);
  }
}
