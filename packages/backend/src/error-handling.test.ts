import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from './server';

describe('Fastifyエラーハンドリング', () => {
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

  test('404エラーが正しく処理される', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/nonexistent',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty('error');
    expect(response.json()).toHaveProperty('message');
  });

  test('500エラーが正しく処理される', async () => {
    // 新しいサーバーインスタンスを作成してエラールートを追加
    const errorServer = createServer();
    errorServer.get('/error', async () => {
      throw new Error('Test error');
    });
    await errorServer.ready();

    const response = await errorServer.inject({
      method: 'GET',
      url: '/error',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toHaveProperty('error');
    expect(response.json()).toHaveProperty('message');

    await errorServer.close();
  });

  test('統一されたエラーレスポンス形式', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/nonexistent',
    });

    const errorResponse = response.json();
    expect(errorResponse).toHaveProperty('error');
    expect(errorResponse).toHaveProperty('message');
    expect(errorResponse).toHaveProperty('statusCode');
    expect(typeof errorResponse.error).toBe('string');
    expect(typeof errorResponse.message).toBe('string');
    expect(typeof errorResponse.statusCode).toBe('number');
  });
});
