import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../server.js';
import { ProjectResponse } from '@kiro-lens/shared';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

describe('Project API', () => {
  let server: FastifyInstance;
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    server = createServer();
    await server.ready();

    // テスト用の一時ディレクトリを作成
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kiro-lens-test-'));
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    await server.close();
    // 元のディレクトリに戻す
    process.chdir(originalCwd);
    // 一時ディレクトリを削除
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('GET /api/project', () => {
    test('.kiroディレクトリが存在する場合、正しいプロジェクト情報を返す', async () => {
      // .kiroディレクトリを作成
      const kiroDir = path.join(tempDir, '.kiro');
      await fs.mkdir(kiroDir, { recursive: true });

      // テストディレクトリに移動
      process.chdir(tempDir);

      const response = await server.inject({
        method: 'GET',
        url: '/api/project',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body) as ProjectResponse;
      expect(body.name).toBe(path.basename(tempDir));
      expect(body.hasKiroDir).toBe(true);
      expect(body.kiroPath).toBe(await fs.realpath(kiroDir));
    });

    test('.kiroディレクトリが存在しない場合、hasKiroDirがfalseになる', async () => {
      // テストディレクトリに移動（.kiroディレクトリは作成しない）
      process.chdir(tempDir);

      const response = await server.inject({
        method: 'GET',
        url: '/api/project',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body) as ProjectResponse;
      expect(body.name).toBe(path.basename(tempDir));
      expect(body.hasKiroDir).toBe(false);
      expect(body.kiroPath).toBeUndefined();
    });

    test('プロジェクト名が正しく取得される', async () => {
      // 特定の名前のディレクトリを作成
      const projectDir = path.join(tempDir, 'my-test-project');
      await fs.mkdir(projectDir, { recursive: true });
      process.chdir(projectDir);

      const response = await server.inject({
        method: 'GET',
        url: '/api/project',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body) as ProjectResponse;
      expect(body.name).toBe('my-test-project');
    });
  });
});
