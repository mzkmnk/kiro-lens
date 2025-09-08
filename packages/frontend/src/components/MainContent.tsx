import React from 'react';
import { PathInput } from './PathInput';
import { useProjectStore } from '@/stores/projectStore';

/**
 * メインコンテンツコンポーネント
 *
 * ProjectStoreから直接状態とアクションを取得し、
 * 完全に独立したコンポーネントとして実装
 */
export const MainContent: React.FC = () => {
  // Zustandストアから状態とアクションを取得
  const { hasKiroDir, addProject } = useProjectStore();

  const handlePathConfirm = async (path: string) => {
    await addProject(path);
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
