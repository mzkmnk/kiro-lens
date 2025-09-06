import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW Service Worker インスタンス
 * 開発環境でのHTTPリクエストモック用
 */
export const worker = setupWorker(...handlers);

/**
 * MSWを開発環境で初期化する関数
 * 環境変数VITE_ENABLE_MSWがtrueの場合のみ起動
 *
 * @returns Promise<void>
 */
export const startMSW = async (): Promise<void> => {
  try {
    // 開発環境かつMSW有効化フラグがtrueの場合のみ起動
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('MSW enabled for development');
    } else if (import.meta.env.DEV) {
      console.log('MSW disabled (VITE_ENABLE_MSW is not set to "true")');
    }
  } catch (error) {
    console.error('❌ Failed to start MSW:', error);
    // 開発環境では警告のみ、アプリケーション継続
    if (import.meta.env.DEV) {
      console.warn('MSW initialization failed, continuing without mocking');
    }
  }
};

/**
 * MSWを停止する関数
 * テスト環境やクリーンアップ時に使用
 */
export const stopMSW = (): void => {
  try {
    worker.stop();
    console.log('MSW stopped');
  } catch (error) {
    console.error('Failed to stop MSW:', error);
  }
};
