import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ErrorBoundary } from '@/components/custom-ui/error-boundary';
import { MainContent } from './MainContent';
import { ProjectSidebar } from './ProjectSidebar';
import type { ProjectInfo } from '@kiro-lens/shared';
import type { FileItem } from '@shared/types/file-tree';

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
  const [hasKiroDir, setHasKiroDir] = useState<boolean>(true);
  const [currentProject, setCurrentProject] = useState<ProjectInfo | undefined>();
  const [selectedFile, setSelectedFile] = useState<FileItem | undefined>();

  // プロジェクト選択時の処理
  const handleProjectSelect = (project: ProjectInfo) => {
    setCurrentProject(project);
    setHasKiroDir(project.hasKiroDir);
    setSelectedFile(undefined); // プロジェクト切り替え時にファイル選択をクリア
  };

  // プロジェクト追加ダイアログを開く処理
  const handleAddProject = () => {
    // PathDialogコンポーネントを開く処理を追加予定
    console.log('プロジェクト追加ダイアログを開く');
  };

  // ファイル選択時の処理
  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    console.log('Selected file:', file.name);
  };

  // 実際の実装では、APIからプロジェクト情報を取得してhasKiroDirを設定
  useEffect(() => {
    // TODO: プロジェクト情報APIを呼び出してhasKiroDirを設定
    // 現在はモックデータとしてtrueを設定
    setHasKiroDir(true);
  }, []);

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
              <ProjectSidebar
                onProjectSelect={handleProjectSelect}
                currentProject={currentProject}
                onAddProject={handleAddProject}
                onFileSelect={handleFileSelect}
              />
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
                    <span className='text-sm font-medium text-[#4a4459]'>Kiro Lens</span>
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
                <div className='flex items-center gap-2'>
                  <span
                    className='bg-green-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm'
                    role='status'
                    aria-live='polite'
                    aria-label='Connection status: Connected'
                  >
                    Connected
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-[#4a4459] border-[#79747e]/30'
                  >
                    設定
                  </Button>
                  <Button size='sm' className='bg-[#4a4459] hover:bg-[#4a4459]/90'>
                    保存
                  </Button>
                </div>
              </header>

              {/* Main Content Area */}
              <ErrorBoundary>
                <MainContent hasKiroDir={hasKiroDir} />
              </ErrorBoundary>
            </div>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </div>
  );
};
