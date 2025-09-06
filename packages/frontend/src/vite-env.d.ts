/// <reference types="vite/client" />

/**
 * 環境変数の型定義
 * vite.config.tsとブラウザ側で共有される型定義
 */
export interface ViteEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_MSW: string;
}

interface ImportMetaEnv extends ViteEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}