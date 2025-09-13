import { TestBed } from "@angular/core/testing";
import type { FileItem } from "@kiro-lens/shared";
import { ApiService } from "./api.service";
import { FileTreeService } from "./file-tree.service";

const mockFiles: FileItem[] = [
  {
    name: "src",
    path: "/project/src",
    type: "directory",
    size: null,
    lastModified: new Date("2024-01-01"),
  },
  {
    name: "index.ts",
    path: "/project/src/index.ts",
    type: "file",
    size: 1024,
    lastModified: new Date("2024-01-02"),
  },
  {
    name: "README.md",
    path: "/project/README.md",
    type: "file",
    size: 2048,
    lastModified: new Date("2024-01-03"),
  },
];

describe("FileTreeService", () => {
  let service: FileTreeService;
  let mockApiService: any;

  beforeEach(() => {
    mockApiService = {
      getProjectFiles: vi.fn().mockResolvedValue({ files: mockFiles }),
    };

    TestBed.configureTestingModule({
      providers: [
        FileTreeService,
        { provide: ApiService, useValue: mockApiService },
      ],
    });

    service = TestBed.inject(FileTreeService);
  });

  it("サービスが作成される", () => {
    expect(service).toBeTruthy();
  });

  it("初期状態が正しく設定される", () => {
    expect(service.files()).toEqual([]);
    expect(service.selectedFile()).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.currentProjectId()).toBeNull();
  });

  it("ファイルを正常に読み込む", async () => {
    await service.loadFiles("project-1");

    expect(mockApiService.getProjectFiles).toHaveBeenCalledWith("project-1");
    expect(service.files()).toEqual(mockFiles);
    expect(service.currentProjectId()).toBe("project-1");
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it("ファイル読み込みエラーを処理する", async () => {
    const errorMessage = "API Error";
    mockApiService.getProjectFiles.mockRejectedValue(new Error(errorMessage));

    await service.loadFiles("project-1");

    expect(service.files()).toEqual([]);
    expect(service.error()).toBe(errorMessage);
    expect(service.isLoading()).toBe(false);
  });

  it("ファイルを選択する", () => {
    const file = mockFiles[1];
    service.selectFile(file);

    expect(service.selectedFile()).toBe(file);
  });

  it("ファイル選択を解除する", () => {
    service.selectFile(mockFiles[1]);
    service.clearSelection();

    expect(service.selectedFile()).toBeNull();
  });

  it("パスでファイルを検索する", async () => {
    await service.loadFiles("project-1");

    const foundFile = service.findFileByPath("/project/src/index.ts");
    expect(foundFile).toBe(mockFiles[1]);

    const notFoundFile = service.findFileByPath("/nonexistent");
    expect(notFoundFile).toBeNull();
  });

  it("computed signalsが正しく動作する", async () => {
    expect(service.hasFiles()).toBe(false);
    expect(service.fileCount()).toBe(0);

    await service.loadFiles("project-1");

    expect(service.hasFiles()).toBe(true);
    expect(service.fileCount()).toBe(3);
    expect(service.directories()).toEqual([mockFiles[0]]);
    expect(service.regularFiles()).toEqual([mockFiles[1], mockFiles[2]]);
  });

  it("子ファイルを取得する", async () => {
    await service.loadFiles("project-1");

    const childFiles = service.getChildFiles("/project");
    expect(childFiles).toEqual([mockFiles[0], mockFiles[2]]); // src, README.md
  });

  it("ファイルをクリアする", async () => {
    await service.loadFiles("project-1");
    service.selectFile(mockFiles[1]);

    service.clearFiles();

    expect(service.files()).toEqual([]);
    expect(service.selectedFile()).toBeNull();
    expect(service.error()).toBeNull();
    expect(service.currentProjectId()).toBeNull();
  });

  it("エラーをクリアする", async () => {
    mockApiService.getProjectFiles.mockRejectedValue(new Error("Test Error"));
    await service.loadFiles("project-1");

    service.clearError();

    expect(service.error()).toBeNull();
  });

  it("ファイル選択状態を確認する", () => {
    const file = mockFiles[1];
    service.selectFile(file);

    expect(service.isFileSelected(file)).toBe(true);
    expect(service.isFileSelected(mockFiles[0])).toBe(false);
  });

  it("ファイルタイプを確認する", () => {
    const directory = mockFiles[0];
    const file = mockFiles[1];

    expect(service.isDirectory(directory)).toBe(true);
    expect(service.isFile(directory)).toBe(false);
    expect(service.isDirectory(file)).toBe(false);
    expect(service.isFile(file)).toBe(true);
  });

  it("ファイル拡張子を取得する", () => {
    expect(service.getFileExtension(mockFiles[0])).toBe(""); // directory
    expect(service.getFileExtension(mockFiles[1])).toBe("ts");
    expect(service.getFileExtension(mockFiles[2])).toBe("md");
  });

  it("ファイルサイズをフォーマットする", () => {
    expect(service.getFormattedFileSize(mockFiles[0])).toBe(""); // directory
    expect(service.getFormattedFileSize(mockFiles[1])).toBe("1.0 KB");
    expect(service.getFormattedFileSize(mockFiles[2])).toBe("2.0 KB");
  });

  it("ファイルを再読み込みする", async () => {
    await service.loadFiles("project-1");

    // API呼び出し回数をリセット
    mockApiService.getProjectFiles.mockClear();

    await service.reloadFiles();

    expect(mockApiService.getProjectFiles).toHaveBeenCalledWith("project-1");
  });

  it("プロジェクトIDが設定されていない場合は再読み込みしない", async () => {
    await service.reloadFiles();

    expect(mockApiService.getProjectFiles).not.toHaveBeenCalled();
  });
});
