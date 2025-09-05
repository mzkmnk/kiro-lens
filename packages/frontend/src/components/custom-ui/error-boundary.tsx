import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントでエラーが発生した場合にフォールバックUIを表示
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='flex flex-col items-center justify-center min-h-[200px] p-6 text-center'>
          <div className='mb-4'>
            <svg
              className='w-12 h-12 text-red-500 mx-auto mb-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
            <h2 className='text-lg font-semibold text-foreground mb-2'>エラーが発生しました</h2>
            <p className='text-sm text-muted-foreground mb-4'>
              申し訳ございませんが、予期しないエラーが発生しました。
            </p>
            {this.state.error && (
              <details className='text-xs text-muted-foreground mb-4 max-w-md'>
                <summary className='cursor-pointer hover:text-foreground'>エラー詳細を表示</summary>
                <pre className='mt-2 p-2 bg-muted rounded text-left overflow-auto'>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
          <Button onClick={this.handleReset} variant='outline'>
            再試行
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
