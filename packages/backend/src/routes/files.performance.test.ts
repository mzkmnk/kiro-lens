import { describe, test, expect, beforeEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { filesRoutes } from './files.js';

describe('Files Routes - Performance Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(filesRoutes);
  });

  describe('POST /api/projects/:id/files/content - パフォーマンステスト', () => {
    test('大きなファイルパスでの動作確認', async () => {
      const startTime = Date.now();

      // 非常に長いファイルパス（1000文字）
      const longFilePath = 'a'.repeat(1000) + '.md';

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/550e8400-e29b-41d4-a716-446655440000/files/content',
        payload: { filePath: longFilePath },
      });

      const duration = Date.now() - startTime;

      // レスポンス時間が合理的な範囲内（5秒以内）
      expect(duration).toBeLessThan(5000);

      // 適切にエラーハンドリングされる
      expect([400, 404, 500]).toContain(response.statusCode);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('同時リクエストの処理性能', async () => {
      const startTime = Date.now();
      const concurrentRequests = 10;

      // 10個の同時リクエストを送信
      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        app.inject({
          method: 'POST',
          url: `/api/projects/550e8400-e29b-41d4-a716-44665544000${i}/files/content`,
          payload: { filePath: `test-${i}.md` },
        })
      );

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // 全体の処理時間が合理的な範囲内（10秒以内）
      expect(duration).toBeLessThan(10000);

      // すべてのリクエストが適切に処理される
      expect(responses).toHaveLength(concurrentRequests);

      for (const response of responses) {
        expect([200, 400, 404, 500]).toContain(response.statusCode);

        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('success');
        expect(typeof body.success).toBe('boolean');
      }
    });

    test('連続リクエストの処理性能', async () => {
      const startTime = Date.now();
      const requestCount = 20;
      const responses = [];

      // 20個の連続リクエストを送信
      for (let i = 0; i < requestCount; i++) {
        const response = await app.inject({
          method: 'POST',
          url: `/api/projects/550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, '0')}/files/content`,
          payload: { filePath: `test-${i}.md` },
        });
        responses.push(response);
      }

      const duration = Date.now() - startTime;
      const averageResponseTime = duration / requestCount;

      // 平均レスポンス時間が合理的な範囲内（1秒以内）
      expect(averageResponseTime).toBeLessThan(1000);

      // すべてのリクエストが適切に処理される
      expect(responses).toHaveLength(requestCount);

      for (const response of responses) {
        expect([200, 400, 404, 500]).toContain(response.statusCode);
      }
    });

    test('メモリ使用量の確認', async () => {
      const initialMemory = process.memoryUsage();

      // 複数のリクエストを処理
      const requests = Array.from({ length: 50 }, (_, i) =>
        app.inject({
          method: 'POST',
          url: `/api/projects/550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, '0')}/files/content`,
          payload: { filePath: `test-${i}.md` },
        })
      );

      await Promise.all(requests);

      // ガベージコレクションを実行
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // メモリ増加が合理的な範囲内（100MB以内）
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    test('エラーレスポンスの処理性能', async () => {
      const startTime = Date.now();

      // 意図的にエラーを発生させるリクエスト
      const errorRequests = [
        // 空のプロジェクトID
        app.inject({
          method: 'POST',
          url: '/api/projects/ /files/content',
          payload: { filePath: 'test.md' },
        }),
        // 空のファイルパス
        app.inject({
          method: 'POST',
          url: '/api/projects/550e8400-e29b-41d4-a716-446655440000/files/content',
          payload: { filePath: '' },
        }),
        // 不正なファイルパス
        app.inject({
          method: 'POST',
          url: '/api/projects/550e8400-e29b-41d4-a716-446655440000/files/content',
          payload: { filePath: '../../../etc/passwd' },
        }),
      ];

      const responses = await Promise.all(errorRequests);
      const duration = Date.now() - startTime;

      // エラーレスポンスの処理時間が合理的な範囲内（3秒以内）
      expect(duration).toBeLessThan(3000);

      // すべてのエラーレスポンスが適切に処理される
      for (const response of responses) {
        expect([400, 404, 500]).toContain(response.statusCode);

        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBeDefined();
      }
    });

    test('レスポンスサイズの確認', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/550e8400-e29b-41d4-a716-446655440000/files/content',
        payload: { filePath: 'test.md' },
      });

      const responseSize = Buffer.byteLength(response.body, 'utf8');

      // レスポンスサイズが合理的な範囲内（10KB以内）
      // エラーレスポンスは通常小さいサイズになる
      expect(responseSize).toBeLessThan(10 * 1024);

      // Content-Lengthヘッダーが設定されている
      expect(response.headers).toHaveProperty('content-length');
    });

    test('タイムアウト処理の確認', async () => {
      const startTime = Date.now();

      // 複雑なパストラバーサル攻撃パターン
      const complexPath = '../'.repeat(100) + 'etc/passwd';

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/550e8400-e29b-41d4-a716-446655440000/files/content',
        payload: { filePath: complexPath },
      });

      const duration = Date.now() - startTime;

      // 複雑な攻撃パターンでも合理的な時間内で処理される（2秒以内）
      expect(duration).toBeLessThan(2000);

      // 適切にエラーレスポンスが返される
      expect([400, 404]).toContain(response.statusCode);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });
});
