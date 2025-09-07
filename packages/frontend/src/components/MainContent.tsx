import React from 'react';
import { PathInput } from './PathInput';

interface MainContentProps {
  hasKiroDir: boolean;
  /** プロジェクト追加時のコールバック */
  onProjectAdd?: (path: string) => void;
}

/**
 * メインコンテンツコンポーネント
 */
export const MainContent: React.FC<MainContentProps> = ({ hasKiroDir, onProjectAdd }) => {
  const handlePathConfirm = (path: string) => {
    if (onProjectAdd) {
      onProjectAdd(path);
    }
  };

  return (
    <main className='flex-1 p-6 overflow-auto bg-white'>
      <div className='h-full'>
        {!hasKiroDir && (
          <div className='w-full h-full flex items-center justify-center'>
            <div className='w-full max-w-2xl px-4'>
              <PathInput
                onPathConfirm={handlePathConfirm}
                placeholder='プロジェクトのパスを入力してください'
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
