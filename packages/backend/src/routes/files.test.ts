import { describe, test, expect, beforeEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { filesRoutes } from './files';

describe('Files Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(filesRoutes);
  });

  describe('GET /api/projects/:id/files', () => {
    test('存在しないプロジェクトの場合は404エラーを返す', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/non-existent-project/files',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('プロジェクトIDが空の場合は400エラーを返す', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/ /files',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/projects/:id/files/content', () => {
    test('存在しないプロジェクトの場合は404エラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/non-existent-project/files/content',
        payload: { filePath: 'test.md' },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('不正なファイルパスの場合は404エラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        payload: { filePath: '../../../etc/passwd' },
      });

      // プロジェクトが存在しないため404が返される
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('ファイルパスが空の場合は400エラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        payload: { filePath: '' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('VALIDATION_ERROR');
    });
  });
});
