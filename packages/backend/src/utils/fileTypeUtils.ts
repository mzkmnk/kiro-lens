import path from 'path';

/**
 * テキストファイルの拡張子リスト
 */
const TEXT_FILE_EXTENSIONS = new Set([
  // マークダウン
  '.md',
  '.markdown',
  '.mdown',
  '.mkd',
  '.mkdn',

  // テキスト
  '.txt',
  '.text',

  // 設定ファイル
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.ini',
  '.cfg',
  '.conf',

  // プログラミング言語
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.rb',
  '.php',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.go',
  '.rs',
  '.swift',
  '.kt',
  '.scala',
  '.clj',
  '.hs',
  '.ml',
  '.fs',
  '.vb',

  // ウェブ技術
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.xml',
  '.svg',

  // シェルスクリプト
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.ps1',
  '.bat',
  '.cmd',

  // データ形式
  '.csv',
  '.tsv',
  '.log',

  // ドキュメント
  '.rst',
  '.adoc',
  '.tex',

  // その他
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  '.env',

  // 拡張子なしファイル
  '.gitignore',
  '.env',
]);

/**
 * 拡張子なしのテキストファイル名リスト
 */
const TEXT_FILE_NAMES = new Set([
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  '.env',
  'dockerfile',
  'makefile',
  'readme',
  'license',
  'changelog',
]);

/**
 * ファイル拡張子によるテキストファイル判定
 *
 * @param filePath ファイルパス
 * @returns テキストファイルかどうか
 */
export function isTextFileByExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();

  // 拡張子がない場合は、ファイル名全体をチェック
  if (!ext) {
    const fileName = path.basename(filePath).toLowerCase();
    return TEXT_FILE_NAMES.has(fileName);
  }

  return TEXT_FILE_EXTENSIONS.has(ext);
}

/**
 * ファイル内容によるテキストファイル判定（簡易版）
 * バイナリファイルの検出を行う
 *
 * @param content ファイル内容（Buffer）
 * @returns テキストファイルかどうか
 */
export function isTextFileByContent(content: Buffer): boolean {
  // 空ファイルはテキストファイルとして扱う
  if (content.length === 0) {
    return true;
  }

  // 最初の1024バイトをチェック
  const sampleSize = Math.min(content.length, 1024);
  const sample = content.subarray(0, sampleSize);

  // Null byte（0x00）が含まれている場合はバイナリファイル
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 0) {
      return false;
    }
  }

  // 制御文字の割合をチェック
  let controlCharCount = 0;
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    // 制御文字（0x00-0x08, 0x0E-0x1F, 0x7F）をカウント
    // ただし、改行（0x0A）、復帰（0x0D）、タブ（0x09）は除外
    if ((byte >= 0x00 && byte <= 0x08) || (byte >= 0x0e && byte <= 0x1f) || byte === 0x7f) {
      controlCharCount++;
    }
  }

  // 制御文字の割合が30%を超える場合はバイナリファイル
  const controlCharRatio = controlCharCount / sample.length;
  return controlCharRatio <= 0.3;
}

/**
 * 包括的なテキストファイル判定
 * 拡張子とファイル内容の両方をチェック
 *
 * @param filePath ファイルパス
 * @param content ファイル内容（Buffer）
 * @returns テキストファイルかどうか
 */
export function isTextFile(filePath: string, content: Buffer): boolean {
  // まず拡張子でチェック
  const isTextByExtension = isTextFileByExtension(filePath);

  // 拡張子でテキストファイルと判定された場合は、内容もチェック
  if (isTextByExtension) {
    return isTextFileByContent(content);
  }

  // 拡張子でテキストファイルでないと判定された場合でも、
  // 内容がテキストの可能性があるのでチェック
  return isTextFileByContent(content);
}

/**
 * サポートされているテキストファイル拡張子の一覧を取得
 *
 * @returns サポートされている拡張子の配列
 */
export function getSupportedTextExtensions(): string[] {
  return Array.from(TEXT_FILE_EXTENSIONS).sort();
}
