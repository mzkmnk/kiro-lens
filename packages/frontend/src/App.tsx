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

function App() {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className='flex h-screen bg-background'>
          {/* Sidebar */}
          <ErrorBoundary>
            <Sidebar>
              <SidebarHeader>
                <h2 className='text-lg font-semibold px-4 py-2'>Kiro プロジェクト</h2>
              </SidebarHeader>
              <SidebarContent>
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
          <div className='flex-1 flex flex-col'>
            {/* Header */}
            <header className='h-14 border-b border-border bg-card px-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <SidebarTrigger />
                <div className='flex items-center gap-2'>
                  <svg
                    className='w-5 h-5 text-muted-foreground'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  <span className='text-sm font-medium'>Kiro Lens</span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm'>
                  設定
                </Button>
                <Button size='sm'>保存</Button>
              </div>
            </header>

            {/* Main Content Area */}
            <ErrorBoundary>
              <main className='flex-1 p-6 overflow-auto'>
                <div className='w-full'>
                  <h1 className='text-3xl font-bold mb-6'>Welcome to Kiro Lens</h1>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'>
                    <div className='p-6 border border-border rounded-lg bg-card'>
                      <h2 className='text-xl font-semibold mb-3'>プロジェクト概要</h2>
                      <p className='text-muted-foreground'>
                        Kiro Lensは、AWS Kiro IDEユーザー向けの.kiro配下管理ツールです。
                      </p>
                    </div>
                    <div className='p-6 border border-border rounded-lg bg-card'>
                      <h2 className='text-xl font-semibold mb-3'>.kiroディレクトリ管理</h2>
                      <p className='text-muted-foreground'>
                        左側のサイドバーから.kiro配下のファイルを管理できます。
                      </p>
                    </div>
                    <div className='p-6 border border-border rounded-lg bg-card'>
                      <h2 className='text-xl font-semibold mb-3'>設定</h2>
                      <p className='text-muted-foreground'>
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
