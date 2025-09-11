import { TypedApiClient, ApiClientError } from './typedApiClient';
import type {
  ProjectInfo,
  FileItem,
  ValidationResult,
  ProjectListResponse,
  AddProjectRequest,
  AddProjectResponse,
  DeleteProjectResponse,
  SelectProjectResponse,
  ValidatePathRequest,
  ValidatePathResponse,
  CurrentProjectResponse,
  FileTreeResponse,
  ProjectFilesParams,
} from '@kiro-lens/shared/types/generated';

/**
 * プロジェクトAPI サービス
 *
 * TypeBoxスキーマベースの型安全なプロジェクト管理APIクライアント
 */
export class ProjectApiService {
  constructor(private apiClient: TypedApiClient) {}

  /**
   * プロジェクト一覧を取得
   *
   * @returns プロジェクト一覧
   */
  async getProjects(): Promise<{ projects: ProjectInfo[]; currentProject?: ProjectInfo }> {
    const response = await this.apiClient.get<ProjectListResponse>('projects');
    return TypedApiClient.extractData(response);
  }

  /**
   * プロジェクトを追加
   *
   * @param path - プロジェクトパス
   * @returns 追加されたプロジェクト情報
   */
  async addProject(path: string): Promise<{ project: ProjectInfo; message: string }> {
    const request: AddProjectRequest = { path };
    const response = await this.apiClient.post<AddProjectRequest, AddProjectResponse>(
      'projects',
      request
    );
    return TypedApiClient.extractData(response);
  }

  /**
   * プロジェクトを削除
   *
   * @param id - プロジェクトID
   * @returns 削除結果メッセージ
   */
  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await this.apiClient.delete<DeleteProjectResponse>(
      `projects/${encodeURIComponent(id)}`
    );
    return TypedApiClient.extractData(response);
  }

  /**
   * プロジェクトを選択
   *
   * @param id - プロジェクトID
   * @returns 選択されたプロジェクト情報
   */
  async selectProject(id: string): Promise<{ project: ProjectInfo; message: string }> {
    const response = await this.apiClient.post<{}, SelectProjectResponse>(
      `projects/${encodeURIComponent(id)}/select`,
      {}
    );
    return TypedApiClient.extractData(response);
  }

  /**
   * パスを検証
   *
   * @param path - 検証するパス
   * @returns 検証結果
   */
  async validatePath(path: string): Promise<ValidationResult> {
    const request: ValidatePathRequest = { path };
    const response = await this.apiClient.post<ValidatePathRequest, ValidatePathResponse>(
      'projects/validate-path',
      request
    );
    return TypedApiClient.extractData(response);
  }

  /**
   * 現在のプロジェクトを取得
   *
   * @returns 現在のプロジェクト情報（選択されていない場合はnull）
   */
  async getCurrentProject(): Promise<any> {
    const response = await this.apiClient.get<CurrentProjectResponse>('project');
    return TypedApiClient.extractData(response);
  }

  /**
   * プロジェクトファイルツリーを取得
   *
   * @param id - プロジェクトID
   * @returns ファイルツリー
   */
  async getProjectFiles(id: string): Promise<FileItem[]> {
    const response = await this.apiClient.get<FileTreeResponse>(
      `projects/${encodeURIComponent(id)}/files`
    );
    const data = TypedApiClient.extractData(response);
    return data.files;
  }

  /**
   * プロジェクト詳細を取得
   *
   * @param id - プロジェクトID
   * @returns プロジェクト詳細情報
   */
  async getProjectDetails(id: string): Promise<ProjectInfo> {
    const response = await this.apiClient.get<any>(`projects/${encodeURIComponent(id)}`);
    return TypedApiClient.extractData(response);
  }

  /**
   * プロジェクト情報を更新
   *
   * @param id - プロジェクトID
   * @param updates - 更新データ
   * @returns 更新されたプロジェクト情報
   */
  async updateProject(
    id: string,
    updates: { name?: string; path?: string }
  ): Promise<{ project: ProjectInfo; message: string }> {
    const response = await this.apiClient.put<any, any>(
      `projects/${encodeURIComponent(id)}`,
      updates
    );
    return TypedApiClient.extractData(response);
  }
}

/**
 * ファイルツリーAPI サービス
 *
 * TypeBoxスキーマベースの型安全なファイル管理APIクライアント
 */
export class FileTreeApiService {
  constructor(private apiClient: TypedApiClient) {}

  /**
   * プロジェクトファイルツリーを取得
   *
   * @param projectId - プロジェクトID
   * @returns ファイルツリー
   */
  async getProjectFiles(projectId: string): Promise<FileItem[]> {
    const response = await this.apiClient.get<FileTreeResponse>(
      `projects/${encodeURIComponent(projectId)}/files`
    );
    const data = TypedApiClient.extractData(response);
    return data.files;
  }

  /**
   * ファイル内容を取得
   *
   * @param projectId - プロジェクトID
   * @param filePath - ファイルパス
   * @returns ファイル内容
   */
  async getFileContent(projectId: string, filePath: string): Promise<any> {
    const response = await this.apiClient.get<any>(
      `projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(filePath)}`
    );
    return TypedApiClient.extractData(response);
  }

  /**
   * ファイル内容を更新
   *
   * @param projectId - プロジェクトID
   * @param filePath - ファイルパス
   * @param content - ファイル内容
   * @param encoding - エンコーディング
   * @returns 更新結果
   */
  async updateFileContent(
    projectId: string,
    filePath: string,
    content: string,
    encoding: 'utf8' | 'base64' = 'utf8'
  ): Promise<any> {
    const request = { content, encoding };
    const response = await this.apiClient.put<any, any>(
      `projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(filePath)}`,
      request
    );
    return TypedApiClient.extractData(response);
  }

  /**
   * ファイルを作成
   *
   * @param projectId - プロジェクトID
   * @param filePath - ファイルパス
   * @param content - ファイル内容
   * @param encoding - エンコーディング
   * @returns 作成結果
   */
  async createFile(
    projectId: string,
    filePath: string,
    content: string = '',
    encoding: 'utf8' | 'base64' = 'utf8'
  ): Promise<any> {
    const request = { path: filePath, content, encoding };
    const response = await this.apiClient.post<any, any>(
      `projects/${encodeURIComponent(projectId)}/files`,
      request
    );
    return TypedApiClient.extractData(response);
  }

  /**
   * ファイルを削除
   *
   * @param projectId - プロジェクトID
   * @param filePath - ファイルパス
   * @returns 削除結果
   */
  async deleteFile(projectId: string, filePath: string): Promise<any> {
    const response = await this.apiClient.delete<any>(
      `projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(filePath)}`
    );
    return TypedApiClient.extractData(response);
  }
}

// シングルトンインスタンス
import { typedApiClient } from './typedApiClient';

export const projectApiService = new ProjectApiService(typedApiClient);
export const fileTreeApiService = new FileTreeApiService(typedApiClient);
