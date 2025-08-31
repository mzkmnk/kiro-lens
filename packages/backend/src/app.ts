/**
 * Fastify アプリケーション設定
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createApp = async () => {
    const fastify = Fastify({
        logger: {
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }
    });

    // CORS設定
    await fastify.register(cors, {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true
    });

    // 静的ファイル配信（フロントエンドビルド用）
    await fastify.register(staticFiles, {
        root: join(__dirname, '../../../packages/frontend/dist'),
        prefix: '/static/'
    });

    // ヘルスチェックエンドポイント
    fastify.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // API ルートの登録（後で実装）
    fastify.get('/api/status', async (request, reply) => {
        return {
            status: 'running',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        };
    });

    return fastify;
};