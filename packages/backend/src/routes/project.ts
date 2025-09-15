import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  ProjectResponse,
  AddProjectRequest,
  AddProjectResponse,
  ProjectListResponse,
  ApiResponse,
  ApiError,
} from '@kiro-lens/shared';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  addProject,
  removeProject,
  getAllProjects,
  setCurrentProject,
  validateProjectPath,
  ProjectError,
} from '../services/projectService.js';

/**
 * プロジェクト情報を取得する
 */
async function getProjectInfo(): Promise<ProjectResponse> {
  const projectRoot = process.cwd();
  const projectName = path.basename(projectRoot);
  const kiroPath = path.join(projectRoot, '.kiro');
  let hasKiroDir = false;
  let resolvedKiroPath: string | undefined;

  try {
    const stats = await fs.stat(kiroPath);
    hasKiroDir = stats.isDirectory();
    if (hasKiroDir) {
      resolvedKiroPath = await fs.realpath(kiroPath);
    }
  } catch {
    hasKiroDir = false;
  }

  return {
    name: projectName,
    hasKiroDir,
    kiroPath: resolvedKiroPath,
  };
}

/**
 * APIエラーレスポンスを作成する
 */
function createErrorResponse(type: ApiError['type'], message: string): ApiResponse<never> {
  return {
    success: false,
    error: {
      type,
      message,
      timestamp: new Date(),
    },
  };
}

/**
 * API成功レスポンスを作成する
 */
function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export async function projectRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  // 既存のエンドポイント: 現在のプロジェクト情報取得
  fastify.get('/api/project', async (_request, reply) => {
    try {
      const projectInfo = await getProjectInfo();
      return projectInfo;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      fastify.log.error(`Failed to get project information: ${errorMessage}`);

      reply.status(500);
      return {
        error: 'Internal Server Error',
        message: 'Failed to retrieve project information',
      };
    }
  });

  // プロジェクト追加エンドポイント
  fastify.post<{ Body: AddProjectRequest }>('/api/projects', async (request, reply) => {
    try {
      const { path } = request.body;

      if (!path || typeof path !== 'string') {
        reply.status(400);
        return createErrorResponse('VALIDATION_ERROR', 'パスが指定されていません');
      }

      const project = await addProject(path);
      const response: AddProjectResponse = {
        project,
        message: `プロジェクト「${project.name}」を追加しました`,
      };

      reply.status(201);
      return createSuccessResponse(response);
    } catch (error: unknown) {
      if (error instanceof ProjectError) {
        if (error.code === 'PROJECT_ALREADY_EXISTS') {
          reply.status(409);
          return createErrorResponse('VALIDATION_ERROR', error.message);
        } else {
          reply.status(400);
          return createErrorResponse('VALIDATION_ERROR', error.message);
        }
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      fastify.log.error(`Failed to add project: ${errorMessage}`);

      reply.status(500);
      return createErrorResponse('INTERNAL_ERROR', 'プロジェクトの追加に失敗しました');
    }
  });

  // プロジェクト削除エンドポイント
  fastify.delete<{ Params: { id: string } }>('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      if (!id) {
        reply.status(400);
        return createErrorResponse('VALIDATION_ERROR', 'プロジェクトIDが指定されていません');
      }

      await removeProject(id);

      reply.status(200);
      return createSuccessResponse({ message: 'プロジェクトを削除しました' });
    } catch (error: unknown) {
      if (error instanceof ProjectError) {
        if (error.code === 'PROJECT_NOT_FOUND') {
          reply.status(404);
          return createErrorResponse('NOT_FOUND', error.message);
        } else {
          reply.status(400);
          return createErrorResponse('VALIDATION_ERROR', error.message);
        }
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      fastify.log.error(`Failed to remove project: ${errorMessage}`);

      reply.status(500);
      return createErrorResponse('INTERNAL_ERROR', 'プロジェクトの削除に失敗しました');
    }
  });

  // プロジェクト一覧取得エンドポイント
  fastify.get('/api/projects', async (_request, reply) => {
    try {
      const projects = await getAllProjects();

      const response: ProjectListResponse = {
        projects,
      };

      return createSuccessResponse(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      fastify.log.error(`Failed to get projects: ${errorMessage}`);

      reply.status(500);
      return createErrorResponse('INTERNAL_ERROR', 'プロジェクト一覧の取得に失敗しました');
    }
  });

  // パス検証エンドポイント
  fastify.post<{ Body: { path: string } }>(
    '/api/projects/validate-path',
    async (request, reply) => {
      try {
        const { path } = request.body;

        if (!path || typeof path !== 'string') {
          reply.status(400);
          return createErrorResponse('VALIDATION_ERROR', 'パスが指定されていません');
        }

        const validation = await validateProjectPath(path);

        return createSuccessResponse(validation);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        fastify.log.error(`Failed to validate path: ${errorMessage}`);

        reply.status(500);
        return createErrorResponse('INTERNAL_ERROR', 'パスの検証に失敗しました');
      }
    }
  );

  // プロジェクト選択エンドポイント
  fastify.post<{ Params: { id: string } }>('/api/projects/:id/select', async (request, reply) => {
    try {
      const { id } = request.params;

      if (!id) {
        reply.status(400);
        return createErrorResponse('VALIDATION_ERROR', 'プロジェクトIDが指定されていません');
      }

      const project = await setCurrentProject(id);

      return createSuccessResponse({
        project,
        message: `プロジェクト「${project.name}」を選択しました`,
      });
    } catch (error: unknown) {
      if (error instanceof ProjectError) {
        if (error.code === 'PROJECT_NOT_FOUND') {
          reply.status(404);
          return createErrorResponse('NOT_FOUND', error.message);
        } else {
          reply.status(400);
          return createErrorResponse('VALIDATION_ERROR', error.message);
        }
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      fastify.log.error(`Failed to select project: ${errorMessage}`);

      reply.status(500);
      return createErrorResponse('INTERNAL_ERROR', 'プロジェクトの選択に失敗しました');
    }
  });
}
