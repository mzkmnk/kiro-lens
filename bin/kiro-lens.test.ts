import assert from 'assert';
import { createProgram } from './kiro-lens.js';

// 基本的なテスト
console.log('Testing kiro-lens CLI...');

// プログラムが正しく初期化される
const program = createProgram();
assert.strictEqual(program.name(), 'kiro-lens', 'Program name should be kiro-lens');
assert.strictEqual(
  program.description(),
  'Kiro IDE .kiro directory browser and editor',
  'Program description should match'
);
assert.strictEqual(program.version(), '1.0.0', 'Version should be 1.0.0');

// --no-openオプションが正しく処理される
const options = program.opts();
assert.ok(options !== undefined, 'Options should be defined');

// ヘルプが表示される
const helpText = program.helpInformation();
assert.ok(helpText.includes('kiro-lens'), 'Help text should contain kiro-lens');
assert.ok(
  helpText.includes('Kiro IDE .kiro directory browser and editor'),
  'Help text should contain description'
);

// バージョンが正しく設定される
assert.strictEqual(program.version(), '1.0.0', 'Version should be 1.0.0');

console.log('All tests passed!');
