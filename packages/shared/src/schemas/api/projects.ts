import { Type, Static } from '@sinclair/typebox';
import { ApiResponseSchema } from './common';
import {
  ProjectInfoSchema,
  ProjectResponseSchema,
  ValidationResultSchema,
} from '../domain/project';
import { ProjectIdSchema, AbsolutePathSchema } from '../security/sanitization';

/**
 * プロジェクト一覧取得レスポンススキーマ
 * GET /api/projects
 */
export const ProjectListResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      projects: Type.Array(ProjectInfoSchema, {
        description: '管理対象のプロジェクト一覧',
      }),
      currentProject: Type.Optional(ProjectInfoSchema, {
        description: '現在選択中のプロジェクト',
      }),
    },
    {
      description: 'プロジェクト一覧データ',
    }
  )
);

/**
 * プロジェクト追加リクエストスキーマ
 * POST /api/projects
 */
export const AddProjectRequestSchema = Type.Object(
  {
    path: AbsolutePathSchema,
  },
  {
    $id: 'AddProjectRequest',
    title: 'プロジェクト追加リクエスト',
    description: '新しいプロジェクトを追加するためのリクエスト',
    additionalProperties: false,
  }
);

/**
 * プロジェクト追加レスポンススキーマ
 * POST /api/projects
 */
export const AddProjectResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      project: ProjectInfoSchema,
      message: Type.String({
        description: '成功メッセージ',
        examples: ['Project added successfully'],
      }),
    },
    {
      description: 'プロジェクト追加結果',
    }
  )
);

/**
 * プロジェクト削除パラメータスキーマ
 * DELETE /api/projects/:id
 */
export const DeleteProjectParamsSchema = Type.Object(
  {
    id: ProjectIdSchema,
  },
  {
    $id: 'DeleteProjectParams',
    title: 'プロジェクト削除パラメータ',
    description: 'プロジェクトを削除するためのパラメータ',
    additionalProperties: false,
  }
);

/**
 * プロジェクト削除レスポンススキーマ
 * DELETE /api/projects/:id
 */
export const DeleteProjectResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      message: Type.String({
        description: '削除成功メッセージ',
        examples: ['Project deleted successfully'],
      }),
    },
    {
      description: 'プロジェクト削除結果',
    }
  )
);

/**
 * プロジェクト選択パラメータスキーマ
 * POST /api/projects/:id/select
 */
export const SelectProjectParamsSchema = Type.Object(
  {
    id: ProjectIdSchema,
  },
  {
    $id: 'SelectProjectParams',
    title: 'プロジェクト選択パラメータ',
    description: 'プロジェクトを選択するためのパラメータ',
    additionalProperties: false,
  }
);

/**
 * プロジェクト選択レスポンススキーマ
 * POST /api/projects/:id/select
 */
export const SelectProjectResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      project: ProjectInfoSchema,
      message: Type.String({
        description: '選択成功メッセージ',
        examples: ['Project selected successfully'],
      }),
    },
    {
      description: 'プロジェクト選択結果',
    }
  )
);

/**
 * パス検証リクエストスキーマ
 * POST /api/projects/validate-path
 */
export const ValidatePathRequestSchema = Type.Object(
  {
    path: Type.String({
      minLength: 1,
      description: '検証するパス',
      examples: ['/Users/user/project', 'C:\\Users\\User\\Project', './relative/path'],
    }),
  },
  {
    $id: 'ValidatePathRequest',
    title: 'パス検証リクエスト',
    description: 'プロジェクトパスを検証するためのリクエスト',
    additionalProperties: false,
  }
);

/**
 * パス検証レスポンススキーマ
 * POST /api/projects/validate-path
 */
export const ValidatePathResponseSchema = ApiResponseSchema(ValidationResultSchema);

/**
 * 現在のプロジェクト取得レスポンススキーマ
 * GET /api/project (単数形)
 */
export const CurrentProjectResponseSchema = ApiResponseSchema(
  Type.Union(
    [
      ProjectResponseSchema,
      Type.Null({
        description: 'プロジェクトが選択されていない場合',
      }),
    ],
    {
      description: '現在のプロジェクト情報',
    }
  )
);

/**
 * プロジェクト詳細取得パラメータスキーマ
 * GET /api/projects/:id
 */
export const ProjectDetailsParamsSchema = Type.Object(
  {
    id: ProjectIdSchema,
  },
  {
    $id: 'ProjectDetailsParams',
    title: 'プロジェクト詳細取得パラメータ',
    description: '特定プロジェクトの詳細情報を取得するためのパラメータ',
    additionalProperties: false,
  }
);

/**
 * プロジェクト詳細レスポンススキーマ
 * GET /api/projects/:id
 */
export const ProjectDetailsResponseSchema = ApiResponseSchema(ProjectInfoSchema);

/**
 * プロジェクト更新リクエストスキーマ
 * PUT /api/projects/:id
 */
export const UpdateProjectRequestSchema = Type.Object(
  {
    name: Type.Optional(
      Type.String({
        minLength: 1,
        description: '更新するプロジェクト名',
      })
    ),
    path: Type.Optional(AbsolutePathSchema),
  },
  {
    $id: 'UpdateProjectRequest',
    title: 'プロジェクト更新リクエスト',
    description: 'プロジェクト情報を更新するためのリクエスト',
    additionalProperties: false,
  }
);

/**
 * プロジェクト更新パラメータスキーマ
 * PUT /api/projects/:id
 */
export const UpdateProjectParamsSchema = Type.Object(
  {
    id: ProjectIdSchema,
  },
  {
    $id: 'UpdateProjectParams',
    title: 'プロジェクト更新パラメータ',
    description: 'プロジェクトを更新するためのパラメータ',
    additionalProperties: false,
  }
);

/**
 * プロジェクト更新レスポンススキーマ
 * PUT /api/projects/:id
 */
export const UpdateProjectResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      project: ProjectInfoSchema,
      message: Type.String({
        description: '更新成功メッセージ',
        examples: ['Project updated successfully'],
      }),
    },
    {
      description: 'プロジェクト更新結果',
    }
  )
);

// Static型の生成
export type ProjectListResponse = Static<typeof ProjectListResponseSchema>;
export type AddProjectRequest = Static<typeof AddProjectRequestSchema>;
export type AddProjectResponse = Static<typeof AddProjectResponseSchema>;
export type DeleteProjectParams = Static<typeof DeleteProjectParamsSchema>;
export type DeleteProjectResponse = Static<typeof DeleteProjectResponseSchema>;
export type SelectProjectParams = Static<typeof SelectProjectParamsSchema>;
export type SelectProjectResponse = Static<typeof SelectProjectResponseSchema>;
export type ValidatePathRequest = Static<typeof ValidatePathRequestSchema>;
export type ValidatePathResponse = Static<typeof ValidatePathResponseSchema>;
export type CurrentProjectResponse = Static<typeof CurrentProjectResponseSchema>;
export type ProjectDetailsParams = Static<typeof ProjectDetailsParamsSchema>;
export type ProjectDetailsResponse = Static<typeof ProjectDetailsResponseSchema>;
export type UpdateProjectRequest = Static<typeof UpdateProjectRequestSchema>;
export type UpdateProjectParams = Static<typeof UpdateProjectParamsSchema>;
export type UpdateProjectResponse = Static<typeof UpdateProjectResponseSchema>;
