/**
 * Fastify サーバーエントリーポイント
 */

import { createApp } from './app.js';

const start = async () => {
    const app = await createApp();

    try {
        const port = parseInt(process.env.PORT || '3001', 10);
        const host = process.env.HOST || 'localhost';

        await app.listen({ port, host });

        console.log(`🚀 バックエンドサーバーが起動しました: http://${host}:${port}`);
        console.log(`📡 WebSocket接続準備完了`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

// プロセス終了時の処理
process.on('SIGINT', async () => {
    console.log('\n🛑 バックエンドサーバーを停止中...');
    process.exit(0);
});

start();