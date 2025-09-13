import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse, FileTreeResponse, IdParams } from '@kiro-lens/shared';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FilesAPI {
  private readonly http = inject(HttpClient);

  getFiles({ id }: IdParams): Observable<ApiResponse<FileTreeResponse>> {
    return this.http.get<ApiResponse<FileTreeResponse>>(
      `${environment.apiUrl}/api/projects/${id}/files`,
    );
  }
}
