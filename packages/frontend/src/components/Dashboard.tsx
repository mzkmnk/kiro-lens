import React, { useState, useEffect } from 'react';
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
import { MainContent } from './MainContent';
import { ProjectManager } from './ProjectManager';
import { mockFiles } from '@/data/mock-files';
import type { ProjectInfo } from '@kiro-lens/shared';

interface DashboardProps {
  projectName: string;
}

/**
 * Dashboardコンポーネント
 *
 * Kiro IDEの.kiro配下ファイル管理ツールのメインダッシュボード
 * 基本的なレイアウト（ヘッダー、サイドバー、メインコンテンツ）を提供
 * プロジェクト管理機能を統合
 *
 * @param projectName - 現在のプロジェクト名
 */
export const Dashboard: React.FC<DashboardProps> = ({ projectName }) => {
  const [hasKiroDir, setHasKiroDir] = useState<boolean>(true);
  const [currentProject, setCurrentProject] = useState<ProjectInfo | undefined>();
  const [showProjectManager, setShowProjectManager] = useState<boolean>(false);

  // プロジェクト選択時の処理
  const handleProjectSelect = (project: ProjectInfo) => {
    setCurrentProject(project);
    setHasKiroDir(project.hasKiroDir);
    // プロジェクト切り替え時にファイルツリーを更新する処理を追加予定
  };

  // プロジェクト追加ダイアログを開く処理
  const handleAddProject = () => {
    // PathDialogコンポーネントを開く処理を追加予定
    console.log('プロジェクト追加ダイアログを開く');
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
              <Sidebar className='border-r border-[#79747e]/20'>
                <SidebarHeader className='border-b border-[#79747e]/20'>
                  <div className='flex items-center justify-between px-4 py-2'>
                    <h1
                      className='font-bold text-[20px] text-[#4a4459] truncate'
                      title={currentProject?.name || projectName}
                    >
                      {currentProject?.name || projectName}
                    </h1>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setShowProjectManager(!showProjectManager)}
                        className='text-[#4a4459] hover:bg-[#4a4459]/10'
                        aria-label='プロジェクト管理を切り替え'
                      >
                        📁
                      </Button>
                      <SidebarTrigger className='text-[#4a4459] hover:bg-[#4a4459]/10' />
                    </div>
                  </div>
                </SidebarHeader>
                <SidebarContent className='p-0'>
                  {showProjectManager ? (
                    <ProjectManager
                      onProjectSelect={handleProjectSelect}
                      currentProject={currentProject}
                      onAddProject={handleAddProject}
                    />
                  ) : (
                    <div className='p-2'>
                      <FileTree
                        items={mockFiles}
                        onFileSelect={file => console.log('Selected file:', file.name)}
                        onFolderToggle={(folder, isOpen) =>
                          console.log('Folder toggled:', folder.name, isOpen)
                        }
                      />
                    </div>
                  )}
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
