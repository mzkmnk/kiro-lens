import { Type, Static } from '@sinclair/typebox';
import { ApiResponseSchema } from './common';
import { FileItemSchema, FileTreeSchema } from '../domain/file-tree';
import { ProjectIdSchema } from '../security/sanitization';

/**
 * プロジェクトファイル取得APIのパラメータスキーマ
 * GET /api/projects/:id/files
 */
export const ProjectFilesParamsSchema = Type.Object(
  {
    id: ProjectIdSchema,
  },
  {
    $id: 'ProjectFilesParams',
    title: 'プロジェクトファイル取得パラメータ',
    description: 'プロジェクトのファイルツリーを取得するためのパラメータ',
    additionalProperties: false,
  }
);

/**
 * ファイルツリーレスポンススキーマ
 * GET /api/projects/:id/files のレスポンス
 */
export const FileTreeResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      files: FileTreeSchema,
    },
    {
      description: 'ファイルツリーデータ',
    }
  )
);

/**
 * ファイル内容取得パラメータスキーマ
 * GET /api/projects/:id/files/:path
 */
export const FileContentParamsSchema = Type.Object(
  {
    id: ProjectIdSchema,
    path: Type.String({
      minLength: 1,
      description: 'ファイルの相対パス',
      examples: ['README.md', 'src/components/App.tsx', 'docs/api.md'],
    }),
  },
  {
    $id: 'FileContentParams',
    title: 'ファイル内容取得パラメータ',
    description: 'プロジェクト内の特定ファイルの内容を取得するためのパラメータ',
    additionalProperties: false,
  }
);

/**
 * ファイル内容スキーマ
 */
export const FileContentSchema = Type.Object(
  {
    content: Type.String({
      description: 'ファイルの内容',
    }),
    encoding: Type.Union([Type.Literal('utf8'), Type.Literal('base64'), Type.Literal('binary')], {
      description: 'ファイルのエンコーディング',
      default: 'utf8',
    }),
    mimeType: Type.Optional(
      Type.String({
        description: 'ファイルのMIMEタイプ',
        examples: ['text/plain', 'application/json', 'text/markdown'],
      })
    ),
    size: Type.Number({
      minimum: 0,
      description: 'ファイルサイズ（バイト）',
    }),
    lastModified: Type.String({
      format: 'date-time',
      description: '最終更新日時',
    }),
  },
  {
    $id: 'FileContent',
    title: 'ファイル内容',
    description: 'ファイルの内容と関連メタデータ',
    additionalProperties: false,
  }
);

/**
 * ファイル内容レスポンススキーマ
 * GET /api/projects/:id/files/:path のレスポンス
 */
export const FileContentResponseSchema = ApiResponseSchema(FileContentSchema);

/**
 * ファイル更新リクエストスキーマ
 * PUT /api/projects/:id/files/:path
 */
export const UpdateFileRequestSchema = Type.Object(
  {
    content: Type.String({
      description: '更新するファイルの内容',
    }),
    encoding: Type.Optional(
      Type.Union([Type.Literal('utf8'), Type.Literal('base64')], {
        description: 'ファイルのエンコーディング',
        default: 'utf8',
      })
    ),
  },
  {
    $id: 'UpdateFileRequest',
    title: 'ファイル更新リクエスト',
    description: 'ファイル内容を更新するためのリクエスト',
    additionalProperties: false,
  }
);

/**
 * ファイル更新レスポンススキーマ
 * PUT /api/projects/:id/files/:path のレスポンス
 */
export const UpdateFileResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      message: Type.String({
        description: '更新成功メッセージ',
        examples: ['File updated successfully'],
      }),
      lastModified: Type.String({
        format: 'date-time',
        description: '更新後の最終更新日時',
      }),
    },
    {
      description: 'ファイル更新結果',
    }
  )
);

/**
 * ファイル作成リクエストスキーマ
 * POST /api/projects/:id/files
 */
export const CreateFileRequestSchema = Type.Object(
  {
    path: Type.String({
      minLength: 1,
      description: '作成するファイルの相対パス',
      examples: ['new-file.md', 'src/components/NewComponent.tsx'],
    }),
    content: Type.String({
      description: 'ファイルの初期内容',
      default: '',
    }),
    encoding: Type.Optional(
      Type.Union([Type.Literal('utf8'), Type.Literal('base64')], {
        description: 'ファイルのエンコーディング',
        default: 'utf8',
      })
    ),
  },
  {
    $id: 'CreateFileRequest',
    title: 'ファイル作成リクエスト',
    description: '新しいファイルを作成するためのリクエスト',
    additionalProperties: false,
  }
);

/**
 * ファイル作成レスポンススキーマ
 * POST /api/projects/:id/files のレスポンス
 */
export const CreateFileResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      message: Type.String({
        description: '作成成功メッセージ',
        examples: ['File created successfully'],
      }),
      file: FileItemSchema,
    },
    {
      description: 'ファイル作成結果',
    }
  )
);

/**
 * ファイル削除パラメータスキーマ
 * DELETE /api/projects/:id/files/:path
 */
export const DeleteFileParamsSchema = Type.Object(
  {
    id: ProjectIdSchema,
    path: Type.String({
      minLength: 1,
      description: '削除するファイルの相対パス',
      examples: ['old-file.md', 'src/components/OldComponent.tsx'],
    }),
  },
  {
    $id: 'DeleteFileParams',
    title: 'ファイル削除パラメータ',
    description: 'ファイルを削除するためのパラメータ',
    additionalProperties: false,
  }
);

/**
 * ファイル削除レスポンススキーマ
 * DELETE /api/projects/:id/files/:path のレスポンス
 */
export const DeleteFileResponseSchema = ApiResponseSchema(
  Type.Object(
    {
      message: Type.String({
        description: '削除成功メッセージ',
        examples: ['File deleted successfully'],
      }),
    },
    {
      description: 'ファイル削除結果',
    }
  )
);

// Static型の生成
export type ProjectFilesParams = Static<typeof ProjectFilesParamsSchema>;
export type FileTreeResponse = Static<typeof FileTreeResponseSchema>;
export type FileContentParams = Static<typeof FileContentParamsSchema>;
export type FileContent = Static<typeof FileContentSchema>;
export type FileContentResponse = Static<typeof FileContentResponseSchema>;
export type UpdateFileRequest = Static<typeof UpdateFileRequestSchema>;
export type UpdateFileResponse = Static<typeof UpdateFileResponseSchema>;
export type CreateFileRequest = Static<typeof CreateFileRequestSchema>;
export type CreateFileResponse = Static<typeof CreateFileResponseSchema>;
export type DeleteFileParams = Static<typeof DeleteFileParamsSchema>;
export type DeleteFileResponse = Static<typeof DeleteFileResponseSchema>;
