import Fastify, {
  FastifyInstance,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
} from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

/**
 * TypeBox統合Fastifyインスタンス型
 */
export type FastifyTypebox = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

/**
 * Fastifyアプリケーションの作成と設定
 */
export function createApp(): FastifyTypebox {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
    disableRequestLogging: process.env.NODE_ENV === 'test',
    ajv: {
      customOptions: {
        // TypeBoxの最適化設定
        strict: false,
        coerceTypes: true,
        useDefaults: true,
        removeAdditional: true,
      },
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  return app;
}
