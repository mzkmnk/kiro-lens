import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse, ProjectListResponse } from '@kiro-lens/shared';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectsAPI {
  private readonly http = inject(HttpClient);

  getAllProjects(): Observable<ApiResponse<ProjectListResponse>> {
    return this.http.get<ApiResponse<ProjectListResponse>>(
      `${environment.apiUrl}/api/projects`,
    );
  }
}
