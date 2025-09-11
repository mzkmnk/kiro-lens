import type { FastifyTypebox } from '../app';
import { getProjectFiles, FileTreeError } from '../services/fileTreeService';
import {
  ProjectFilesParamsSchema,
  FileTreeResponseSchema,
  ErrorResponseSchema,
  type FileItem,
  type ApiResponse,
} from '@kiro-lens/shared';

// TypeBoxスキーマによる自動バリデーションのため、手動バリデーション関数は不要

/**
 * FileTreeErrorを適切なHTTPレスポンスに変換
 */
function handleFileTreeError(error: FileTreeError): {
  status: number;
  response: ApiResponse<never>;
} {
  const createErrorResponse = (message: string) => ({
    success: false as const,
    error: {
      type: 'NOT_FOUND' as const,
      message,
      timestamp: new Date().toISOString(),
    },
  });

  switch (error.code) {
    case 'PROJECT_NOT_FOUND':
    case 'PROJECT_ID_MISMATCH':
      return {
        status: 404,
        response: createErrorResponse('Project not found'),
      };

    case 'KIRO_DIR_NOT_FOUND':
    case 'DIRECTORY_NOT_FOUND':
      return {
        status: 404,
        response: createErrorResponse('.kiro directory not found'),
      };

    case 'PERMISSION_DENIED':
      return {
        status: 403,
        response: {
          success: false,
          error: {
            type: 'PERMISSION_DENIED',
            message: 'Permission denied',
            timestamp: new Date().toISOString(),
          },
        },
      };

    default:
      return {
        status: 500,
        response: {
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'Internal server error',
            timestamp: new Date().toISOString(),
          },
        },
      };
  }
}

/**
 * ファイルツリー関連のAPIルート（TypeBoxスキーマベース）
 */
export async function filesRoutes(fastify: FastifyTypebox) {
  /**
   * GET /api/projects/:id/files - プロジェクトのファイルツリーを取得
   *
   * 指定されたプロジェクトの.kiro配下のファイル構造を取得します。
   * TypeBoxスキーマによる自動バリデーションと型安全性を提供します。
   *
   * @param id - プロジェクトID
   * @returns ファイルツリー情報
   */
  fastify.get(
    '/api/projects/:id/files',
    {
      schema: {
        params: ProjectFilesParamsSchema,
        response: {
          200: FileTreeResponseSchema,
          400: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
        tags: ['files'],
        summary: 'プロジェクトファイルツリー取得',
        description: '指定されたプロジェクトの.kiro配下のファイル構造を取得します',
      },
    },
    async (request, reply) => {
      const startTime = Date.now();

      try {
        // request.paramsは自動的にProjectFilesParams型として推論される
        const { id } = request.params;

        fastify.log.info({ projectId: id }, 'Fetching file tree for project');

        // FileTreeServiceを使用してファイル構造を取得
        const files: FileItem[] = await getProjectFiles(id);

        const duration = Date.now() - startTime;
        fastify.log.info(
          { projectId: id, fileCount: files.length, duration },
          'File tree retrieved successfully'
        );

        // レスポンスも型安全
        return reply.status(200).send({
          success: true,
          data: {
            files,
          },
        });
      } catch (error) {
        const duration = Date.now() - startTime;

        if (error instanceof FileTreeError) {
          const { status, response } = handleFileTreeError(error);

          fastify.log.warn(
            {
              projectId: request.params.id,
              errorCode: error.code,
              duration,
              error: error.message,
            },
            'File tree retrieval failed with known error'
          );

          return reply.status(status).send(response);
        }

        // 予期しないエラーの場合
        fastify.log.error(
          {
            projectId: request.params.id,
            duration,
            error: error instanceof Error ? error.message : String(error),
          },
          'Unexpected error during file tree retrieval'
        );

        return reply.status(500).send({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'Internal server error',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );
}
