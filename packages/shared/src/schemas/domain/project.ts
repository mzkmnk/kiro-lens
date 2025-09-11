import { Type, Static } from '@sinclair/typebox';

/**
 * プロジェクト情報スキーマ
 *
 * 既存のProjectInfo型との互換性を保ちながら、
 * TypeBoxによる実行時バリデーションを提供します。
 */
export const ProjectInfoSchema = Type.Object(
  {
    id: Type.String({
      minLength: 1,
      description: 'プロジェクトの一意識別子',
      examples: ['project-1', 'my-app-2024'],
    }),
    name: Type.String({
      minLength: 1,
      description: 'プロジェクト名（通常はディレクトリ名）',
      examples: ['my-app', 'kiro-lens', 'project-name'],
    }),
    path: Type.String({
      minLength: 1,
      description: 'プロジェクトルートパス',
      examples: ['/Users/user/projects/my-app', '/home/user/workspace/project'],
    }),
    kiroPath: Type.String({
      minLength: 1,
      description: '.kiroディレクトリの絶対パス',
      examples: ['/Users/user/projects/my-app/.kiro', '/home/user/workspace/project/.kiro'],
    }),
    hasKiroDir: Type.Boolean({
      description: '.kiroディレクトリが存在するかどうか',
    }),
    isValid: Type.Boolean({
      description: 'パスが現在も有効かどうか',
    }),
    addedAt: Type.String({
      format: 'date-time',
      description: 'プロジェクト追加日時',
      examples: ['2024-01-01T00:00:00.000Z'],
    }),
    lastAccessedAt: Type.Optional(
      Type.String({
        format: 'date-time',
        description: '最終アクセス日時',
        examples: ['2024-01-01T12:00:00.000Z'],
      })
    ),
  },
  {
    $id: 'ProjectInfo',
    title: 'プロジェクト情報',
    description: 'パス管理システムで管理される各プロジェクトの詳細情報',
    additionalProperties: false,
  }
);

/**
 * プロジェクト情報レスポンススキーマ
 *
 * GET /api/project エンドポイント用の軽量なレスポンス形式
 */
export const ProjectResponseSchema = Type.Object(
  {
    name: Type.String({
      minLength: 1,
      description: 'プロジェクト名',
    }),
    hasKiroDir: Type.Boolean({
      description: '.kiroディレクトリが存在するかどうか',
    }),
    kiroPath: Type.Optional(
      Type.String({
        minLength: 1,
        description: '.kiroディレクトリのパス（存在する場合のみ）',
      })
    ),
  },
  {
    $id: 'ProjectResponse',
    title: 'プロジェクト情報レスポンス',
    description: 'GET /api/project エンドポイントのレスポンス形式',
    additionalProperties: false,
  }
);

/**
 * バリデーション結果スキーマ
 */
export const ValidationResultSchema = Type.Object(
  {
    isValid: Type.Boolean({
      description: '検証が成功したかどうか',
    }),
    error: Type.Optional(
      Type.String({
        description: 'エラーメッセージ（検証失敗時）',
      })
    ),
    validatedPath: Type.Optional(
      Type.String({
        minLength: 1,
        description: '検証されたパス（成功時）',
      })
    ),
  },
  {
    $id: 'ValidationResult',
    title: 'パス検証結果',
    description: 'パス検証の結果を表現する型',
    additionalProperties: false,
  }
);

/**
 * ディレクトリ権限情報スキーマ
 */
export const DirectoryPermissionsSchema = Type.Object(
  {
    readable: Type.Boolean({
      description: '読み取り可能かどうか',
    }),
    writable: Type.Boolean({
      description: '書き込み可能かどうか',
    }),
    executable: Type.Boolean({
      description: '実行可能かどうか',
    }),
  },
  {
    $id: 'DirectoryPermissions',
    title: 'ディレクトリ権限情報',
    description: 'ディレクトリのアクセス権限を表現する型',
    additionalProperties: false,
  }
);

// Static型の生成（既存の型と互換性を保つ）
export type ProjectInfo = Static<typeof ProjectInfoSchema>;
export type ProjectResponse = Static<typeof ProjectResponseSchema>;
export type ValidationResult = Static<typeof ValidationResultSchema>;
export type DirectoryPermissions = Static<typeof DirectoryPermissionsSchema>;
