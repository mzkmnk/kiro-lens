import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import cors from '@fastify/cors';

export async function corsPlugin(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  await fastify.register(cors, {
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
