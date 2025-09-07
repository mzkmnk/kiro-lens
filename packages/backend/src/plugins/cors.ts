import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fp from 'fastify-plugin';

export const corsPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.register(cors, {
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
});
