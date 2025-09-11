import { describe, test, expect } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import {
  ProjectFilesParamsSchema,
  FileTreeResponseSchema,
  FileContentSchema,
  CreateFileRequestSchema,
  UpdateFileRequestSchema,
} from '../api/files';
import { FileItemSchema } from '../domain/file-tree';

describe('Files Schema', () => {
  describe('ProjectFilesParamsSchema', () => {
    test('有効なパラメータを受け入れる', () => {
      const validParams = { id: 'project-123' };
      expect(Value.Check(ProjectFilesParamsSchema, validParams)).toBe(true);
    });

    test('無効なパラメータを拒否する', () => {
      const invalidParams = { id: '' };
      expect(Value.Check(ProjectFilesParamsSchema, invalidParams)).toBe(false);
    });

    test('不正な形式のIDを拒否する', () => {
      const invalidParams = { id: 'invalid@id!' };
      expect(Value.Check(ProjectFilesParamsSchema, invalidParams)).toBe(false);
    });
  });

  describe('FileItemSchema', () => {
    test('基本的なファイルアイテムを受け入れる', () => {
      const fileItem = {
        id: 'file-1',
        name: 'README.md',
        type: 'file',
      };

      expect(Value.Check(FileItemSchema, fileItem)).toBe(true);
    });

    test('フォルダアイテムを受け入れる', () => {
      const folderItem = {
        id: 'folder-1',
        name: 'src',
        type: 'folder',
        children: [],
      };

      expect(Value.Check(FileItemSchema, folderItem)).toBe(true);
    });

    test('再帰的構造を正しく処理する', () => {
      const fileTree = {
        id: 'root',
        name: 'project',
        type: 'folder',
        children: [
          {
            id: 'src',
            name: 'src',
            type: 'folder',
            children: [
              {
                id: 'app-ts',
                name: 'app.ts',
                type: 'file',
              },
            ],
          },
          {
            id: 'readme',
            name: 'README.md',
            type: 'file',
          },
        ],
      };

      expect(Value.Check(FileItemSchema, fileTree)).toBe(true);
    });

    test('無効なタイプを拒否する', () => {
      const invalidItem = {
        id: 'item-1',
        name: 'test',
        type: 'invalid-type',
      };

      expect(Value.Check(FileItemSchema, invalidItem)).toBe(false);
    });

    test('空の名前を拒否する', () => {
      const invalidItem = {
        id: 'item-1',
        name: '',
        type: 'file',
      };

      expect(Value.Check(FileItemSchema, invalidItem)).toBe(false);
    });
  });

  describe('FileContentSchema', () => {
    test('基本的なファイル内容を受け入れる', () => {
      const fileContent = {
        content: 'Hello, World!',
        encoding: 'utf8',
        size: 13,
        lastModified: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(FileContentSchema, fileContent)).toBe(true);
    });

    test('MIMEタイプ付きファイル内容を受け入れる', () => {
      const fileContent = {
        content: 'console.log("Hello");',
        encoding: 'utf8',
        mimeType: 'application/javascript',
        size: 21,
        lastModified: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(FileContentSchema, fileContent)).toBe(true);
    });

    test('無効なエンコーディングを拒否する', () => {
      const invalidContent = {
        content: 'test',
        encoding: 'invalid-encoding',
        size: 4,
        lastModified: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(FileContentSchema, invalidContent)).toBe(false);
    });

    test('負のサイズを拒否する', () => {
      const invalidContent = {
        content: 'test',
        encoding: 'utf8',
        size: -1,
        lastModified: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(FileContentSchema, invalidContent)).toBe(false);
    });
  });

  describe('CreateFileRequestSchema', () => {
    test('基本的なファイル作成リクエストを受け入れる', () => {
      const request = {
        path: 'new-file.txt',
        content: 'Hello, World!',
      };

      expect(Value.Check(CreateFileRequestSchema, request)).toBe(true);
    });

    test('エンコーディング指定付きリクエストを受け入れる', () => {
      const request = {
        path: 'binary-file.bin',
        content: 'SGVsbG8gV29ybGQ=',
        encoding: 'base64',
      };

      expect(Value.Check(CreateFileRequestSchema, request)).toBe(true);
    });

    test('空のパスを拒否する', () => {
      const invalidRequest = {
        path: '',
        content: 'test',
      };

      expect(Value.Check(CreateFileRequestSchema, invalidRequest)).toBe(false);
    });
  });

  describe('UpdateFileRequestSchema', () => {
    test('基本的なファイル更新リクエストを受け入れる', () => {
      const request = {
        content: 'Updated content',
      };

      expect(Value.Check(UpdateFileRequestSchema, request)).toBe(true);
    });

    test('エンコーディング指定付きリクエストを受け入れる', () => {
      const request = {
        content: 'VXBkYXRlZCBjb250ZW50',
        encoding: 'base64',
      };

      expect(Value.Check(UpdateFileRequestSchema, request)).toBe(true);
    });

    test('無効なエンコーディングを拒否する', () => {
      const invalidRequest = {
        content: 'test',
        encoding: 'invalid',
      };

      expect(Value.Check(UpdateFileRequestSchema, invalidRequest)).toBe(false);
    });
  });
});
