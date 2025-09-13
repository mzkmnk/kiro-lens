import { describe, test, expect, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../server';
import {
  MOCK_API_PROJECT,
  MOCK_API_PROJECT_WITH_ACCESS,
  MOCK_PROJECT_LIST,
  MOCK_VALIDATION_RESULTS,
} from '@kiro-lens/shared';
import * as projectService from '../services/projectService';
import { ProjectError } from '../services/projectService';
import { MOCK_PATHS } from '../test/constants';

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
      vi.mocked(projectService.addProject).mockResolvedValue(MOCK_API_PROJECT);

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { path: MOCK_PATHS.API_TEST },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.project).toEqual(MOCK_API_PROJECT);
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
        payload: { path: MOCK_PATHS.API_TEST },
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
      vi.mocked(projectService.getAllProjects).mockResolvedValue(MOCK_PROJECT_LIST);

      const response = await app.inject({
        method: 'GET',
        url: '/api/projects',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.projects).toEqual(MOCK_PROJECT_LIST);
    });
  });

  describe('POST /api/projects/validate-path', () => {
    test('有効なパスの検証結果を返す', async () => {
      vi.mocked(projectService.validateProjectPath).mockResolvedValue(
        MOCK_VALIDATION_RESULTS.VALID
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/validate-path',
        payload: { path: MOCK_PATHS.API_TEST },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(MOCK_VALIDATION_RESULTS.VALID);
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

  describe('POST /api/projects/:id/select', () => {
    test('プロジェクトを選択できる', async () => {
      vi.mocked(projectService.setCurrentProject).mockResolvedValue(MOCK_API_PROJECT_WITH_ACCESS);

      const response = await app.inject({
        method: 'POST',
        url: `/api/projects/${MOCK_API_PROJECT.id}/select`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.project).toEqual(MOCK_API_PROJECT_WITH_ACCESS);
      expect(body.data.message).toContain('test-project');
    });

    test('存在しないプロジェクトの場合は404エラーを返す', async () => {
      const error = new ProjectError('プロジェクトが見つかりません', 'PROJECT_NOT_FOUND');
      vi.mocked(projectService.setCurrentProject).mockRejectedValue(error);

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/nonexistent-id/select',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('NOT_FOUND');
    });
  });
});
