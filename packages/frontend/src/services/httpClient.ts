import ky from 'ky';

/**
 * HTTPクライアントの設定
 */
const httpClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000, // 10秒
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      request => {
        // リクエストログ（開発環境のみ）
        if (import.meta.env.DEV) {
          console.log(`🔄 ${request.method} ${request.url}`);
        }
      },
    ],
    afterResponse: [
      (request, _options, response) => {
        // レスポンスログ（開発環境のみ）
        if (import.meta.env.DEV) {
          console.log(`✅ ${request.method} ${request.url} - ${response.status}`);
        }
      },
    ],
  },
});

/**
 * APIエラーハンドラー
 * kyのHTTPErrorを適切なエラーメッセージに変換する
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    // kyのHTTPError
    if ('response' in error && error.response instanceof Response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return 'リクエストが無効です';
        case 401:
          return '認証が必要です';
        case 403:
          return 'アクセスが拒否されました';
        case 404:
          return 'リソースが見つかりません';
        case 500:
          return 'サーバーエラーが発生しました';
        case 503:
          return 'サービスが利用できません';
        default:
          return `HTTPエラー: ${status}`;
      }
    }

    // ネットワークエラーやタイムアウト
    if (error.name === 'TimeoutError') {
      return 'リクエストがタイムアウトしました';
    }

    return error.message || '不明なエラーが発生しました';
  }

  return '不明なエラーが発生しました';
};

export default httpClient;
