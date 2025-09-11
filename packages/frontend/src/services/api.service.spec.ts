import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import type {
  AddProjectRequest,
  FileTreeResponse,
  HealthResponse,
  ProjectListResponse,
  ValidationResult,
} from "@kiro-lens/shared";
import { environment } from "../environments/environment.development";
import { ApiService } from "./api.service";

describe("ApiService", () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("getHealth", () => {
    it("should return health status", () => {
      const mockResponse: HealthResponse = {
        status: "healthy",
        timestamp: "2025-01-01T00:00:00.000Z",
        server: {
          name: "kiro-lens-backend",
          version: "1.0.0",
          uptime: 1000,
          state: "running",
        },
      };

      service.getHealth().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/health`);
      expect(req.request.method).toBe("GET");
      req.flush(mockResponse);
    });

    it("should handle health check error", () => {
      service.getHealth().subscribe({
        next: () => fail("should have failed"),
        error: (error) => {
          expect(error).toBeDefined();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/health`);
      req.flush("Server error", {
        status: 500,
        statusText: "Internal Server Error",
      });
    });
  });

  describe("getProjects", () => {
    it("should return project list", () => {
      const mockResponse: ProjectListResponse = {
        success: true,
        data: [
          {
            id: "1",
            name: "Project 1",
            path: "/path/to/project1",
            isValid: true,
          },
          {
            id: "2",
            name: "Project 2",
            path: "/path/to/project2",
            isValid: true,
          },
        ],
      };

      service.getProjects().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/projects`);
      expect(req.request.method).toBe("GET");
      req.flush(mockResponse);
    });
  });

  describe("addProject", () => {
    it("should add new project", () => {
      const request: AddProjectRequest = { path: "/path/to/new/project" };
      const mockResponse = {
        success: true,
        data: {
          id: "3",
          name: "New Project",
          path: "/path/to/new/project",
          isValid: true,
        },
      };

      service.addProject(request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/projects`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe("removeProject", () => {
    it("should remove project", () => {
      const projectId = "1";
      const mockResponse = { success: true };

      service.removeProject(projectId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/api/projects/${projectId}`,
      );
      expect(req.request.method).toBe("DELETE");
      req.flush(mockResponse);
    });
  });

  describe("validatePath", () => {
    it("should validate project path", () => {
      const path = "/path/to/validate";
      const mockResponse: ValidationResult = { isValid: true };

      service.validatePath(path).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/api/projects/validate-path`,
      );
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual({ path });
      req.flush(mockResponse);
    });
  });

  describe("selectProject", () => {
    it("should select project", () => {
      const projectId = "1";
      const mockResponse = { success: true };

      service.selectProject(projectId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/api/projects/${projectId}/select`,
      );
      expect(req.request.method).toBe("POST");
      req.flush(mockResponse);
    });
  });

  describe("getProjectFiles", () => {
    it("should return project files", () => {
      const projectId = "1";
      const mockResponse: FileTreeResponse = {
        success: true,
        data: {
          files: [
            {
              name: "file1.txt",
              path: "/path/file1.txt",
              type: "file",
              size: 100,
            },
            {
              name: "folder1",
              path: "/path/folder1",
              type: "directory",
              children: [],
            },
          ],
        },
      };

      service.getProjectFiles(projectId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/api/projects/${projectId}/files`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockResponse);
    });
  });
});
