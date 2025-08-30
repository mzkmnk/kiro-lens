#!/usr/bin/env tsx

import { Command } from 'commander';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
    .name('kiro-lens')
    .description('Figma MCPダッシュボード - ローカルファイル管理・編集ツール')
    .version('1.0.0');

program
    .command('start')
    .description('ダッシュボードサーバーを起動')
    .option('-p, --port <port>', 'フロントエンドポート', '3000')
    .option('-b, --backend-port <port>', 'バックエンドポート', '3001')
    .action(async (options) => {
        const projectRoot = process.cwd();

        // プロジェクトルートの検証
        if (!existsSync(join(projectRoot, 'package.json'))) {
            console.error('❌ package.jsonが見つかりません。プロジェクトのルートディレクトリで実行してください。');
            process.exit(1);
        }

        console.log('🚀 Kiro Lens ダッシュボードを起動中...');
        console.log(`📁 プロジェクトルート: ${projectRoot}`);
        console.log(`🌐 フロントエンド: http://localhost:${options.port}`);
        console.log(`⚡ バックエンド: http://localhost:${options.backendPort}`);

        // concurrentlyを使用してフロントエンドとバックエンドを並行起動
        const concurrentlyPath = join(__dirname, '../node_modules/.bin/concurrently');

        const commands = [
            `npm run dev:frontend`,
            `npm run dev:backend`
        ];

        const concurrentlyProcess = spawn('npx', [
            'concurrently',
            '--kill-others',
            '--prefix', 'name',
            '--names', 'frontend,backend',
            '--prefix-colors', 'cyan,magenta',
            ...commands
        ], {
            stdio: 'inherit',
            cwd: projectRoot
        });

        // プロセス終了時の処理
        process.on('SIGINT', () => {
            console.log('\n🛑 サーバーを停止中...');
            concurrentlyProcess.kill('SIGINT');
            process.exit(0);
        });

        concurrentlyProcess.on('exit', (code) => {
            process.exit(code || 0);
        });
    });

// デフォルトコマンドとしてstartを実行
program.action(() => {
    program.commands.find(cmd => cmd.name() === 'start')?.action({ port: '3000', backendPort: '3001' });
});

program.parse();