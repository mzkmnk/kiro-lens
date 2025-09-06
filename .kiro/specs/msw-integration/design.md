# MSW統合 設計ドキュメント

## 概要

kiro-lensプロジェクトのフロントエンドパッケージにMSW（Mock Service Worker）を統合し、開発環境でのAPI モック機能を提供する設計。バックエンドサーバーに依存しない開発環境を構築し、開発効率を向上させる。

## アーキテクチャ

### MSW統合アーキテクチャ

```
Frontend Package
├── src/
│   ├── mocks/
│   │   ├── browser.ts          # ブラウザ用MSWセットアップ
│   │   ├── handlers/
│   │   │   ├── index.ts        # ハンドラーエクスポート
│   │   │   ├── health.ts       # ヘルスチェックAPI
│   │   │   └── project.ts      # プロジェクトAPI
│   │   └── data/
│   │       ├── health.ts       # ヘルスチェックモックデータ
│   │       └── project.ts      # プロジェクトモックデータ
│   ├── main.tsx                # MSW初期化統合
│   └── vite-env.d.ts          # MSW型定義
├── public/
│   └── mockServiceWorker.js    # MSW Service Worker
└── vite.config.ts              # Vite MSW統合設定
```

### 開発フロー

1. **開発環境起動時**
   - Vite開発サーバー起動
   - 環境変数チェック（VITE_ENABLE_MSW）
   - MSW Service Worker登録
   - ハンドラー初期化

2. **APIリクエスト処理**
   - フロントエンドからAPIリクエスト
   - MSW Service Workerがインターセプト
   - 対応するハンドラーでレスポンス生成
   - モックデータを返却

3. **ハンドラー管理**
   - エンドポイント別ハンドラー分離
   - 共通モックデータの再利用
   - 型安全なレスポンス定義

## コンポーネントと インターフェース

### MSWセットアップ (browser.ts)

```typescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export const startMSW = async (): Promise<void> => {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('🔶 MSW enabled for development');
  }
};
```

### ハンドラー構造

```typescript
// handlers/index.ts
export { healthHandlers } from './health';
export { projectHandlers } from './project';

export const handlers = [...healthHandlers, ...projectHandlers];

// handlers/health.ts
import { http, HttpResponse } from 'msw';
import { healthMockData } from '../data/health';
import type { HealthResponse } from '@kiro-lens/shared';

export const healthHandlers = [
  http.get('/api/health', () => {
    return HttpResponse.json<HealthResponse>(healthMockData.success);
  }),
];
```

### モックデータ管理

```typescript
// data/health.ts
import type { HealthResponse } from '@kiro-lens/shared';

export const healthMockData = {
  success: {
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  } satisfies HealthResponse,

  error: {
    status: 'unhealthy' as const,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    error: 'Database connection failed',
  } satisfies HealthResponse,
};
```

### Vite統合設定

```typescript
// vite.config.ts
export default defineConfig({
  // 既存設定...
  define: {
    'import.meta.env.VITE_ENABLE_MSW': JSON.stringify(process.env.VITE_ENABLE_MSW || 'false'),
  },
  server: {
    // MSW Service Worker配信設定
    fs: {
      allow: ['..'],
    },
  },
});
```

## データモデル

### 環境変数

```typescript
interface MSWEnvironment {
  VITE_ENABLE_MSW: 'true' | 'false'; // MSW有効/無効切り替え
}
```

### ハンドラー型定義

```typescript
import type { RequestHandler } from 'msw';

export type MSWHandler = RequestHandler;

export interface HandlerGroup {
  name: string;
  handlers: MSWHandler[];
}
```

### モックデータ型

```typescript
export interface MockDataSet<T> {
  success: T;
  error?: T;
  loading?: T;
}
```

## エラーハンドリング

### MSW初期化エラー

```typescript
export const startMSW = async (): Promise<void> => {
  try {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
      await worker.start();
      console.log('🔶 MSW enabled for development');
    }
  } catch (error) {
    console.error('❌ Failed to start MSW:', error);
    // 開発環境では警告のみ、アプリケーション継続
  }
};
```

### ハンドラーエラー処理

```typescript
export const healthHandlers = [
  http.get('/api/health', ({ request }) => {
    try {
      // エラーシミュレーション用クエリパラメータ
      const url = new URL(request.url);
      if (url.searchParams.get('error') === 'true') {
        return HttpResponse.json(healthMockData.error, { status: 500 });
      }

      return HttpResponse.json(healthMockData.success);
    } catch (error) {
      console.error('MSW Handler Error:', error);
      return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }),
];
```

### 未処理リクエスト対応

```typescript
// browser.ts
await worker.start({
  onUnhandledRequest: request => {
    // 開発環境では警告表示
    if (import.meta.env.DEV) {
      console.warn(`🔶 Unhandled ${request.method} ${request.url}`);
    }
  },
});
```

## テスト戦略

### 開発環境テスト

1. **MSW有効化テスト**
   - 環境変数設定でMSW起動確認
   - Service Worker登録確認
   - ブラウザコンソールでの動作確認

2. **ハンドラー動作テスト**
   - 各APIエンドポイントのレスポンス確認
   - エラーケースのシミュレーション
   - 型安全性の確認

3. **統合テスト**
   - フロントエンドアプリケーションでの動作確認
   - バックエンドサーバー停止時の動作確認
   - 実際のAPIとの切り替え確認

### パフォーマンス考慮事項

1. **Service Worker最適化**
   - 必要最小限のハンドラー登録
   - レスポンス生成の高速化
   - メモリ使用量の最適化

2. **開発環境専用**
   - 本番ビルドではMSWコード除外
   - Tree Shakingによる不要コード削除
   - バンドルサイズへの影響最小化

## セキュリティ考慮事項

1. **開発環境限定**
   - 本番環境でのMSW無効化
   - 環境変数による制御
   - ビルド時の条件分岐

2. **データ保護**
   - 実際の機密データは使用しない
   - モックデータの適切な管理
   - 開発用ダミーデータの使用
