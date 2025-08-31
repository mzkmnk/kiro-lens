// 最低限のFastifyサーバー
import Fastify from 'fastify';

const start = async () => {
    const fastify = Fastify({
        logger: true
    });

    // ヘルスチェック
    fastify.get('/health', async () => {
        return { status: 'ok' };
    });

    try {
        const port = 3001;
        await fastify.listen({ port, host: 'localhost' });
        console.log(`サーバーが起動しました: http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();