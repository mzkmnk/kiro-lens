import { Type, Static, TSchema } from '@sinclair/typebox';

/**
 * APIエラータイプスキーマ
 */
export const ApiErrorTypeSchema = Type.Union(
  [
    Type.Literal('VALIDATION_ERROR'),
    Type.Literal('NOT_FOUND'),
    Type.Literal('INTERNAL_ERROR'),
    Type.Literal('PERMISSION_DENIED'),
    Type.Literal('RATE_LIMIT_EXCEEDED'),
  ],
  {
    description: 'APIエラーの種類',
    examples: ['VALIDATION_ERROR', 'NOT_FOUND', 'INTERNAL_ERROR'],
  }
);

/**
 * APIエラースキーマ
 */
export const ApiErrorSchema = Type.Object(
  {
    type: ApiErrorTypeSchema,
    message: Type.String({
      minLength: 1,
      description: 'ユーザー向けエラーメッセージ',
      examples: ['Validation failed', 'Resource not found', 'Internal server error'],
    }),
    details: Type.Optional(
      Type.Any({
        description: 'エラー詳細情報（デバッグ用）',
      })
    ),
    timestamp: Type.String({
      format: 'date-time',
      description: 'エラー発生時刻',
      examples: ['2024-01-01T12:00:00.000Z'],
    }),
  },
  {
    $id: 'ApiError',
    title: 'APIエラー',
    description: 'API呼び出し時に発生するエラーの詳細情報',
    additionalProperties: false,
  }
);

/**
 * API共通レスポンススキーマ
 *
 * すべてのAPIエンドポイントで使用される統一レスポンス形式
 */
export const ApiResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object(
    {
      success: Type.Boolean({
        description: 'API呼び出しが成功したかどうか',
      }),
      data: Type.Optional(dataSchema),
      error: Type.Optional(ApiErrorSchema),
    },
    {
      title: 'API共通レスポンス',
      description: 'すべてのAPIエンドポイントで使用される統一レスポンス形式',
      additionalProperties: false,
    }
  );

/**
 * 成功レスポンススキーマ
 */
export const SuccessResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object(
    {
      success: Type.Literal(true),
      data: dataSchema,
    },
    {
      title: '成功レスポンス',
      description: 'API呼び出し成功時のレスポンス形式',
      additionalProperties: false,
    }
  );

/**
 * エラーレスポンススキーマ
 */
export const ErrorResponseSchema = Type.Object(
  {
    success: Type.Literal(false),
    error: ApiErrorSchema,
  },
  {
    title: 'エラーレスポンス',
    description: 'API呼び出し失敗時のレスポンス形式',
    additionalProperties: false,
  }
);

/**
 * 結果型スキーマ（Success/Error）
 */
export const ResultSchema = <T extends TSchema, E extends TSchema>(
  successSchema: T,
  errorSchema: E
) =>
  Type.Union(
    [
      Type.Object({
        success: Type.Literal(true),
        data: successSchema,
      }),
      Type.Object({
        success: Type.Literal(false),
        error: errorSchema,
      }),
    ],
    {
      title: '結果型',
      description: 'API呼び出しの結果を表現する型（Success/Error）',
    }
  );

/**
 * 空のレスポンススキーマ
 *
 * データを返さないAPIエンドポイント用
 */
export const EmptyResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
  },
  {
    title: '空のレスポンス',
    description: 'データを返さないAPIエンドポイント用のレスポンス',
    additionalProperties: false,
  }
);

/**
 * ページネーション情報スキーマ
 */
export const PaginationSchema = Type.Object(
  {
    page: Type.Number({
      minimum: 1,
      description: '現在のページ番号',
      examples: [1, 2, 3],
    }),
    limit: Type.Number({
      minimum: 1,
      maximum: 100,
      description: '1ページあたりのアイテム数',
      examples: [10, 20, 50],
    }),
    total: Type.Number({
      minimum: 0,
      description: '総アイテム数',
      examples: [0, 25, 100],
    }),
    totalPages: Type.Number({
      minimum: 0,
      description: '総ページ数',
      examples: [0, 3, 10],
    }),
  },
  {
    $id: 'Pagination',
    title: 'ページネーション情報',
    description: 'ページネーション対応APIのメタデータ',
    additionalProperties: false,
  }
);

/**
 * ページネーション対応レスポンススキーマ
 */
export const PaginatedResponseSchema = <T extends TSchema>(itemSchema: T) =>
  Type.Object(
    {
      success: Type.Literal(true),
      data: Type.Array(itemSchema),
      pagination: PaginationSchema,
    },
    {
      title: 'ページネーション対応レスポンス',
      description: 'ページネーション対応APIのレスポンス形式',
      additionalProperties: false,
    }
  );

// Static型の生成
export type ApiErrorType = Static<typeof ApiErrorTypeSchema>;
export type ApiError = Static<typeof ApiErrorSchema>;
export type ApiResponse<T> = Static<ReturnType<typeof ApiResponseSchema>>;
export type SuccessResponse<T> = Static<ReturnType<typeof SuccessResponseSchema>>;
export type ErrorResponse = Static<typeof ErrorResponseSchema>;
export type Result<T, E> = Static<ReturnType<typeof ResultSchema>>;
export type EmptyResponse = Static<typeof EmptyResponseSchema>;
export type Pagination = Static<typeof PaginationSchema>;
export type PaginatedResponse<T> = Static<ReturnType<typeof PaginatedResponseSchema>>;

/**
 * 型ガード関数: APIレスポンスが成功かどうかを判定
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

/**
 * 型ガード関数: APIレスポンスがエラーかどうかを判定
 */
export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: false; error: ApiError } {
  return response.success === false && response.error !== undefined;
}
