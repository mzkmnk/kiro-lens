import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import type { ViteEnv } from './src/vite-env';

export default defineConfig(({ mode }) => {
  // 型安全な環境変数読み込み
  const env = loadEnv(mode, process.cwd(), '') as unknown as ViteEnv;

  const isMSWEnabled = env.VITE_ENABLE_MSW === 'true';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@shared': resolve(__dirname, '../shared/src'),
      },
    },
    server: {
      port: 3000,
      host: 'localhost',
      // HMR の最適化
      hmr: {
        overlay: true,
      },
      // 開発サーバーの起動時間短縮
      warmup: {
        clientFiles: ['./src/main.tsx', './src/App.tsx'],
      },
      // MSW Service Worker配信設定
      fs: {
        allow: ['..'],
      },
      ...(!isMSWEnabled && {
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      }),
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      // チャンク分割の最適化
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['@shared'],
          },
        },
      },
      // ビルドパフォーマンスの最適化
      target: 'esnext',
      minify: 'esbuild',
    },
    // 依存関係の事前バンドル最適化
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@shared', 'msw'],
    },
    // プレビューサーバー設定
    preview: {
      port: 3000,
      host: 'localhost',
    },
  };
});
