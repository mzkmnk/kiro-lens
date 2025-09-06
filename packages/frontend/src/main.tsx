import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { startMSW } from './mocks/browser';

/**
 * アプリケーション初期化
 * MSW初期化後にReactアプリケーションを起動
 */
const initializeApp = async (): Promise<void> => {
  // 開発環境でMSWを初期化
  await startMSW();

  // Reactアプリケーションを起動
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// アプリケーション初期化を実行
initializeApp().catch(error => {
  console.error('Failed to initialize application:', error);
  // エラーが発生してもアプリケーションは起動
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
