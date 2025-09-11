import { describe, test, expect, beforeEach } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { createServer } from '../server';
import type { FastifyTypebox } from '../app';
import {
  FileTreeResponseSchema,
  ErrorResponseSchema,
  type FileTreeResponse,
  type ErrorResponse,
} from '@kiro-lens/shared';

describe('Files API (TypeBoxスキーマベース)', () => {
  let app: FastifyTypebox;

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
      expect(Value.Check(ErrorResponseSchema, body)).toBe(true);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('NOT_FOUND');
      expect(body.error.message).toContain('Project not found');
    });

    test('エラーケース: 無効なプロジェクトIDの場合は400を返す', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/invalid@id!/files', // 無効な文字を含むプロジェクトID
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(Value.Check(ErrorResponseSchema, body)).toBe(true);
      expect(body.success).toBe(false);
      expect(body.error.type).toBe('VALIDATION_ERROR');
    });

    test('レスポンス形式: TypeBoxスキーマに準拠', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/projects/test-project/files',
      });

      const body = JSON.parse(response.body);

      // TypeBoxスキーマバリデーション
      if (response.statusCode === 200) {
        expect(Value.Check(FileTreeResponseSchema, body)).toBe(true);
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('files');
        expect(Array.isArray(body.data.files)).toBe(true);
      } else {
        expect(Value.Check(ErrorResponseSchema, body)).toBe(true);
        expect(body.success).toBe(false);
        expect(body.error).toHaveProperty('type');
        expect(body.error).toHaveProperty('message');
        expect(body.error).toHaveProperty('timestamp');
      }
    });

    test('TypeBoxバリデーション: 正常なプロジェクトIDを受け入れる', async () => {
      const validIds = ['project-123', 'my_project', 'test-project-2024'];

      for (const id of validIds) {
        const response = await app.inject({
          method: 'GET',
          url: `/api/projects/${id}/files`,
        });

        // バリデーションエラーではないことを確認（404や500は可能）
        expect(response.statusCode).not.toBe(400);
      }
    });

    test('TypeBoxバリデーション: 無効なプロジェクトIDを拒否する', async () => {
      const invalidIds = ['', 'project@123', 'project with spaces', 'プロジェクト'];

      for (const id of invalidIds) {
        const response = await app.inject({
          method: 'GET',
          url: `/api/projects/${encodeURIComponent(id)}/files`,
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(Value.Check(ErrorResponseSchema, body)).toBe(true);
        expect(body.error.type).toBe('VALIDATION_ERROR');
      }
    });
  });
});
