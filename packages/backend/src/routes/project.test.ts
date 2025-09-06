import { describe, test, expect, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../server.js';
import { ProjectInfo } from '@kiro-lens/shared';
import * as projectService from '../services/projectService.js';
import { ProjectError } from '../services/projectService.js';

// プロジェクトサービスのモック
vi.mock('../services/projectService.js', () => ({
  ProjectError: class ProjectError extends Error {
    constructor(
      message: string,
      public readonly code: string,
      public readonly cause?: Error
    ) {
      super(message);
      this.name = 'ProjectError';
    }
  },
  addProject: vi.fn(),
  removeProject: vi.fn(),
  getAllProjects: vi.fn(),
  getCurrentProject: vi.fn(),
  setCurrentProject: vi.fn(),
  validateProjectPath: vi.fn(),
}));

describe('Project Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = createServer();
    await app.ready();
    vi.clearAllMocks();
  });

  describe('POST /api/projects', () => {
    test('有効なパスでプロジェクトを追加できる', async () => {
      const mockProject: ProjectInfo = {
        id: 'test-id',
        name: 'test-project',
        path: '/test/path',
        kiroPath: '/test/path/.kiro',
        hasKiroDir: true,
        isValid: true,
        addedAt: '2024-01-01T00:00:00.000Z',
      };

      vi.mocked(projectService.addProject).mockResolvedValue(mockProject);

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { path: '/test/path' },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.project).toEqual(mockProject);
      expect(body.data.message).toContain('test-project');
    });

    test('パスが指定されていない場合はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('VALIDATION_ERROR');
    });

    test('既存プロジェクトの場合は409エラーを返す', async () => {
      const error = new ProjectError('プロジェクトが既に存在します', 'PROJECT_ALREADY_EXISTS');
      vi.mocked(projectService.addProject).mockRejectedValue(error);

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { path: '/test/path' },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    test('プロジェクトを削除できる', async () => {
      vi.mocked(projectService.removeProject).mockResolvedValue();

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/projects/test-id',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.message).toContain('削除しました');
    });

    test('存在しないプロジェクトの場合は404エラーを返す', async () => {
      const error = new ProjectError('プロジェクトが見つかりません', 'PROJECT_NOT_FOUND');
      vi.mocked(projectService.removeProject).mockRejectedValue(error);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/projects/nonexistent-id',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/projects', () => {
    test('プロジェクト一覧を取得できる', async () => {
      const mockProjects: ProjectInfo[] = [
        {
          id: 'project-1',
          name: 'project1',
          path: '/path/to/project1',
          kiroPath: '/path/to/project1/.kiro',
          hasKiroDir: true,
          isValid: true,
          addedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const mockCurrentProject: ProjectInfo = mockProjects[0];

      vi.mocked(projectService.getAllProjects).mockResolvedValue(mockProjects);
      vi.mocked(projectService.getCurrentProject).mockResolvedValue(mockCurrentProject);

      const response = await app.inject({
        method: 'GET',
        url: '/api/projects',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.projects).toEqual(mockProjects);
      expect(body.data.currentProject).toEqual(mockCurrentProject);
    });
  });

  describe('POST /api/projects/validate-path', () => {
    test('有効なパスの検証結果を返す', async () => {
      const mockValidation = {
        isValid: true,
        validatedPath: '/test/path',
      };

      vi.mocked(projectService.validateProjectPath).mockResolvedValue(mockValidation);

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/validate-path',
        payload: { path: '/test/path' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockValidation);
    });

    test('パスが指定されていない場合はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/validate-path',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/projects/:id/select', () => {
    test('プロジェクトを選択できる', async () => {
      const mockProject: ProjectInfo = {
        id: 'test-id',
        name: 'test-project',
        path: '/test/path',
        kiroPath: '/test/path/.kiro',
        hasKiroDir: true,
        isValid: true,
        addedAt: '2024-01-01T00:00:00.000Z',
        lastAccessedAt: '2024-01-01T01:00:00.000Z',
      };

      vi.mocked(projectService.setCurrentProject).mockResolvedValue(mockProject);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/projects/test-id/select',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.project).toEqual(mockProject);
      expect(body.data.message).toContain('test-project');
    });

    test('存在しないプロジェクトの場合は404エラーを返す', async () => {
      const error = new ProjectError('プロジェクトが見つかりません', 'PROJECT_NOT_FOUND');
      vi.mocked(projectService.setCurrentProject).mockRejectedValue(error);

      const response = await app.inject({
        method: 'PUT',
        url: '/api/projects/nonexistent-id/select',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('NOT_FOUND');
    });
  });
});
