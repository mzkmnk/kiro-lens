#!/usr/bin/env node

import { Command } from 'commander';
import type { CLIOptions } from '../packages/shared/src/types/port.js';
import {
  createPortConfiguration,
  validatePortConfiguration,
  isValidPortNumber,
} from '../packages/shared/src/utils/portUtils.js';

/**
 * ポート番号をバリデーションする
 */
function validatePortOption(value: string, optionName: string): number {
  const port = parseInt(value, 10);

  if (isNaN(port)) {
    throw new Error(`${optionName} must be a number`);
  }

  if (port < 0) {
    throw new Error('Port must be a positive number');
  }

  if (!isValidPortNumber(port)) {
    throw new Error('Port must be between 1 and 65535');
  }

  return port;
}

/**
 * Commander.jsプログラムを作成する
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('kiro-lens')
    .description('Kiro IDE .kiro directory browser and editor')
    .version('1.0.0')
    .option('-p, --port <number>', 'Frontend port (backend will be port+1)', value =>
      validatePortOption(value, 'Port')
    )
    .option('-f, --frontend-port <number>', 'Frontend port', value =>
      validatePortOption(value, 'Frontend port')
    )
    .option('-b, --backend-port <number>', 'Backend port', value =>
      validatePortOption(value, 'Backend port')
    )
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
  // CLIオプションからポート設定を作成
  const portConfig = createPortConfiguration(options);

  // ポート設定をバリデーション
  const validationResult = validatePortConfiguration(portConfig);

  if (!validationResult.isValid) {
    const errorMessage = validationResult.errors.join(', ');
    if (errorMessage.includes('同じポート')) {
      throw new Error('Frontend and backend ports must be different');
    }
    throw new Error(errorMessage);
  }

  if (options.verbose) {
    console.log('kiro-lens starting with options:', options);
    console.log('Port configuration:', portConfig);
  }

  console.log(`Frontend will start on port: ${portConfig.frontend}`);
  console.log(`Backend will start on port: ${portConfig.backend}`);

  // TODO: 実際のサーバー起動処理は後続のタスクで実装
}

// CLIとして実行された場合のエントリーポイント
if (import.meta.url === `file://${process.argv[1]}`) {
  const program = createProgram();

  // エラーハンドリング
  program.exitOverride(err => {
    if (err.code === 'commander.invalidArgument' || err.code === 'commander.invalidOption') {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  });

  try {
    program.parse();
  } catch (error) {
    if (error instanceof Error) {
      console.error('起動エラー:', error.message);
    } else {
      console.error('起動エラー:', error);
    }
    process.exit(1);
  }
}
