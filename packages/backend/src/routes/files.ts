import type {
  ApiResponse,
  FileItem,
  FileTreeResponse,
  IdParams,
  FileContentRequest,
  FileContentResponse,
} from '@kiro-lens/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { FileTreeError, getProjectFiles } from '../services/fileTreeService';
import { FileContentService } from '../services/fileContentService';
import { FileContentError } from '@kiro-lens/shared';

/**
 * プロジェクトIDのバリデーション
 *
 * @param id - 検証するプロジェクトID
 * @returns IDが有効かどうか（空文字や空白のみの文字列は無効）
 */
function validateProjectId(id: string): boolean {
  return id.trim().length > 0;
}

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
      timestamp: new Date(),
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
            timestamp: new Date(),
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
            timestamp: new Date(),
          },
        },
      };
  }
}

/**
 * FileContentErrorを適切なHTTPレスポンスに変換
 */
function handleFileContentError(error: FileContentError): {
  status: number;
  response: ApiResponse<never>;
} {
  const createErrorResponse = (type: string, message: string, details?: unknown) => ({
    success: false as const,
    error: {
      type,
      message,
      timestamp: new Date(),
      ...(details && { details }),
    },
  });

  switch (error.code) {
    case 'PROJECT_NOT_FOUND':
      return {
        status: 404,
        response: createErrorResponse(
          'PROJECT_NOT_FOUND',
          `Project '${error.projectId}' not found`,
          { projectId: error.projectId }
        ),
      };

    case 'FILE_NOT_FOUND':
      return {
        status: 404,
        response: createErrorResponse(
          'FILE_NOT_FOUND',
          `File '${error.filePath}' not found in project '${error.projectId}'`,
          { projectId: error.projectId, filePath: error.filePath }
        ),
      };

    case 'INVALID_PATH':
      return {
        status: 400,
        response: createErrorResponse(
          'INVALID_PATH',
          `Invalid file path: '${error.filePath}'. Path must be within .kiro directory`,
          { filePath: error.filePath }
        ),
      };

    case 'PERMISSION_DENIED':
      return {
        status: 403,
        response: createErrorResponse(
          'PERMISSION_DENIED',
          `Permission denied for file '${error.filePath}' in project '${error.projectId}'`,
          { projectId: error.projectId, filePath: error.filePath }
        ),
      };

    case 'READ_ERROR':
    default:
      return {
        status: 500,
        response: createErrorResponse(
          'READ_ERROR',
          `Failed to read file '${error.filePath}' in project '${error.projectId}'`,
          { projectId: error.projectId, filePath: error.filePath }
        ),
      };
  }
}

/**
 * ファイルツリー関連のAPIルート
 */
