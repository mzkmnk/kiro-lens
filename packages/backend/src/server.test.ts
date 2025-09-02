import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from './server.js';

describe('Fastify基本サーバー', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = createServer();
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  test('Fastifyインスタンスが正しく作成される', () => {
    expect(server).toBeDefined();
    expect(server.server).toBeDefined();
  });

  test('指定ポートでサーバーが起動する', async () => {
    const port = 0; // 利用可能なポートを自動選択
    const address = await server.listen({ port, host: 'localhost' });

    expect(address).toBeDefined();
    expect(server.server.listening).toBe(true);
  });

  test('サーバーが正常に停止する', async () => {
    const port = 0;
    await server.listen({ port, host: 'localhost' });

    expect(server.server.listening).toBe(true);

    await server.close();
    expect(server.server.listening).toBe(false);
  });

  test('サーバーインスタンスにログ機能が設定されている', () => {
    expect(server.log).toBeDefined();
    expect(typeof server.log.info).toBe('function');
    expect(typeof server.log.error).toBe('function');
  });
});
