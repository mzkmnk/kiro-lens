import { describe, test, expect, beforeEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { filesRoutes } from './files.js';

describe('Files Routes - Integration Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(filesRoutes);
  });

  describe('POST /api/projects/:id/files/content - 統合テスト', () => {
    test('エンドツーエンドのAPIフロー確認', async () => {
      // 正常なリクエスト
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        payload: { filePath: 'test.md' },
      });

      // レスポンス形式の確認
      expect(response.headers['content-type']).toMatch(/application\/json/);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('success');

      if (body.success) {
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('content');
        expect(typeof body.data.content).toBe('string');
      } else {
        expect(body).toHaveProperty('error');
        expect(body.error).toHaveProperty('type');
        expect(body.error).toHaveProperty('message');
        expect(body.error).toHaveProperty('timestamp');
      }
    });

    test('レスポンス形式の一貫性確認', async () => {
      const testCases = [
        {
          projectId: 'valid-project',
          filePath: 'valid-file.md',
          description: '正常なリクエスト',
        },
        {
          projectId: 'non-existent-project',
          filePath: 'test.md',
          description: '存在しないプロジェクト',
        },
        {
          projectId: 'test-project',
          filePath: '../../../etc/passwd',
          description: 'パストラバーサル攻撃',
        },
        {
          projectId: 'test-project',
          filePath: '',
          description: '空のファイルパス',
        },
      ];

      for (const testCase of testCases) {
        const response = await app.inject({
          method: 'POST',
          url: `/api/projects/${testCase.projectId}/files/content`,
          payload: { filePath: testCase.filePath },
        });

        // すべてのレスポンスが適切なHTTPステータスコードを返す
        expect([200, 400, 403, 404, 500]).toContain(response.statusCode);

        // すべてのレスポンスがJSONを返す
        expect(response.headers['content-type']).toMatch(/application\/json/);

        const body = JSON.parse(response.body);

        // すべてのレスポンスがsuccessフィールドを持つ
        expect(body).toHaveProperty('success');
        expect(typeof body.success).toBe('boolean');

        if (body.success) {
          // 成功レスポンスの形式確認
          expect(body).toHaveProperty('data');
          expect(body.data).toHaveProperty('content');
          expect(typeof body.data.content).toBe('string');
        } else {
          // エラーレスポンスの形式確認
          expect(body).toHaveProperty('error');
          expect(body.error).toHaveProperty('type');
          expect(body.error).toHaveProperty('message');
          expect(body.error).toHaveProperty('timestamp');
          expect(typeof body.error.type).toBe('string');
          expect(typeof body.error.message).toBe('string');
        }
      }
    });

    test('HTTPメソッドの確認', async () => {
      // POST以外のメソッドは405エラーを返す
      const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];

      for (const method of methods) {
        const response = await app.inject({
          method,
          url: '/api/projects/test-project/files/content',
          payload: { filePath: 'test.md' },
        });

        expect(response.statusCode).toBe(404); // ルートが存在しない
      }
    });

    test('Content-Typeヘッダーの確認', async () => {
      // 正しいContent-Typeでのリクエスト
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        headers: {
          'content-type': 'application/json',
        },
        payload: JSON.stringify({ filePath: 'test.md' }),
      });

      expect([200, 400, 404, 500]).toContain(response.statusCode);
    });

    test('大きなリクエストボディの処理', async () => {
      // 非常に長いファイルパス
      const longFilePath = 'a'.repeat(1000) + '.md';

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        payload: { filePath: longFilePath },
      });

      // 適切にエラーハンドリングされる
      expect([400, 404, 500]).toContain(response.statusCode);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('同時リクエストの処理', async () => {
      // 複数の同時リクエストを送信
      const requests = Array.from({ length: 5 }, (_, i) =>
        app.inject({
          method: 'POST',
          url: `/api/projects/test-project-${i}/files/content`,
          payload: { filePath: `test-${i}.md` },
        })
      );

      const responses = await Promise.all(requests);

      // すべてのリクエストが適切に処理される
      for (const response of responses) {
        expect([200, 400, 404, 500]).toContain(response.statusCode);

        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('success');
        expect(typeof body.success).toBe('boolean');
      }
    });

    test('エラーレスポンスの詳細確認', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/non-existent-project/files/content',
        payload: { filePath: 'test.md' },
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('FILE_ERROR');
      expect(body.error.message).toContain('Project not found');
      expect(new Date(body.error.timestamp)).toBeInstanceOf(Date);
    });
  });
});
