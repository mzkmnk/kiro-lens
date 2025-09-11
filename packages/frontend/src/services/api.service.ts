import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type {
  AddProjectRequest,
  AddProjectResponse,
  ApiResponse,
  FileTreeResponse,
  HealthResponse,
  ProjectListResponse,
  ValidationResult,
} from "@kiro-lens/shared";
import { Observable } from "rxjs";
import { environment } from "../environments/environment.development";

/**
 * APIサービス
 * バックエンドとの通信を担当
 */
@Injectable({
  providedIn: "root",
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * ヘルスチェック
   */
  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/api/health`);
  }

  /**
   * プロジェクト一覧取得
   */
  getProjects(): Observable<ProjectListResponse> {
    return this.http.get<ProjectListResponse>(`${this.baseUrl}/api/projects`);
  }

  /**
   * プロジェクト追加
   */
  addProject(request: AddProjectRequest): Observable<AddProjectResponse> {
    return this.http.post<AddProjectResponse>(
      `${this.baseUrl}/api/projects`,
      request,
    );
  }

  /**
   * プロジェクト削除
   */
  removeProject(projectId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/api/projects/${projectId}`,
    );
  }

  /**
   * パス検証
   */
  validatePath(path: string): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(
      `${this.baseUrl}/api/projects/validate-path`,
      { path },
    );
  }

  /**
   * プロジェクト選択
   */
  selectProject(projectId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}/api/projects/${projectId}/select`,
      {},
    );
  }

  /**
   * プロジェクトファイル取得
   */
  getProjectFiles(projectId: string): Observable<FileTreeResponse> {
    return this.http.get<FileTreeResponse>(
      `${this.baseUrl}/api/projects/${projectId}/files`,
    );
  }
}
