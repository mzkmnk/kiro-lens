import { describe, test, expect, beforeEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { filesRoutes } from './files';

describe('Files Routes - Security Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(filesRoutes);
  });

  describe('POST /api/projects/:id/files/content - セキュリティテスト', () => {
    test('パストラバーサル攻撃 - 相対パス（../）を使用した攻撃を防ぐ', async () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '../.env',
        '../../package.json',
        '../../../home/user/.ssh/id_rsa',
      ];

      for (const maliciousPath of maliciousPaths) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/projects/test-project/files/content',
          payload: { filePath: maliciousPath },
        });

        // パストラバーサル攻撃は400または404エラーで拒否される
        expect([400, 404]).toContain(response.statusCode);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      }
    });

    test('絶対パス攻撃を防ぐ', async () => {
      const absolutePaths = [
        '/etc/passwd',
        '/home/user/.bashrc',
        'C:\\Windows\\System32\\config\\sam',
        '/var/log/auth.log',
        '/root/.ssh/authorized_keys',
      ];

      for (const absolutePath of absolutePaths) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/projects/test-project/files/content',
          payload: { filePath: absolutePath },
        });

        // 絶対パス攻撃は400または404エラーで拒否される
        expect([400, 404]).toContain(response.statusCode);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      }
    });

    test('URLエンコードされたパストラバーサル攻撃を防ぐ', async () => {
      const encodedPaths = [
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd', // ../../../etc/passwd
        '%2e%2e%5c%2e%2e%5c%2e%2e%5cwindows%5csystem32', // ..\..\..\\windows\\system32
        '..%2f..%2f..%2fetc%2fpasswd', // ../../../etc/passwd (部分エンコード)
      ];

      for (const encodedPath of encodedPaths) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/projects/test-project/files/content',
          payload: { filePath: encodedPath },
        });

        // エンコードされた攻撃も400または404エラーで拒否される
        expect([400, 404]).toContain(response.statusCode);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      }
    });

    test('Null byte攻撃を防ぐ', async () => {
      const nullBytePaths = ['test.md\x00.jpg', 'config\x00/etc/passwd', 'file.txt\x00'];

      for (const nullBytePath of nullBytePaths) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/projects/test-project/files/content',
          payload: { filePath: nullBytePath },
        });

        // Null byte攻撃は400または404エラーで拒否される
        expect([400, 404]).toContain(response.statusCode);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      }
    });

    test('権限外ディレクトリアクセス攻撃を防ぐ', async () => {
      const unauthorizedPaths = [
        '.git/config',
        'node_modules/package.json',
        '.env',
        'package.json',
        'src/config/database.js',
      ];

      for (const unauthorizedPath of unauthorizedPaths) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/projects/test-project/files/content',
          payload: { filePath: unauthorizedPath },
        });

        // .kiro配下以外のファイルアクセスは400または404エラーで拒否される
        expect([400, 404]).toContain(response.statusCode);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      }
    });

    test('不正なプロジェクトIDでの攻撃を防ぐ', async () => {
      const maliciousProjectIds = [
        '../other-project',
        '/etc',
        '../../',
        'project\x00',
        '',
        '   ', // 空白のみ
      ];

      for (const maliciousId of maliciousProjectIds) {
        const response = await app.inject({
          method: 'POST',
          url: `/api/projects/${encodeURIComponent(maliciousId)}/files/content`,
          payload: { filePath: 'test.md' },
        });

        // 不正なプロジェクトIDは適切にエラーで拒否される
        expect([400, 404, 500]).toContain(response.statusCode);

        // レスポンスボディが存在する場合のみチェック
        if (response.body) {
          const body = JSON.parse(response.body);
          if (body.success !== undefined) {
            expect(body.success).toBe(false);
          }
        }
      }
    });

    test('大きなファイルパス攻撃を防ぐ', async () => {
      // 非常に長いファイルパス（DoS攻撃の一種）
      const longPath = 'a'.repeat(10000);

      const response = await app.inject({
        method: 'POST',
        url: '/api/projects/test-project/files/content',
        payload: { filePath: longPath },
      });

      // 長すぎるパスは適切に処理される
      expect([400, 404, 500]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    test('特殊文字を含むファイルパス攻撃を防ぐ', async () => {
      const specialCharPaths = [
        'file<script>alert(1)</script>.md',
        'file"OR"1"="1".md',
        "file';DROP TABLE users;--.md",
        'file${env:PATH}.md',
        'file`whoami`.md',
      ];

      for (const specialPath of specialCharPaths) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/projects/test-project/files/content',
          payload: { filePath: specialPath },
        });

        // 特殊文字を含むパスは適切に処理される
        expect([400, 404]).toContain(response.statusCode);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
      }
    });
  });
});
