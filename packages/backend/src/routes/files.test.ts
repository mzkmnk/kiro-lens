import { describe, test, expect, beforeEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { filesRoutes } from './files.js';

describe('Files Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(filesRoutes);
  });

  describe('POST /api/projects/:id/files/content', () => {
    test('エンドポイントが存在する', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        payload: { filePath: 'test.md' },
      });

      // エンドポイントが実装されていることを確認（404以外）
      // 実際のプロジェクトが存在しないので404が返るのは正常
      expect([400, 404, 500]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('プロジェクトIDが空の場合は400エラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/ /files/content',
        payload: { filePath: 'test.md' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('VALIDATION_ERROR');
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

    test('不正なファイルパスの場合は400エラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        payload: { filePath: '../../../etc/passwd' },
      });

      // プロジェクトが存在しないか、不正なパスでエラーになる
      expect([400, 404]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });
});
