import { describe, it, expect } from 'vitest';
import {
    HealthStatus,
    isHealthyStatus,
    createHealthResponse
} from '../types/health.js';

describe('ヘルス関連ユーティリティ', () => {
    describe('isHealthyStatus', () => {
        it('正常な状態を識別すべき', () => {
            expect(isHealthyStatus('healthy')).toBe(true);
        });

        it('異常な状態を識別すべき', () => {
            expect(isHealthyStatus('unhealthy')).toBe(false);
            expect(isHealthyStatus('degraded')).toBe(false);
        });
    });

    describe('createHealthResponse', () => {
        it('基本的なヘルスレスポンスを作成すべき', () => {
            const response = createHealthResponse('healthy', '1.0.0');

            expect(response.status).toBe('healthy');
            expect(response.version).toBe('1.0.0');
            expect(typeof response.timestamp).toBe('string');
            expect(typeof response.uptime).toBe('number');
        });

        it('詳細付きのヘルスレスポンスを作成すべき', () => {
            const details = {
                memory: { used: 50, total: 100 }
            };
            const response = createHealthResponse('degraded', '1.0.0', details);

            expect(response.status).toBe('degraded');
            expect(response.details).toEqual(details);
        });
    });
});