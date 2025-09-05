import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { FileTree } from '@/components/custom-ui/file-tree';
import { ErrorBoundary } from '@/components/custom-ui/error-boundary';
import { mockFiles } from '@/data/mock-files';

interface AppProps {
  projectName?: string;
}

function App({ projectName = 'kiro-lens-project' }: AppProps) {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div
          className='flex h-screen bg-[#f9f9f9] font-["Noto_Sans_JP"]'
          role='application'
          aria-label='Kiro Lens Dashboard'
        >
          {/* Sidebar */}
          <ErrorBoundary>
            <Sidebar className='border-r border-[#79747e]/20'>
              <SidebarHeader className='border-b border-[#79747e]/20'>
                <div className='flex items-center justify-between px-4 py-2'>
                  <h1 className='font-bold text-[20px] text-[#4a4459] truncate' title={projectName}>
                    {projectName}
                  </h1>
                  <SidebarTrigger className='text-[#4a4459] hover:bg-[#4a4459]/10' />
                </div>
              </SidebarHeader>
              <SidebarContent className='p-2'>
                <FileTree
                  items={mockFiles}
                  onFileSelect={file => console.log('Selected file:', file.name)}
                  onFolderToggle={(folder, isOpen) =>
                    console.log('Folder toggled:', folder.name, isOpen)
                  }
                />
              </SidebarContent>
            </Sidebar>
          </ErrorBoundary>

          {/* Main Content */}
          <div className='flex-1 flex flex-col min-w-0'>
            {/* Header */}
            <header
              className='h-14 border-b border-[#79747e]/20 bg-white px-6 flex items-center justify-between'
              role='banner'
            >
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 text-[#4a4459]' aria-hidden='true'>
                    🔀
                  </div>
                  <span className='text-sm font-medium text-[#4a4459]'>Kiro Lens</span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <span
                  className='bg-green-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm'
                  role='status'
                  aria-live='polite'
                  aria-label='Connection status: Connected'
                >
                  Connected
                </span>
                <Button variant='outline' size='sm' className='text-[#4a4459] border-[#79747e]/30'>
                  設定
                </Button>
                <Button size='sm' className='bg-[#4a4459] hover:bg-[#4a4459]/90'>
                  保存
                </Button>
              </div>
            </header>

            {/* Main Content Area */}
            <ErrorBoundary>
              <main className='flex-1 p-6 overflow-auto bg-white'>
                <div className='w-full'>
                  <h2 className='text-3xl font-bold mb-6 text-black leading-tight'>
                    Welcome to Kiro Lens
                  </h2>
                  <p className='text-[14px] text-[#4a4459] mb-6 leading-relaxed'>
                    Kiro IDEユーザー向けの.kiro配下ファイル管理ツールです。
                  </p>

                  <div className='bg-[#f9f9f9] p-4 rounded-lg border border-[#79747e]/20 mb-6'>
                    <p className='text-[12px] text-[#4a4459] font-medium'>
                      プロジェクト: <span className='font-bold'>{projectName}</span>
                    </p>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'>
                    <div className='p-6 border border-[#79747e]/20 rounded-lg bg-white shadow-sm'>
                      <h3 className='text-xl font-semibold mb-3 text-[#4a4459]'>
                        プロジェクト概要
                      </h3>
                      <p className='text-[#4a4459]/80'>
                        Kiro Lensは、AWS Kiro IDEユーザー向けの.kiro配下管理ツールです。
                      </p>
                    </div>
                    <div className='p-6 border border-[#79747e]/20 rounded-lg bg-white shadow-sm'>
                      <h3 className='text-xl font-semibold mb-3 text-[#4a4459]'>
                        .kiroディレクトリ管理
                      </h3>
                      <p className='text-[#4a4459]/80'>
                        左側のサイドバーから.kiro配下のファイルを管理できます。
                      </p>
                    </div>
                    <div className='p-6 border border-[#79747e]/20 rounded-lg bg-white shadow-sm'>
                      <h3 className='text-xl font-semibold mb-3 text-[#4a4459]'>設定</h3>
                      <p className='text-[#4a4459]/80'>
                        右上の設定ボタンから環境設定を変更できます。
                      </p>
                    </div>
                  </div>
                </div>
              </main>
            </ErrorBoundary>
          </div>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export default App;
