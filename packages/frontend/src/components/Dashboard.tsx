import React, { useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ErrorBoundary } from '@/components/custom-ui/error-boundary';
import { MainContent } from './MainContent';
import { ProjectSidebar } from './ProjectSidebar';
import { useProjectStore } from '@/stores/projectStore';

interface DashboardProps {
  projectName: string;
}

/**
 * Dashboardコンポーネント
 *
 * Kiro IDEの.kiro配下ファイル管理ツールのメインダッシュボード
 * ProjectSidebarとMainContentを統合したレイアウトを提供
 *
 * @param projectName - 現在のプロジェクト名
 */
export const Dashboard: React.FC<DashboardProps> = ({ projectName: _projectName }) => {
  // Zustandストアから状態とアクションを取得
  const { currentProject, selectedFile, loadProjects } = useProjectStore();

  // 初期データ読み込み
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div data-testid='dashboard-container'>
      <ErrorBoundary>
        <SidebarProvider>
          <div
            className='w-full flex h-screen bg-[#f9f9f9] font-["Noto_Sans_JP"]'
            role='application'
            aria-label='Kiro Lens Dashboard'
          >
            {/* Sidebar */}
            <ErrorBoundary>
              <ProjectSidebar />
            </ErrorBoundary>

            {/* Main Content */}
            <div className='flex-1 flex flex-col min-w-0'>
              {/* Header */}
              <header
                className='h-14 border-b border-[#79747e]/20 bg-white px-6 flex items-center justify-between'
                role='banner'
              >
                <div className='flex items-center gap-4'>
                  <SidebarTrigger className='text-[#4a4459] hover:bg-[#4a4459]/10' />
                  <div className='flex items-center gap-2'>
                    {currentProject && (
                      <>
                        <span className='text-[#79747e]'>•</span>
                        <span className='text-sm text-[#4a4459]'>{currentProject.name}</span>
                      </>
                    )}
                    {selectedFile && (
                      <>
                        <span className='text-[#79747e]'>•</span>
                        <span className='text-sm text-[#79747e]'>{selectedFile.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <ErrorBoundary>
                <MainContent />
              </ErrorBoundary>
            </div>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </div>
  );
};
