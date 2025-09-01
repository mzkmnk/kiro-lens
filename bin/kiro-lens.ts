#!/usr/bin/env node

import { Command } from 'commander';
import type { CLIOptions } from '../packages/shared/src/types/port.js';

/**
 * Commander.jsプログラムを作成する
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('kiro-lens')
    .description('Kiro IDE .kiro directory browser and editor')
    .version('1.0.0')
    .option('-p, --port <number>', 'Frontend port (backend will be port+1)')
    .option('-f, --frontend-port <number>', 'Frontend port')
    .option('-b, --backend-port <number>', 'Backend port')
    .option('--no-open', "Don't open browser automatically")
    .option('-v, --verbose', 'Verbose logging')
    .action(async (options: CLIOptions) => {
      await startKiroLens(options);
    });

  return program;
}

/**
 * kiro-lensを起動する
 */
export async function startKiroLens(options: CLIOptions): Promise<void> {
  // TODO: 実装予定 - 現在は基本構造のみ
  console.log('kiro-lens starting with options:', options);
}

// CLIとして実行された場合のエントリーポイント
if (import.meta.url === `file://${process.argv[1]}`) {
  const program = createProgram();
  program.parse();
}