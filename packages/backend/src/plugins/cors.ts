import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import cors from '@fastify/cors';

export async function corsPlugin(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  await fastify.register(cors, {
    origin: true, // 開発環境では全てのオリジンを許可
    credentials: true,
  });
}
