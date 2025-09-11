import type {
  ApiResponse,
  FileItem,
  HealthResponse,
  ProjectInfo,
} from "@kiro-lens/shared";
import { describe, expect, it } from "vitest";

describe("Shared Types Integration", () => {
  it("should import HealthResponse type correctly", () => {
    const healthResponse: HealthResponse = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      server: {
        name: "kiro-lens-backend",
        version: "1.0.0",
        uptime: 12345,
        environment: "development",
      },
    };

    expect(healthResponse.status).toBe("healthy");
    expect(typeof healthResponse.timestamp).toBe("string");
    expect(healthResponse.server.name).toBe("kiro-lens-backend");
  });

  it("should import ApiResponse type correctly", () => {
    const apiResponse: ApiResponse<string> = {
      success: true,
      data: "test data",
    };

    expect(apiResponse.success).toBe(true);
    expect(apiResponse.data).toBe("test data");
  });

  it("should import ProjectInfo type correctly", () => {
    const projectInfo: ProjectInfo = {
      id: "test-project",
      name: "Test Project",
      description: "A test project",
      isSelected: false,
      isValid: true,
    };

    expect(projectInfo.id).toBe("test-project");
    expect(projectInfo.name).toBe("Test Project");
    expect(projectInfo.isSelected).toBe(false);
    expect(projectInfo.isValid).toBe(true);
  });

  it("should import FileItem type correctly", () => {
    const fileItem: FileItem = {
      name: "test.txt",
      path: "/test/test.txt",
      type: "file",
      size: 1024,
      lastModified: new Date().toISOString(),
    };

    expect(fileItem.name).toBe("test.txt");
    expect(fileItem.type).toBe("file");
    expect(fileItem.size).toBe(1024);
    expect(typeof fileItem.lastModified).toBe("string");
  });
});
