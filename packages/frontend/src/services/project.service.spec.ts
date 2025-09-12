import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import type {
  AddProjectRequest,
  ProjectInfo,
  ProjectListResponse,
  ValidationResult,
} from "@kiro-lens/shared";
import { of, throwError } from "rxjs";
import { vi } from "vitest";
import { ApiService } from "./api.service";
import { ProjectService } from "./project.service";

describe("ProjectService", () => {
  let service: ProjectService;
  let apiService: ApiService;

  const mockProjects: ProjectInfo[] = [
    {
      id: "1",
      name: "Project 1",
      path: "/path/to/project1",
      kiroPath: "/path/to/project1/.kiro",
      hasKiroDir: true,
      isValid: true,
      addedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      name: "Project 2",
      path: "/path/to/project2",
      kiroPath: "/path/to/project2/.kiro",
      hasKiroDir: true,
      isValid: true,
      addedAt: "2025-01-01T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProjectService,
        {
          provide: ApiService,
          useValue: {
            getProjects: vi.fn(),
            addProject: vi.fn(),
            removeProject: vi.fn(),
            validatePath: vi.fn(),
            selectProject: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(ProjectService);
    apiService = TestBed.inject(ApiService);
  });

  describe("初期状態", () => {
    it("should initialize with empty projects", () => {
      expect(service.projects()).toEqual([]);
      expect(service.selectedProject()).toBeNull();
      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBeNull();
    });

    it("should have computed properties", () => {
      expect(service.hasProjects()).toBe(false);
      expect(service.validProjects()).toEqual([]);
      expect(service.invalidProjects()).toEqual([]);
    });
  });

  describe("loadProjects", () => {
    it("should load projects successfully", async () => {
      const mockResponse: ProjectListResponse = {
        projects: mockProjects,
      };
      vi.mocked(apiService.getProjects).mockReturnValue(of(mockResponse));

      await service.loadProjects();

      expect(service.isLoading()).toBe(false);
      expect(service.projects()).toEqual(mockProjects);
      expect(service.error()).toBeNull();
      expect(service.hasProjects()).toBe(true);
    });

    it("should handle load projects error", async () => {
      const errorResponse = new Error("Load failed");
      vi.mocked(apiService.getProjects).mockReturnValue(
        throwError(() => errorResponse),
      );

      await service.loadProjects();

      expect(service.isLoading()).toBe(false);
      expect(service.projects()).toEqual([]);
      expect(service.error()).toBe("プロジェクトの読み込みに失敗しました");
    });
  });

  describe("addProject", () => {
    it("should add project successfully", async () => {
      const request: AddProjectRequest = { path: "/new/project" };
      const newProject: ProjectInfo = {
        id: "3",
        name: "New Project",
        path: "/new/project",
        kiroPath: "/new/project/.kiro",
        hasKiroDir: true,
        isValid: true,
        addedAt: "2025-01-01T00:00:00.000Z",
      };

      vi.mocked(apiService.addProject).mockReturnValue(
        of({ project: newProject, message: "Project added successfully" }),
      );
      vi.mocked(apiService.getProjects).mockReturnValue(
        of({ projects: [...mockProjects, newProject] }),
      );

      const result = await service.addProject(request);

      expect(result).toBe(true);
      expect(vi.mocked(apiService.addProject)).toHaveBeenCalledWith(request);
      expect(vi.mocked(apiService.getProjects)).toHaveBeenCalled();
    });

    it("should handle add project error", async () => {
      const request: AddProjectRequest = { path: "/new/project" };
      vi.mocked(apiService.addProject).mockReturnValue(
        throwError(() => new Error("Add failed")),
      );

      const result = await service.addProject(request);

      expect(result).toBe(false);
      expect(service.error()).toBe("プロジェクトの追加に失敗しました");
    });
  });

  describe("removeProject", () => {
    it("should remove project successfully", async () => {
      service.projects.set(mockProjects);
      vi.mocked(apiService.removeProject).mockReturnValue(
        of({ success: true }),
      );
      vi.mocked(apiService.getProjects).mockReturnValue(
        of({ projects: [mockProjects[1]] }),
      );

      const result = await service.removeProject("1");

      expect(result).toBe(true);
      expect(vi.mocked(apiService.removeProject)).toHaveBeenCalledWith("1");
      expect(vi.mocked(apiService.getProjects)).toHaveBeenCalled();
    });

    it("should handle remove project error", async () => {
      vi.mocked(apiService.removeProject).mockReturnValue(
        throwError(() => new Error("Remove failed")),
      );

      const result = await service.removeProject("1");

      expect(result).toBe(false);
      expect(service.error()).toBe("プロジェクトの削除に失敗しました");
    });
  });

  describe("validatePath", () => {
    it("should validate path successfully", async () => {
      const validationResult: ValidationResult = { isValid: true };
      vi.mocked(apiService.validatePath).mockReturnValue(of(validationResult));

      const result = await service.validatePath("/valid/path");

      expect(result).toEqual(validationResult);
      expect(vi.mocked(apiService.validatePath)).toHaveBeenCalledWith(
        "/valid/path",
      );
    });

    it("should handle validation error", async () => {
      vi.mocked(apiService.validatePath).mockReturnValue(
        throwError(() => new Error("Validation failed")),
      );

      const result = await service.validatePath("/invalid/path");

      expect(result).toEqual({
        isValid: false,
        error: "パスの検証に失敗しました",
      });
      expect(service.error()).toBe("パスの検証に失敗しました");
    });
  });

  describe("selectProject", () => {
    it("should select project successfully", async () => {
      const project = mockProjects[0];
      service.projects.set(mockProjects);
      vi.mocked(apiService.selectProject).mockReturnValue(
        of({ success: true }),
      );

      const result = await service.selectProject(project.id);

      expect(result).toBe(true);
      expect(service.selectedProject()).toEqual(project);
      expect(vi.mocked(apiService.selectProject)).toHaveBeenCalledWith(
        project.id,
      );
    });

    it("should handle select project error", async () => {
      service.projects.set(mockProjects); // プロジェクトが存在する状態にする
      vi.mocked(apiService.selectProject).mockReturnValue(
        throwError(() => new Error("Select failed")),
      );

      const result = await service.selectProject("1");

      expect(result).toBe(false);
      expect(service.error()).toBe("プロジェクトの選択に失敗しました");
    });

    it("should not select non-existent project", async () => {
      service.projects.set(mockProjects);

      const result = await service.selectProject("999");

      expect(result).toBe(false);
      expect(service.selectedProject()).toBeNull();
    });
  });

  describe("computed properties", () => {
    it("should compute hasProjects correctly", () => {
      expect(service.hasProjects()).toBe(false);

      service.projects.set(mockProjects);
      expect(service.hasProjects()).toBe(true);
    });

    it("should compute validProjects correctly", () => {
      const mixedProjects = [
        ...mockProjects,
        {
          id: "3",
          name: "Invalid Project",
          path: "/invalid",
          kiroPath: "/invalid/.kiro",
          hasKiroDir: false,
          isValid: false,
          addedAt: "2025-01-01T00:00:00.000Z",
        },
      ];
      service.projects.set(mixedProjects);

      expect(service.validProjects()).toEqual(mockProjects);
    });

    it("should compute invalidProjects correctly", () => {
      const invalidProject = {
        id: "3",
        name: "Invalid Project",
        path: "/invalid",
        kiroPath: "/invalid/.kiro",
        hasKiroDir: false,
        isValid: false,
        addedAt: "2025-01-01T00:00:00.000Z",
      };
      const mixedProjects = [...mockProjects, invalidProject];
      service.projects.set(mixedProjects);

      expect(service.invalidProjects()).toEqual([invalidProject]);
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      service.error.set("Some error");
      expect(service.error()).toBe("Some error");

      service.clearError();
      expect(service.error()).toBeNull();
    });
  });
});
