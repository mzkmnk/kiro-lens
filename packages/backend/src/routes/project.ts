import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ProjectResponse } from '@kiro-lens/shared';
import path from 'node:path';
import fs from 'node:fs/promises';

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

export async function projectRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
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
}