export async function filesRoutes(fastify: FastifyInstance) {
  const fileContentService = new FileContentService();
  /**
   * GET /api/projects/:id/files - プロジェクトのファイルツリーを取得
   *
   * 指定されたプロジェクトの.kiro配下のファイル構造を取得します。
   *
   * @param id - プロジェクトID
   * @returns ファイルツリー情報
   */
  fastify.get<{ Params: IdParams }>(
    '/api/projects/:id/files',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', minLength: 1 },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  files: { type: 'array' },
                },
                required: ['files'],
              },
            },
            required: ['success', 'data'],
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  timestamp: { type: 'string' },
                },
                required: ['type', 'message', 'timestamp'],
              },
            },
            required: ['success', 'error'],
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  timestamp: { type: 'string' },
                },
                required: ['type', 'message', 'timestamp'],
              },
            },
            required: ['success', 'error'],
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const startTime = Date.now();

      try {
        const { id } = request.params;

        // プロジェクトIDのバリデーション
        if (!validateProjectId(id)) {
          fastify.log.warn({ projectId: id }, 'Invalid project ID provided');
          return reply.status(400).send({
            success: false,
            error: {
              type: 'VALIDATION_ERROR',
              message: 'Invalid project ID',
              timestamp: new Date(),
            },
          });
        }

        fastify.log.info({ projectId: id }, 'Fetching file tree for project');

        // FileTreeServiceを使用してファイル構造を取得
        const files: FileItem[] = await getProjectFiles(id);

        const duration = Date.now() - startTime;
        fastify.log.info(
          { projectId: id, fileCount: files.length, duration },
          'File tree retrieved successfully'
        );

        const response: ApiResponse<FileTreeResponse> = {
          success: true,
          data: {
            files,
          },
        };

        return reply.status(200).send(response);
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
            timestamp: new Date(),
          },
        });
      }
    }
  );

  /**
   * POST /api/projects/:id/files/content - ファイル内容を取得
   *
   * 指定されたプロジェクトの.kiro配下のファイル内容を取得します。
   *
   * @param id - プロジェクトID
   * @param filePath - 取得したいファイルの相対パス
   * @returns ファイル内容
   */
  fastify.post<{
    Params: IdParams;
    Body: FileContentRequest;
  }>(
    '/api/projects/:id/files/content',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', minLength: 1 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            filePath: { type: 'string' },
          },
          required: ['filePath'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                },
                required: ['content'],
              },
            },
            required: ['success', 'data'],
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  timestamp: { type: 'string' },
                },
                required: ['type', 'message', 'timestamp'],
              },
            },
            required: ['success', 'error'],
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  timestamp: { type: 'string' },
                },
                required: ['type', 'message', 'timestamp'],
              },
            },
            required: ['success', 'error'],
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: IdParams; Body: FileContentRequest }>,
      reply: FastifyReply
    ) => {
      const startTime = Date.now();

      try {
        const { id } = request.params;
        const { filePath } = request.body;

        // プロジェクトIDのバリデーション
        if (!validateProjectId(id)) {
          fastify.log.warn({ projectId: id }, 'Invalid project ID provided');
          return reply.status(400).send({
            success: false,
            error: {
              type: 'VALIDATION_ERROR',
              message: 'Invalid project ID',
              timestamp: new Date(),
            },
          });
        }

        // ファイルパスのバリデーション
        if (!filePath || filePath.trim().length === 0) {
          fastify.log.warn({ projectId: id, filePath }, 'Invalid file path provided');
          return reply.status(400).send({
            success: false,
            error: {
              type: 'VALIDATION_ERROR',
              message: 'Invalid file path',
              timestamp: new Date(),
            },
          });
        }

        fastify.log.info(
          {
            projectId: id,
            filePath,
            requestId: request.id,
            userAgent: request.headers['user-agent'],
          },
          'Fetching file content'
        );

        // FileContentServiceを使用してファイル内容を取得
        const content = await fileContentService.getFileContent(id, filePath);

        const duration = Date.now() - startTime;
        fastify.log.info(
          {
            projectId: id,
            filePath,
            contentLength: content.length,
            duration,
            requestId: request.id,
          },
          'File content retrieved successfully'
        );

        const response: ApiResponse<FileContentResponse> = {
          success: true,
          data: {
            content,
          },
        };

        return reply.status(200).send(response);
      } catch (error) {
        const duration = Date.now() - startTime;

        if (error instanceof FileContentError) {
          const { status, response } = handleFileContentError(error);

          fastify.log.warn(
            {
              projectId: request.params.id,
              filePath: request.body?.filePath,
              errorCode: error.code,
              duration,
              error: error.message,
              requestId: request.id,
              userAgent: request.headers['user-agent'],
            },
            'File content retrieval failed with known error'
          );

          return reply.status(status).send(response);
        }

        // 予期しないエラーの場合
        fastify.log.error(
          {
            projectId: request.params.id,
            filePath: request.body?.filePath,
            duration,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            requestId: request.id,
            userAgent: request.headers['user-agent'],
          },
          'Unexpected error during file content retrieval'
        );

        return reply.status(500).send({
          success: false,
          error: {
            type: 'INTERNAL_ERROR',
            message: 'Internal server error',
            timestamp: new Date(),
          },
        });
      }
    }
  );
}
