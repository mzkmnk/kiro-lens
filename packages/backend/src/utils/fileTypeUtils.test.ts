import { describe, test, expect } from 'vitest';
import {
  isTextFileByExtension,
  isTextFileByContent,
  isTextFile,
  getSupportedTextExtensions,
} from './fileTypeUtils';

describe('fileTypeUtils', () => {
  describe('isTextFileByExtension', () => {
    test('一般的なテキストファイル拡張子を正しく判定', () => {
      const textFiles = [
        'README.md',
        'config.json',
        'style.css',
        'script.js',
        'document.txt',
        'data.csv',
        'notes.yaml',
      ];

      for (const file of textFiles) {
        expect(isTextFileByExtension(file)).toBe(true);
      }
    });

    test('バイナリファイル拡張子を正しく判定', () => {
      const binaryFiles = [
        'image.jpg',
        'document.pdf',
        'archive.zip',
        'executable.exe',
        'library.dll',
        'video.mp4',
      ];

      for (const file of binaryFiles) {
        expect(isTextFileByExtension(file)).toBe(false);
      }
    });

    test('拡張子がないファイルの判定', () => {
      expect(isTextFileByExtension('Dockerfile')).toBe(true);
      expect(isTextFileByExtension('Makefile')).toBe(true);
      expect(isTextFileByExtension('.gitignore')).toBe(true);
      expect(isTextFileByExtension('.env')).toBe(true);
      expect(isTextFileByExtension('unknown_file')).toBe(false);
    });
  });

  describe('isTextFileByContent', () => {
    test('テキスト内容を正しく判定', () => {
      const textContents = [
        Buffer.from('Hello, World!', 'utf-8'),
        Buffer.from('{"key": "value"}', 'utf-8'),
        Buffer.from('# Markdown\n\nContent here', 'utf-8'),
        Buffer.from('', 'utf-8'), // 空ファイル
        Buffer.from('日本語のテキスト', 'utf-8'),
      ];

      for (const content of textContents) {
        expect(isTextFileByContent(content)).toBe(true);
      }
    });

    test('バイナリ内容を正しく判定', () => {
      // Null byteを含むバイナリデータ
      const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
      expect(isTextFileByContent(binaryContent)).toBe(false);

      // 多くの制御文字を含むデータ
      const controlChars = Buffer.from(Array.from({ length: 100 }, (_, i) => i % 32));
      expect(isTextFileByContent(controlChars)).toBe(false);
    });

    test('制御文字の割合による判定', () => {
      // 少量の制御文字を含むテキスト（許容範囲内）
      const mixedContent = Buffer.concat([
        Buffer.from('Normal text content '),
        Buffer.from([0x01, 0x02]), // 制御文字
        Buffer.from(' more normal text'),
      ]);
      expect(isTextFileByContent(mixedContent)).toBe(true);
    });
  });

  describe('isTextFile', () => {
    test('拡張子と内容の両方でテキストファイルを判定', () => {
      const textContent = Buffer.from('# Markdown content', 'utf-8');
      expect(isTextFile('README.md', textContent)).toBe(true);
    });

    test('拡張子はテキストだが内容がバイナリの場合', () => {
      const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]);
      expect(isTextFile('fake.txt', binaryContent)).toBe(false);
    });

    test('拡張子は不明だが内容がテキストの場合', () => {
      const textContent = Buffer.from('Plain text content', 'utf-8');
      expect(isTextFile('unknown_file', textContent)).toBe(true);
    });

    test('拡張子も内容もバイナリの場合', () => {
      const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]);
      expect(isTextFile('image.png', binaryContent)).toBe(false);
    });
  });

  describe('getSupportedTextExtensions', () => {
    test('サポートされている拡張子の一覧を取得', () => {
      const extensions = getSupportedTextExtensions();

      expect(Array.isArray(extensions)).toBe(true);
      expect(extensions.length).toBeGreaterThan(0);
      expect(extensions).toContain('.md');
      expect(extensions).toContain('.json');
      expect(extensions).toContain('.js');
      expect(extensions).toContain('.txt');

      // ソートされていることを確認
      const sorted = [...extensions].sort();
      expect(extensions).toEqual(sorted);
    });
  });
});
