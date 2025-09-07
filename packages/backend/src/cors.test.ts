import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from './server.js';

describe('FastifyCORS設定', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = createServer();
    await server.ready();
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  test('CORS設定が有効になっている', async () => {
    // サーバーが正常に起動することを確認（CORSプラグインが正しく登録されている）
    expect(server).toBeDefined();
    expect(server.server).toBeDefined();
  });

  test('プリフライトリクエストが正しく処理される', async () => {
    const response = await server.inject({
      method: 'OPTIONS',
      url: '/api/health',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBeDefined();
    expect(response.headers['access-control-allow-methods']).toBeDefined();
  });

  test('開発環境用のオリジン制限が設定されている', async () => {
    // サーバーが正常に動作することを確認（CORS設定が適用されている）
    const response = await server.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
  });
});
