import React from 'react';

interface MainContentProps {
  hasKiroDir: boolean;
}

/**
 * メインコンテンツコンポーネント
 * .kiroディレクトリの存在状態に応じて適切なコンテンツを表示
 */
export const MainContent: React.FC<MainContentProps> = ({ hasKiroDir }) => {
  return (
    <main className='flex-1 p-6 overflow-auto bg-white'>
      <div className='w-full h-full flex items-center justify-center'>
        {hasKiroDir ? <WelcomeContent /> : <NoKiroDirContent />}
      </div>
    </main>
  );
};

/**
 * .kiroディレクトリが存在する場合のウェルカムコンテンツ
 */
const WelcomeContent: React.FC = () => {
  return (
    <div className='w-full text-center'>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 font-['Noto_Sans_JP']">
        ようこそ kiro-lens ダッシュボードへ
      </h1>
      <p className='text-gray-600 mb-8'>左側のサイドバーからファイルを選択して開始してください。</p>
    </div>
  );
};

/**
 * .kiroディレクトリが存在しない場合のエラーコンテンツ
 */
const NoKiroDirContent: React.FC = () => {
  return (
    <div className='w-full text-center max-w-md mx-auto'>
      <div className='text-yellow-600 mb-4'>
        <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4 font-['Noto_Sans_JP']">
        .kiroディレクトリが見つかりません
      </h2>
      <p className='text-gray-600'>
        このプロジェクトのルートディレクトリに.kiroディレクトリが存在しません。
      </p>
    </div>
  );
};
