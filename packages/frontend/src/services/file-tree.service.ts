import { Injectable, computed, inject, signal } from "@angular/core";
import type { FileItem } from "@kiro-lens/shared";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class FileTreeService {
  private readonly apiService = inject(ApiService);

  // Private signals
  private readonly _files = signal<FileItem[]>([]);
  private readonly _selectedFile = signal<FileItem | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _currentProjectId = signal<string | null>(null);

  // Public readonly signals
  readonly files = this._files.asReadonly();
  readonly selectedFile = this._selectedFile.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly currentProjectId = this._currentProjectId.asReadonly();

  // Computed signals
  readonly hasFiles = computed(() => this._files().length > 0);
  readonly fileCount = computed(() => this._files().length);
  readonly directories = computed(() =>
    this._files().filter((file) => file.type === "directory"),
  );
  readonly regularFiles = computed(() =>
    this._files().filter((file) => file.type === "file"),
  );

  /**
   * プロジェクトのファイルツリーを読み込む
   */
  async loadFiles(projectId: string): Promise<void> {
    if (this._isLoading()) {
      return; // 既に読み込み中の場合は何もしない
    }

    this._isLoading.set(true);
    this._error.set(null);
    this._currentProjectId.set(projectId);

    try {
      const response = await this.apiService.getProjectFiles(projectId);
      this._files.set(response.files);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "ファイル読み込みエラー";
      this._error.set(errorMessage);
      this._files.set([]);
      console.error("ファイルツリー読み込みエラー:", error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * ファイルツリーを再読み込みする
   */
  async reloadFiles(): Promise<void> {
    const projectId = this._currentProjectId();
    if (projectId) {
      await this.loadFiles(projectId);
    }
  }

  /**
   * ファイルを選択する
   */
  selectFile(file: FileItem): void {
    this._selectedFile.set(file);
  }

  /**
   * ファイル選択を解除する
   */
  clearSelection(): void {
    this._selectedFile.set(null);
  }

  /**
   * 指定されたパスのファイルを検索する
   */
  findFileByPath(path: string): FileItem | null {
    return this._files().find((file) => file.path === path) || null;
  }

  /**
   * 指定されたディレクトリの子ファイルを取得する
   */
  getChildFiles(directoryPath: string): FileItem[] {
    return this._files().filter((file) => {
      const parentPath = file.path.substring(0, file.path.lastIndexOf("/"));
      return parentPath === directoryPath && file.path !== directoryPath;
    });
  }

  /**
   * ファイルツリーをクリアする
   */
  clearFiles(): void {
    this._files.set([]);
    this._selectedFile.set(null);
    this._error.set(null);
    this._currentProjectId.set(null);
  }

  /**
   * エラー状態をクリアする
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * ファイルが選択されているかどうかを確認する
   */
  isFileSelected(file: FileItem): boolean {
    const selected = this._selectedFile();
    return selected ? selected.path === file.path : false;
  }

  /**
   * ディレクトリかどうかを確認する
   */
  isDirectory(file: FileItem): boolean {
    return file.type === "directory";
  }

  /**
   * ファイルかどうかを確認する
   */
  isFile(file: FileItem): boolean {
    return file.type === "file";
  }

  /**
   * ファイル拡張子を取得する
   */
  getFileExtension(file: FileItem): string {
    if (file.type === "directory") {
      return "";
    }
    const lastDotIndex = file.name.lastIndexOf(".");
    return lastDotIndex > 0 ? file.name.substring(lastDotIndex + 1) : "";
  }

  /**
   * ファイルサイズを人間が読みやすい形式で取得する
   */
  getFormattedFileSize(file: FileItem): string {
    if (file.type === "directory" || !file.size) {
      return "";
    }

    const bytes = file.size;
    const sizes = ["B", "KB", "MB", "GB"];

    if (bytes === 0) return "0 B";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
  }
}
