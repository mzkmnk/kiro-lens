import { describe, it, expect } from 'vitest';
import type { HealthResponse, HealthStatus, ServerStatus, ProjectInfo } from './health';

describe('HealthStatus型', () => {
  it('healthy状態を表現できる', () => {
    const status: HealthStatus = 'healthy';
    expect(status).toBe('healthy');
  });

  it('unhealthy状態を表現できる', () => {
    const status: HealthStatus = 'unhealthy';
    expect(status).toBe('unhealthy');
  });
});

describe('HealthResponse型', () => {
  it('基本的なヘルスチェックレスポンスを作成できる', () => {
    const response: HealthResponse = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0.0',
      uptime: 3600,
    };

    expect(response.status).toBe('healthy');
    expect(response.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(response.version).toBe('1.0.0');
    expect(response.uptime).toBe(3600);
  });

  it('unhealthy状態のレスポンスを作成できる', () => {
    const response: HealthResponse = {
      status: 'unhealthy',
      timestamp: '2024-01-01T00:00:00.000Z',
      version: '1.0.0',
      uptime: 100,
    };

    expect(response.status).toBe('unhealthy');
  });
});

describe('ServerStatus型', () => {
  it('running状態のサーバーステータスを作成できる', () => {
    const status: ServerStatus = {
      frontend: {
        port: 3000,
        url: 'http://localhost:3000',
        status: 'running',
      },
      backend: {
        port: 3001,
        url: 'http://localhost:3001',
        status: 'running',
      },
    };

    expect(status.frontend.status).toBe('running');
    expect(status.backend.status).toBe('running');
    expect(status.frontend.port).toBe(3000);
    expect(status.backend.port).toBe(3001);
  });

  it('error状態のサーバーステータスを作成できる', () => {
    const status: ServerStatus = {
      frontend: {
        port: 3000,
        url: 'http://localhost:3000',
        status: 'error',
      },
      backend: {
        port: 3001,
        url: 'http://localhost:3001',
        status: 'stopped',
      },
    };

    expect(status.frontend.status).toBe('error');
    expect(status.backend.status).toBe('stopped');
  });
});

describe('ProjectInfo型', () => {
  it('基本的なプロジェクト情報を作成できる', () => {
    const info: ProjectInfo = {
      name: 'test-project',
      path: '/path/to/project',
      hasKiroDirectory: true,
    };

    expect(info.name).toBe('test-project');
    expect(info.path).toBe('/path/to/project');
    expect(info.hasKiroDirectory).toBe(true);
  });

  it('.kiroディレクトリパスを含むプロジェクト情報を作成できる', () => {
    const info: ProjectInfo = {
      name: 'test-project',
      path: '/path/to/project',
      hasKiroDirectory: true,
      kiroPath: '/path/to/project/.kiro',
    };

    expect(info.kiroPath).toBe('/path/to/project/.kiro');
  });

  it('.kiroディレクトリが存在しない場合の情報を作成できる', () => {
    const info: ProjectInfo = {
      name: 'test-project',
      path: '/path/to/project',
      hasKiroDirectory: false,
    };

    expect(info.hasKiroDirectory).toBe(false);
    expect(info.kiroPath).toBeUndefined();
  });
});
