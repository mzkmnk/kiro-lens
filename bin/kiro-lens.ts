#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

// package.jsonからバージョンを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

interface CLIOptions {
  open?: boolean;
}

/**
 * kiro-lensを起動する
 */
export async function startKiroLens(options: CLIOptions): Promise<void> {
  try {
    console.log('Starting kiro-lens...');
    console.log('Frontend will start on port: 3002');
    console.log('Backend will start on port: 3001');

    const frontendCommand = 'pnpm --filter=frontend dev --port 3002';
    const backendCommand = 'pnpm --filter=backend dev';

    const concurrentlyCommand = [
      'concurrently',
      '--kill-others',
      '--prefix-colors', 'cyan,magenta',
      '--prefix', '[{name}]',
      '--names', 'frontend,backend',
      `"${frontendCommand}"`,
      `"${backendCommand}"`
    ];

    const child = spawn('npx', concurrentlyCommand, {
      stdio: 'inherit',
      shell: true
    });

    // プロセス終了時のクリーンアップ
    process.on('SIGINT', () => {
      child.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
      process.exit(0);
    });

    child.on('exit', (code) => {
      process.exit(code || 0);
    });

    // ブラウザ自動オープン
    if (options.open !== false) {
      setTimeout(async () => {
        try {
          const { default: open } = await import('open');
          await open('http://localhost:3002');
        } catch (error) {
          console.log('Frontend available at http://localhost:3002');
        }
      }, 3000);
    } else {
      console.log('Frontend available at http://localhost:3002');
      console.log('Backend available at http://localhost:3001');
    }
  } catch (error) {
    console.error('Error starting kiro-lens:', error);
    throw error;
  }
}

/**
 * CLIプログラムを作成する
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('kiro-lens')
    .description('Kiro IDE .kiro directory browser and editor')
    .version(version)
    .option('--no-open', "Don't open browser automatically")
    .action(async (options: CLIOptions) => {
      await startKiroLens(options);
    });

  return program;
}

/**
 * CLIを実行する
 */
async function runCLI(): Promise<void> {
  const program = createProgram();

  try {
    await program.parseAsync();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// 直接実行時のみCLIを起動
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
