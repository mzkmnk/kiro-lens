import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ErrorBoundary } from '@/components/custom-ui/error-boundary';
import { MainContent } from './MainContent';
import { ProjectSidebar } from './ProjectSidebar';
import { ApiClient } from '@/services/api';
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
  const [hasKiroDir, setHasKiroDir] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<ProjectInfo | undefined>();
  const [selectedFile, setSelectedFile] = useState<FileItem | undefined>();
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);

  const apiClient = new ApiClient();

  // プロジェクト選択時の処理
  const handleProjectSelect = (project: ProjectInfo) => {
    setCurrentProject(project);
    setSelectedFile(undefined); // プロジェクト切り替え時にファイル選択をクリア
    setIsAddingProject(false); // プロジェクト追加モードを終了
  };

  // プロジェクト追加モードを開始
  const handleAddProject = () => {
    setIsAddingProject(true);
    setCurrentProject(undefined);
    setSelectedFile(undefined);
  };

  // プロジェクト追加処理
  const handleProjectAdd = async (path: string) => {
    try {
      const response = await apiClient.addProject(path);
      // 追加されたプロジェクトを選択
      setCurrentProject(response.project);
      setIsAddingProject(false);
    } catch (error) {
      console.error('プロジェクトの追加に失敗しました:', error);
      // エラーハンドリングは後で改善予定
    }
  };

  // ファイル選択時の処理
  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    console.log('Selected file:', file.name);
  };

  // hasKiroDirの状態を決定
  useEffect(() => {
    if (isAddingProject) {
      setHasKiroDir(false);
    } else {
      setHasKiroDir(currentProject?.hasKiroDir || false);
    }
  }, [currentProject, isAddingProject]);

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
                <MainContent hasKiroDir={hasKiroDir} onProjectAdd={handleProjectAdd} />
              </ErrorBoundary>
            </div>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    </div>
  );
};
