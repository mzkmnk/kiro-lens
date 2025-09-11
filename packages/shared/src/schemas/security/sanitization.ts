import { Type, Static } from '@sinclair/typebox';

/**
 * セキュアな文字列スキーマ
 *
 * 英数字、ハイフン、アンダースコアのみを許可する安全な文字列
 */
export const SecureStringSchema = Type.String({
  pattern: '^[a-zA-Z0-9_-]+$',
  minLength: 1,
  maxLength: 100,
  description: 'セキュアな文字列（英数字、ハイフン、アンダースコアのみ）',
  examples: ['project-name', 'file_name', 'user123'],
});

/**
 * セキュアなファイルパススキーマ
 *
 * パストラバーサル攻撃を防ぐための安全なファイルパス
 */
export const SafePathSchema = Type.String({
  pattern: '^[a-zA-Z0-9/_.-]+$',
  minLength: 1,
  maxLength: 500,
  description: 'セキュアなファイルパス（パストラバーサル攻撃を防ぐ）',
  examples: ['/home/user/project', './src/components', '../docs/README.md'],
});

/**
 * プロジェクトIDスキーマ
 *
 * プロジェクト識別子として使用される安全な文字列
 */
export const ProjectIdSchema = Type.String({
  pattern: '^[a-zA-Z0-9_-]{1,50}$',
  description: 'プロジェクト識別子（英数字、ハイフン、アンダースコア、最大50文字）',
  examples: ['project-1', 'my_app_2024', 'kiro-lens'],
});

/**
 * UUIDスキーマ
 *
 * UUID v4形式の文字列
 */
export const UuidSchema = Type.String({
  pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  description: 'UUID v4形式の文字列',
  examples: ['550e8400-e29b-41d4-a716-446655440000'],
});

/**
 * ファイル名スキーマ
 *
 * 安全なファイル名（特殊文字を制限）
 */
export const SafeFilenameSchema = Type.String({
  pattern: '^[a-zA-Z0-9._-]+$',
  minLength: 1,
  maxLength: 255,
  description: '安全なファイル名（特殊文字を制限）',
  examples: ['README.md', 'package.json', 'app.component.ts'],
});

/**
 * ディレクトリ名スキーマ
 *
 * 安全なディレクトリ名
 */
export const SafeDirectoryNameSchema = Type.String({
  pattern: '^[a-zA-Z0-9._-]+$',
  minLength: 1,
  maxLength: 255,
  description: '安全なディレクトリ名',
  examples: ['src', 'components', 'test-utils'],
});

/**
 * 絶対パススキーマ
 *
 * Unix/Windows両対応の絶対パス
 */
export const AbsolutePathSchema = Type.String({
  pattern: '^(/[^/\\0]+)+/?$|^[A-Za-z]:\\\\[^\\\\\\0]+(?:\\\\[^\\\\\\0]+)*\\\\?$',
  minLength: 1,
  maxLength: 1000,
  description: '絶対パス（Unix/Windows両対応）',
  examples: ['/home/user/project', 'C:\\Users\\User\\Project'],
});

// Static型の生成
export type SecureString = Static<typeof SecureStringSchema>;
export type SafePath = Static<typeof SafePathSchema>;
export type ProjectId = Static<typeof ProjectIdSchema>;
export type Uuid = Static<typeof UuidSchema>;
export type SafeFilename = Static<typeof SafeFilenameSchema>;
export type SafeDirectoryName = Static<typeof SafeDirectoryNameSchema>;
export type AbsolutePath = Static<typeof AbsolutePathSchema>;
