import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  FileContentResponse,
  FileContentRequest,
} from '@kiro-lens/shared';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileContentAPI {
  private readonly http = inject(HttpClient);

  getFileContent(
    id: string,
    res: FileContentRequest,
  ): Observable<ApiResponse<FileContentResponse>> {
    return this.http.post<ApiResponse<FileContentResponse>>(
      `${environment.apiUrl}/api/projects/${id}/files/content`,
      res,
    );
  }
}
