import Fastify, { FastifyInstance } from 'fastify';
import { corsPlugin } from './plugins/cors.js';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/project.js';

export function createServer(): FastifyInstance {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
    disableRequestLogging: process.env.NODE_ENV === 'test',
  });

  // プラグイン登録
  fastify.register(corsPlugin);

  // ルート登録
  fastify.register(healthRoutes);
  fastify.register(projectRoutes);

  return fastify;
}

const start = async () => {
  const fastify = createServer();

  try {
    const port = 3001;
    await fastify.listen({ port, host: 'localhost' });
    console.log(`サーバーが起動しました: http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// 直接実行時のみサーバーを起動
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
