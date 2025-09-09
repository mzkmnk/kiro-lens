import { describe, test, expect, beforeEach } from 'vitest';
import { createServer } from '../server.js';
import type { FastifyInstance } from 'fastify';

describe('Files API', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = createServer();
    await app.ready();
  });

  describe('GET /api/projects/:id/files', () => {
    test('エラーケース: プロジェクトが存在しない場合は404を返す', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/non-existent-project/files',
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.message).toContain('Project not found');
    });

    test('エラーケース: 無効なプロジェクトIDの場合は400を返す', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/ /files', // 空白のプロジェクトID
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.message).toContain('Invalid project ID');
    });

    test('レスポンス形式: ApiResponse<FileItem[]>形式を使用', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/test-project/files',
      });

      const body = JSON.parse(response.body);

      // ApiResponse形式の確認
      expect(body).toHaveProperty('success');
      expect(typeof body.success).toBe('boolean');

      if (body.success) {
        expect(body).toHaveProperty('data');
      } else {
        expect(body).toHaveProperty('error');
        expect(body.error).toHaveProperty('message');
        expect(typeof body.error.message).toBe('string');
      }
    });
  });
});
