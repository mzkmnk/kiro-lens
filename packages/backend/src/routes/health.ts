import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  fastify.get('/api/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });
}
