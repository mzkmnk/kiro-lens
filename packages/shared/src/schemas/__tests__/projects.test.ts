import { describe, test, expect } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import {
  AddProjectRequestSchema,
  DeleteProjectParamsSchema,
  SelectProjectParamsSchema,
  ValidatePathRequestSchema,
  UpdateProjectRequestSchema,
} from '../api/projects';
import { ProjectInfoSchema, ValidationResultSchema } from '../domain/project';

describe('Projects Schema', () => {
  describe('ProjectInfoSchema', () => {
    test('完全なプロジェクト情報を受け入れる', () => {
      const projectInfo = {
        id: 'project-123',
        name: 'My Project',
        path: '/Users/user/projects/my-project',
        kiroPath: '/Users/user/projects/my-project/.kiro',
        hasKiroDir: true,
        isValid: true,
        addedAt: '2024-01-01T00:00:00.000Z',
        lastAccessedAt: '2024-01-01T12:00:00.000Z',
      };

      expect(Value.Check(ProjectInfoSchema, projectInfo)).toBe(true);
    });

    test('lastAccessedAtなしのプロジェクト情報を受け入れる', () => {
      const projectInfo = {
        id: 'project-123',
        name: 'My Project',
        path: '/Users/user/projects/my-project',
        kiroPath: '/Users/user/projects/my-project/.kiro',
        hasKiroDir: false,
        isValid: false,
        addedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(ProjectInfoSchema, projectInfo)).toBe(true);
    });

    test('空のIDを拒否する', () => {
      const invalidProject = {
        id: '',
        name: 'My Project',
        path: '/Users/user/projects/my-project',
        kiroPath: '/Users/user/projects/my-project/.kiro',
        hasKiroDir: true,
        isValid: true,
        addedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(Value.Check(ProjectInfoSchema, invalidProject)).toBe(false);
    });

    test('無効な日時形式を拒否する', () => {
      const invalidProject = {
        id: 'project-123',
        name: 'My Project',
        path: '/Users/user/projects/my-project',
        kiroPath: '/Users/user/projects/my-project/.kiro',
        hasKiroDir: true,
        isValid: true,
        addedAt: 'invalid-date',
      };

      expect(Value.Check(ProjectInfoSchema, invalidProject)).toBe(false);
    });
  });

  describe('ValidationResultSchema', () => {
    test('成功した検証結果を受け入れる', () => {
      const validResult = {
        isValid: true,
        validatedPath: '/Users/user/projects/valid-project',
      };

      expect(Value.Check(ValidationResultSchema, validResult)).toBe(true);
    });

    test('失敗した検証結果を受け入れる', () => {
      const invalidResult = {
        isValid: false,
        error: 'Directory not found',
      };

      expect(Value.Check(ValidationResultSchema, invalidResult)).toBe(true);
    });

    test('最小限の検証結果を受け入れる', () => {
      const minimalResult = {
        isValid: false,
      };

      expect(Value.Check(ValidationResultSchema, minimalResult)).toBe(true);
    });
  });

  describe('AddProjectRequestSchema', () => {
    test('有効なプロジェクト追加リクエストを受け入れる', () => {
      const request = {
        path: '/Users/user/projects/new-project',
      };

      expect(Value.Check(AddProjectRequestSchema, request)).toBe(true);
    });

    test('Windowsパスを受け入れる', () => {
      const request = {
        path: 'C:\\Users\\User\\Projects\\new-project',
      };

      expect(Value.Check(AddProjectRequestSchema, request)).toBe(true);
    });

    test('空のパスを拒否する', () => {
      const invalidRequest = {
        path: '',
      };

      expect(Value.Check(AddProjectRequestSchema, invalidRequest)).toBe(false);
    });

    test('相対パスを拒否する', () => {
      const invalidRequest = {
        path: './relative/path',
      };

      expect(Value.Check(AddProjectRequestSchema, invalidRequest)).toBe(false);
    });
  });

  describe('DeleteProjectParamsSchema', () => {
    test('有効なプロジェクトIDを受け入れる', () => {
      const params = {
        id: 'project-123',
      };

      expect(Value.Check(DeleteProjectParamsSchema, params)).toBe(true);
    });

    test('空のIDを拒否する', () => {
      const invalidParams = {
        id: '',
      };

      expect(Value.Check(DeleteProjectParamsSchema, invalidParams)).toBe(false);
    });

    test('不正な文字を含むIDを拒否する', () => {
      const invalidParams = {
        id: 'project@123!',
      };

      expect(Value.Check(DeleteProjectParamsSchema, invalidParams)).toBe(false);
    });
  });

  describe('SelectProjectParamsSchema', () => {
    test('有効なプロジェクトIDを受け入れる', () => {
      const params = {
        id: 'project-abc-123',
      };

      expect(Value.Check(SelectProjectParamsSchema, params)).toBe(true);
    });

    test('ハイフンとアンダースコアを含むIDを受け入れる', () => {
      const params = {
        id: 'project_test-123',
      };

      expect(Value.Check(SelectProjectParamsSchema, params)).toBe(true);
    });
  });

  describe('ValidatePathRequestSchema', () => {
    test('有効なパス検証リクエストを受け入れる', () => {
      const request = {
        path: '/Users/user/projects/test-project',
      };

      expect(Value.Check(ValidatePathRequestSchema, request)).toBe(true);
    });

    test('相対パスを受け入れる', () => {
      const request = {
        path: './relative/path',
      };

      expect(Value.Check(ValidatePathRequestSchema, request)).toBe(true);
    });

    test('空のパスを拒否する', () => {
      const invalidRequest = {
        path: '',
      };

      expect(Value.Check(ValidatePathRequestSchema, invalidRequest)).toBe(false);
    });
  });

  describe('UpdateProjectRequestSchema', () => {
    test('名前のみの更新リクエストを受け入れる', () => {
      const request = {
        name: 'Updated Project Name',
      };

      expect(Value.Check(UpdateProjectRequestSchema, request)).toBe(true);
    });

    test('パスのみの更新リクエストを受け入れる', () => {
      const request = {
        path: '/Users/user/projects/updated-project',
      };

      expect(Value.Check(UpdateProjectRequestSchema, request)).toBe(true);
    });

    test('名前とパス両方の更新リクエストを受け入れる', () => {
      const request = {
        name: 'Updated Project',
        path: '/Users/user/projects/updated-project',
      };

      expect(Value.Check(UpdateProjectRequestSchema, request)).toBe(true);
    });

    test('空のリクエストを受け入れる', () => {
      const request = {};

      expect(Value.Check(UpdateProjectRequestSchema, request)).toBe(true);
    });

    test('空の名前を拒否する', () => {
      const invalidRequest = {
        name: '',
      };

      expect(Value.Check(UpdateProjectRequestSchema, invalidRequest)).toBe(false);
    });
  });
});
