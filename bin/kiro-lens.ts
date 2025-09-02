#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type {
  CLIOptions,
  PortConfiguration,
  PortConfigurationValidationResult,
} from '../packages/shared/src/types/port.js';
import {
  createPortConfiguration,
  validatePortConfiguration,
  isValidPortNumber,
} from '../packages/shared/src/utils/portUtils.js';

// package.jsonからバージョンを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

/**
 * エラーメッセージの定数
 */
const ERROR_MESSAGES = {
  INVALID_PORT_NUMBER: (optionName: string) => `${optionName} must be a number`,
  NEGATIVE_PORT: 'Port must be a positive number',
  PORT_OUT_OF_RANGE: 'Port must be between 1 and 65535',
  SAME_PORTS: 'Frontend and backend ports must be different',
  STARTUP_ERROR: 'kiro-lens startup error:',
  CONFIGURATION_ERROR: 'Configuration error:',
  VALIDATION_ERROR: 'Validation error:',
} as const;

/**
 * 情報メッセージの定数
 */
const INFO_MESSAGES = {
  STARTING: 'Starting kiro-lens...',
  PORTS_DETECTED: 'Ports automatically detected',
  CONFIGURATION_COMPLETE: 'Configuration completed successfully',
  SERVER_STARTING: 'Starting servers...',
} as const;

/**
 * ログ出力のユーティリティ
 */
const logger = {
  error: (message: string, details?: unknown) => {
    console.error(`❌ ${message}`);
    if (details) {
      console.error(details);
    }
  },
  info: (message: string) => {
    console.log(`ℹ️  ${message}`);
  },
  success: (message: string) => {
    console.log(`✅ ${message}`);
  },
  verbose: (message: string, data?: unknown) => {
    console.log(`🔍 ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  },
  warn: (message: string) => {
    console.warn(`⚠️  ${message}`);
  },
} as const;

/**
 * 起動エラーを処理する
 */
function handleStartupError(error: unknown, verbose?: boolean): void {
  if (error instanceof Error) {
    logger.error(`${ERROR_MESSAGES.STARTUP_ERROR} ${error.message}`);

    if (verbose && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  } else {
    logger.error(`${ERROR_MESSAGES.STARTUP_ERROR} Unknown error occurred`);

    if (verbose) {
      console.error('Error details:', error);
    }
  }
}

/**
 * ポート設定を検証し、エラーがあれば適切な例外を投げる
 */
function validateAndThrowPortConfiguration(
  portConfig: PortConfiguration,
  validationResult: PortConfigurationValidationResult
): void {
  if (!validationResult.isValid) {
    const errorMessage = validationResult.errors.join(', ');
    if (errorMessage.includes('同じポート')) {
      throw new Error(ERROR_MESSAGES.SAME_PORTS);
    }
    throw new Error(`${ERROR_MESSAGES.VALIDATION_ERROR} ${errorMessage}`);
  }
}

/**
 * ポート番号をバリデーションする
 */
function validatePortOption(value: string, optionName: string): number {
  const port = parseInt(value, 10);

  if (isNaN(port)) {
    throw new Error(ERROR_MESSAGES.INVALID_PORT_NUMBER(optionName));
  }

  if (port < 0) {
    throw new Error(ERROR_MESSAGES.NEGATIVE_PORT);
  }

  if (!isValidPortNumber(port)) {
    throw new Error(ERROR_MESSAGES.PORT_OUT_OF_RANGE);
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
    .version(version)
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
    .addHelpText(
      'after',
      `
Examples:
  $ npx kiro-lens                    Start with automatically detected ports
  $ npx kiro-lens --port 3000        Start frontend on port 3000, backend on 3001
  $ npx kiro-lens -f 3000 -b 4000    Start with specific frontend and backend ports
  $ npx kiro-lens --no-open          Start without opening browser automatically
  $ npx kiro-lens --verbose          Start with detailed logging output

Notes:
  • Ports are automatically detected to avoid conflicts
  • Use --verbose for detailed startup information
  • Multiple projects can run simultaneously with different ports
`
    )
    .action(async (options: CLIOptions) => {
      await startKiroLens(options);
    });

  return program;
}

/**
 * kiro-lensを起動する
 */
export async function startKiroLens(options: CLIOptions): Promise<void> {
  try {
    logger.info(INFO_MESSAGES.STARTING);

    if (options.verbose) {
      logger.verbose('Starting kiro-lens with options', options);
    }

    // CLIオプションからポート設定を作成
    const portConfig = createPortConfiguration(options);

    if (options.verbose) {
      logger.verbose('Generated port configuration', portConfig);
    }

    // ポート設定をバリデーション
    const validationResult = validatePortConfiguration(portConfig);
    validateAndThrowPortConfiguration(portConfig, validationResult);

    logger.info(`Frontend will start on port: ${portConfig.frontend}`);
    logger.info(`Backend will start on port: ${portConfig.backend}`);

    if (portConfig.autoDetected) {
      logger.info(INFO_MESSAGES.PORTS_DETECTED);
    }

    logger.success(INFO_MESSAGES.CONFIGURATION_COMPLETE);

    // TODO: 実際のサーバー起動処理は後続のタスクで実装
    logger.info(INFO_MESSAGES.SERVER_STARTING);
  } catch (error) {
    handleStartupError(error, options.verbose);
    throw error;
  }
}

/**
 * CLIプログラムを実行する
 */
async function runCLI(): Promise<void> {
  const program = createProgram();

  // Commander.jsのエラーハンドリング
  program.exitOverride(err => {
    if (err.code === 'commander.invalidArgument' || err.code === 'commander.invalidOption') {
      logger.error(err.message);
      process.exit(1);
    }
    throw err;
  });

  try {
    await program.parseAsync();
  } catch (error) {
    handleStartupError(error);
    process.exit(1);
  }
}

// CLIとして実行された場合のエントリーポイント
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch(error => {
    handleStartupError(error);
    process.exit(1);
  });
}
