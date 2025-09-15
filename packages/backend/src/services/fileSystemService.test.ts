import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  resolvePath,
  checkDirectoryExists,
  checkKiroDirectory,
  checkDirectoryPermissions,
  getPathSuggestions,
} from './fileSystemService';
import { MOCK_DIRECTORY_PERMISSIONS, MOCK_PATHS } from '../test/constants';
import { FileSystemError } from '@kiro-lens/shared';

describe('fileSystemService', () => {
  let tempDir: string;

  beforeEach(async () => {
    // テスト用の一時ディレクトリを作成
    tempDir = join(tmpdir(), `kiro-lens-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // クリーンアップエラーは無視
    }
  });

  describe('resolvePath', () => {
    test('絶対パスはそのまま返す', () => {
      const result = resolvePath(MOCK_PATHS.VALID_ABSOLUTE);

      expect(result).toBe(MOCK_PATHS.VALID_ABSOLUTE);
    });

    test('絶対パスでない場合はエラーを投げる', () => {
      expect(() => resolvePath(MOCK_PATHS.INVALID_RELATIVE)).toThrow(FileSystemError);
      expect(() => resolvePath(MOCK_PATHS.INVALID_TILDE)).toThrow(FileSystemError);
      expect(() => resolvePath('relative/path')).toThrow(FileSystemError);
    });

    test('空文字列の場合はエラーを投げる', () => {
      expect(() => resolvePath('')).toThrow(FileSystemError);
      expect(() => resolvePath('   ')).toThrow(FileSystemError);
    });
  });

  describe('checkDirectoryExists', () => {
    test('存在するディレクトリの場合はtrueを返す', async () => {
      const result = await checkDirectoryExists(tempDir);

      expect(result).toBe(true);
    });

    test('存在しないディレクトリの場合はfalseを返す', async () => {
      const nonExistentDir = join(tempDir, 'non-existent');
      const result = await checkDirectoryExists(nonExistentDir);

      expect(result).toBe(false);
    });

    test('ファイルの場合はfalseを返す', async () => {
      const filePath = join(tempDir, 'test-file.txt');
      await fs.writeFile(filePath, 'test content');

      const result = await checkDirectoryExists(filePath);

      expect(result).toBe(false);
    });
  });

  describe('checkKiroDirectory', () => {
    test('.kiroディレクトリが存在する場合はtrueを返す', async () => {
      const kiroDir = join(tempDir, '.kiro');
      await fs.mkdir(kiroDir);

      const result = await checkKiroDirectory(tempDir);

      expect(result).toBe(true);
    });

    test('.kiroディレクトリが存在しない場合はfalseを返す', async () => {
      const result = await checkKiroDirectory(tempDir);

      expect(result).toBe(false);
    });

    test('.kiroがファイルの場合はfalseを返す', async () => {
      const kiroFile = join(tempDir, '.kiro');
      await fs.writeFile(kiroFile, 'not a directory');

      const result = await checkKiroDirectory(tempDir);

      expect(result).toBe(false);
    });

    test('親ディレクトリが存在しない場合はfalseを返す', async () => {
      const nonExistentDir = join(tempDir, 'non-existent');
      const result = await checkKiroDirectory(nonExistentDir);

      expect(result).toBe(false);
    });
  });

  describe('checkDirectoryPermissions', () => {
    test('読み書き可能なディレクトリの場合は適切な権限情報を返す', async () => {
      const result = await checkDirectoryPermissions(tempDir);

      expect(result).toEqual(MOCK_DIRECTORY_PERMISSIONS.FULL_ACCESS);
    });

    test('存在しないディレクトリの場合はエラーを投げる', async () => {
      const nonExistentDir = join(tempDir, 'non-existent');

      await expect(checkDirectoryPermissions(nonExistentDir)).rejects.toThrow(FileSystemError);
    });
  });

  describe('getPathSuggestions', () => {
    test('部分パスに基づいて候補を返す', async () => {
      // テスト用のディレクトリ構造を作成
      const testDirs = ['test-dir-1', 'test-dir-2', 'other-dir'];
      await Promise.all(testDirs.map(dir => fs.mkdir(join(tempDir, dir))));

      const partialPath = join(tempDir, 'test');
      const result = await getPathSuggestions(partialPath);

      expect(result).toHaveLength(2);
      expect(result).toContain(join(tempDir, 'test-dir-1'));
      expect(result).toContain(join(tempDir, 'test-dir-2'));
      expect(result).not.toContain(join(tempDir, 'other-dir'));
    });

    test('マッチする候補がない場合は空配列を返す', async () => {
      const partialPath = join(tempDir, 'no-match');
      const result = await getPathSuggestions(partialPath);

      expect(result).toEqual([]);
    });

    test('存在しない親ディレクトリの場合は空配列を返す', async () => {
      const partialPath = join(tempDir, 'non-existent', 'test');
      const result = await getPathSuggestions(partialPath);

      expect(result).toEqual([]);
    });
  });
});
