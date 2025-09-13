import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AddProjectRequest,
  AddProjectResponse,
  ApiResponse,
  ProjectListResponse,
} from '@kiro-lens/shared';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectsAPI {
  private readonly http = inject(HttpClient);

  /**
   * 全てのプロジェクトを取得する
   */
  getAllProjects(): Observable<ApiResponse<ProjectListResponse>> {
    return this.http.get<ApiResponse<ProjectListResponse>>(
      `${environment.apiUrl}/api/projects`,
    );
  }

  /**
   * プロジェクトを追加する
   * @param req AddProjectRequest
   * @returns
   */
  addProject(
    req: AddProjectRequest,
  ): Observable<ApiResponse<AddProjectResponse>> {
    return this.http.post<ApiResponse<AddProjectResponse>>(
      `${environment.apiUrl}/api/projects`,
      req,
    );
  }
}
