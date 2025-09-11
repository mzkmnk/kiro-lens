import fastifyPlugin from 'fastify-plugin';
import type { FastifyTypebox } from '../app';
import { TypeBoxError } from '@sinclair/typebox/errors';

/**
 * TypeBoxエラーハンドリングプラグイン
 *
 * TypeBoxバリデーションエラーと一般的なエラーを統一された形式で処理します。
 */
async function errorHandlerPlugin(fastify: FastifyTypebox) {
  fastify.setErrorHandler(async (error, request, reply) => {
    const timestamp = new Date().toISOString();
    const requestId = request.id;

    // TypeBoxバリデーションエラーの処理
    if (error instanceof TypeBoxError) {
      fastify.log.warn(
        {
          requestId,
          path: error.path,
          value: error.value,
          message: error.message,
        },
        'TypeBox validation error'
      );

      return reply.status(400).send({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          timestamp,
          details: {
            path: error.path,
            value: error.value,
            message: error.message,
          },
        },
      });
    }

    // Fastifyの標準バリデーションエラー
    if (error.validation) {
      fastify.log.warn(
        {
          requestId,
          validation: error.validation,
          validationContext: error.validationContext,
        },
        'Fastify validation error'
      );

      return reply.status(400).send({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          timestamp,
          details: {
            validation: error.validation,
            context: error.validationContext,
          },
        },
      });
    }

    // HTTPステータスコードが設定されているエラー
    if (error.statusCode) {
      const statusCode = error.statusCode;

      // 4xxエラー（クライアントエラー）
      if (statusCode >= 400 && statusCode < 500) {
        fastify.log.warn(
          {
            requestId,
            statusCode,
            message: error.message,
          },
          'Client error'
        );

        const errorType =
          statusCode === 404
            ? 'NOT_FOUND'
            : statusCode === 403
              ? 'PERMISSION_DENIED'
              : 'VALIDATION_ERROR';

        return reply.status(statusCode).send({
          success: false,
          error: {
            type: errorType,
            message: error.message || 'Client error',
            timestamp,
          },
        });
      }

      // 5xxエラー（サーバーエラー）
      if (statusCode >= 500) {
        fastify.log.error(
          {
            requestId,
            statusCode,
            message: error.message,
            stack: error.stack,
          },
          'Server error with status code'
        );

        return reply.status(statusCode).send({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'Internal server error',
            timestamp,
          },
        });
      }
    }

    // その他の予期しないエラー
    fastify.log.error(
      {
        requestId,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      'Unexpected error'
    );

    return reply.status(500).send({
      success: false,
      error: {
        type: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp,
      },
    });
  });

  // 404ハンドラー（ルートが見つからない場合）
  fastify.setNotFoundHandler(async (request, reply) => {
    const timestamp = new Date().toISOString();
    const requestId = request.id;

    fastify.log.warn(
      {
        requestId,
        method: request.method,
        url: request.url,
      },
      'Route not found'
    );

    return reply.status(404).send({
      success: false,
      error: {
        type: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
        timestamp,
      },
    });
  });
}

export default fastifyPlugin(errorHandlerPlugin, {
  name: 'error-handler',
  fastify: '5.x',
});
