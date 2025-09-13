import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * HTTPエラーハンドリングインターセプター
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // エラーレスポンスを標準化
      const standardizedError = new HttpErrorResponse({
        error: {
          message: getErrorMessage(error),
          code: error.status,
          timestamp: new Date().toISOString(),
        },
        status: error.status,
        statusText: error.statusText,
        url: error.url || undefined,
      });

      return throwError(() => standardizedError);
    }),
  );
};

/**
 * エラーメッセージを取得
 */
function getErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return error.error.message;
  }

  switch (error.status) {
    case 0:
      return 'ネットワークエラーが発生しました';
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
    default:
      return `エラーが発生しました (${error.status})`;
  }
}
