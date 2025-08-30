import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@shared': resolve(__dirname, '../shared/src')
        }
    },
    server: {
        port: 3000,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'http://localhost:3001',
                ws: true
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    query: ['@tanstack/react-query'],
                    socket: ['socket.io-client']
                }
            }
        }
    }
});