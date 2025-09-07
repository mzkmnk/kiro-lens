import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ErrorBoundary } from '@/components/custom-ui/error-boundary';
import { MainContent } from './MainContent';
import { ProjectSidebar } from './ProjectSidebar';
import { useProjectStore } from '@/stores/projectStore';
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
  const [selectedFile, setSelectedFile] = useState<FileItem | undefined>();
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);

  // Zustandストアから状態とアクションを取得
  const {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    addProject,
    removeProject,
    selectProject,
    clearError,
  } = useProjectStore();

  // プロジェクト選択時の処理
  const handleProjectSelect = async (project: ProjectInfo) => {
    try {
      await selectProject(project);
      setSelectedFile(undefined); // プロジェクト切り替え時にファイル選択をクリア
      setIsAddingProject(false); // プロジェクト追加モードを終了
    } catch (error) {
      // エラーはストアで管理されるため、ここでは何もしない
      console.error('プロジェクトの選択に失敗しました:', error);
    }
  };

  // プロジェクト追加モードを開始
  const handleAddProject = () => {
    setIsAddingProject(true);
    setSelectedFile(undefined);
    clearError(); // エラーをクリア
  };

  // プロジェクト追加処理
  const handleProjectAdd = async (path: string) => {
    try {
      await addProject(path);
      setIsAddingProject(false);
    } catch (error) {
      // エラーはストアで管理されるため、ここでは何もしない
      console.error('プロジェクトの追加に失敗しました:', error);
    }
  };

  // プロジェクト削除処理
  const handleProjectDelete = async (projectId: string) => {
    try {
      await removeProject(projectId);
    } catch (error) {
      // エラーはストアで管理されるため、ここでは何もしない
      console.error('プロジェクトの削除に失敗しました:', error);
    }
  };

  // ファイル選択時の処理
  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    console.log('Selected file:', file.name);
  };

  // 初期データ読み込み
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
                projects={projects}
                currentProject={currentProject}
                isLoading={isLoading}
                error={error}
                onProjectSelect={handleProjectSelect}
                onProjectDelete={handleProjectDelete}
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
