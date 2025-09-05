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
      <div className='h-full'>{hasKiroDir ? <WelcomeContent /> : <NoKiroDirContent />}</div>
    </main>
  );
};

/**
 * .kiroディレクトリが存在する場合のウェルカムコンテンツ
 */
const WelcomeContent: React.FC = () => {
  return (
    <div className='max-w-4xl mx-auto'>
      <div className='text-center py-12'>
        <div className='mb-8'>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-['Noto_Sans_JP']">
            ようこそ kiro-lens ダッシュボードへ
          </h1>
          <p className='text-xl text-gray-600 mb-2'>Kiro IDEの.kiro配下ファイル管理ツール</p>
          <p className='text-sm text-gray-500'>
            プロジェクトの設定ファイルとスペックを効率的に管理
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          <FeatureCard
            title='プロジェクト管理'
            description='左側のサイドバーから.kiroディレクトリの内容を確認できます。'
            icon='📁'
            bgColor='bg-blue-50'
            borderColor='border-blue-200'
            textColor='text-blue-900'
            descColor='text-blue-700'
          />
          <FeatureCard
            title='リアルタイム編集'
            description='ファイルの変更は即座に反映され、効率的な開発をサポートします。'
            icon='✏️'
            bgColor='bg-green-50'
            borderColor='border-green-200'
            textColor='text-green-900'
            descColor='text-green-700'
          />
        </div>

        <div className='bg-gray-100 border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>🚀 始めましょう</h3>
          <p className='text-gray-600 text-sm'>
            サイドバーから管理したいファイルを選択して、プロジェクトの設定を開始してください。
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * .kiroディレクトリが存在しない場合のエラーコンテンツ
 */
const NoKiroDirContent: React.FC = () => {
  return (
    <div className='max-w-2xl mx-auto text-center py-12'>
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-8 shadow-sm'>
        <div className='text-yellow-600 mb-6'>
          <div className='w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center'>
            <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-yellow-800 mb-4 font-['Noto_Sans_JP']">
          .kiroディレクトリが見つかりません
        </h2>

        <p className='text-yellow-700 mb-8 text-lg'>
          このプロジェクトのルートディレクトリに.kiroディレクトリが存在しません。
        </p>

        <div className='bg-white border border-yellow-300 rounded-lg p-6 text-left shadow-sm'>
          <h3 className='font-semibold text-yellow-800 mb-4 flex items-center'>
            <span className='mr-2'>💡</span>
            解決方法
          </h3>
          <div className='space-y-3'>
            <SolutionStep
              number='1'
              text='プロジェクトのルートディレクトリで実行していることを確認してください'
            />
            <SolutionStep
              number='2'
              text='.kiroディレクトリを作成してKiro IDEの設定ファイルを配置してください'
            />
          </div>
        </div>

        <div className='mt-6 text-sm text-yellow-600'>
          <p>
            詳細については、
            <span className='font-semibold'>Kiro IDEのドキュメント</span>
            を参照してください。
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 機能紹介カードコンポーネント
 */
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  descColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  bgColor,
  borderColor,
  textColor,
  descColor,
}) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-6 shadow-sm`}>
      <div className='text-2xl mb-3'>{icon}</div>
      <h3 className={`text-xl font-semibold ${textColor} mb-2`}>{title}</h3>
      <p className={`${descColor} text-sm`}>{description}</p>
    </div>
  );
};

/**
 * 解決手順ステップコンポーネント
 */
interface SolutionStepProps {
  number: string;
  text: string;
}

const SolutionStep: React.FC<SolutionStepProps> = ({ number, text }) => {
  return (
    <div className='flex items-start'>
      <div className='flex-shrink-0 w-6 h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>
        {number}
      </div>
      <p className='text-sm text-yellow-700 leading-relaxed'>{text}</p>
    </div>
  );
};
