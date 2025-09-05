import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

/**
 * ローディングスピナーコンポーネント
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && <p className='text-sm text-muted-foreground'>{text}</p>}
    </div>
  );
}

/**
 * フルスクリーンローディングオーバーレイ
 */
export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center'>
      <LoadingSpinner size='lg' text={text} />
    </div>
  );
}
