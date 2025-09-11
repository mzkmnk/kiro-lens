import { Type, Static } from '@sinclair/typebox';

/**
 * ファイルアイテムスキーマ（再帰的定義）
 *
 * 既存のFileItem型との互換性を保ちながら、
 * TypeBoxによる実行時バリデーションを提供します。
 */
export const FileItemSchema = Type.Recursive(This =>
  Type.Object(
    {
      id: Type.String({
        minLength: 1,
        description: 'ファイル/ディレクトリの一意識別子',
        examples: ['file-1', 'folder-2'],
      }),
      name: Type.String({
        minLength: 1,
        description: 'ファイル/ディレクトリ名',
        examples: ['README.md', 'src', 'package.json'],
      }),
      type: Type.Union([Type.Literal('file'), Type.Literal('folder')], {
        description: 'アイテムの種類',
        examples: ['file', 'folder'],
      }),
      children: Type.Optional(
        Type.Array(This, {
          description: '子アイテム（フォルダの場合のみ）',
        })
      ),
    },
    {
      $id: 'FileItem',
      title: 'ファイルアイテム',
      description: 'ファイルツリーの個別アイテム（既存のFileItem型と互換性あり）',
      additionalProperties: false,
    }
  )
);

/**
 * ファイルツリーレスポンススキーマ
 * ルートレベルのファイルアイテム配列
 */
export const FileTreeSchema = Type.Array(FileItemSchema, {
  title: 'ファイルツリー',
  description: 'ファイルツリーのルートレベルアイテム配列',
  minItems: 0,
});

// Static型の生成（既存の型と互換性を保つ）
export type FileItem = Static<typeof FileItemSchema>;
export type FileTree = Static<typeof FileTreeSchema>;
