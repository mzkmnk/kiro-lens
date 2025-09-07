import React from 'react';
import { Folder, Plus, X } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

import type { ProjectInfo } from '@kiro-lens/shared';
import type { FileItem } from '@shared/types/file-tree';

interface ProjectSidebarProps {
  /** 管理対象のプロジェクト一覧 */
  projects: readonly ProjectInfo[];
  /** 現在選択中のプロジェクト */
  currentProject?: ProjectInfo;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error?: string;
  /** プロジェクト選択時のコールバック */
  onProjectSelect: (project: ProjectInfo) => void;
  /** プロジェクト削除時のコールバック */
  onProjectDelete: (projectId: string) => void;
  /** プロジェクト追加ボタンクリック時のコールバック */
  onAddProject: () => void;
  /** ファイル選択時のコールバック */
  onFileSelect?: (file: FileItem) => void;
}

/**
 * ProjectSidebarコンポーネント
 *
 * プロジェクト管理とファイルツリーを統合したサイドバー
 * shadcn/uiのSidebarコンポーネントを使用して階層構造を実現
 *
 * プレゼンテーションコンポーネントとして実装され、
 * 状態管理はDashboardコンポーネントで行われる
 */
export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  currentProject,
  isLoading,
  error,
  onProjectSelect,
  onProjectDelete,
  onAddProject,
}) => {
  // プロジェクトを削除
  const handleDeleteProject = (project: ProjectInfo, event: React.MouseEvent) => {
    event.stopPropagation();

    // 確認ダイアログを表示
    const confirmed = window.confirm(
      `プロジェクト「${project.name}」を削除しますか？\n\nパス: ${project.path}\n\nこの操作は元に戻せません。`
    );

    if (confirmed) {
      onProjectDelete(project.id);
    }
  };

  // プロジェクトを選択
  const handleSelectProject = (project: ProjectInfo) => {
    if (project.isValid) {
      onProjectSelect(project);
    }
  };

  // プロジェクト項目のレンダリング
  const renderProjectItem = (project: ProjectInfo) => {
    const isSelected = currentProject?.id === project.id;
    const isInvalid = !project.isValid;

    return (
      <SidebarMenuItem key={project.id}>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => handleSelectProject(project)}
          disabled={isInvalid}
          className={`
            w-full justify-start
            ${isInvalid ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Folder className={`h-4 w-4 ${isInvalid ? 'text-red-500' : 'text-blue-600'}`} />
          <span className='truncate flex-1'>{project.name}</span>

          {/* ステータスバッジ */}
          {isSelected && (
            <span className='bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-medium'>
              選択中
            </span>
          )}
          {isInvalid && (
            <span className='bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium'>
              無効
            </span>
          )}
        </SidebarMenuButton>

        {/* 削除ボタン */}
        <SidebarMenuAction onClick={e => handleDeleteProject(project, e)} showOnHover>
          <X className='h-4 w-4' />
          <span className='sr-only'>プロジェクト {project.name} を削除</span>
        </SidebarMenuAction>

        {/* 選択されたプロジェクトの.kiroファイル表示 */}
        {isSelected && !isInvalid && (
          <SidebarMenuSub>
            {/* TODO: ファイルツリーAPIを実装してファイル一覧を表示 */}
            <div className='p-2 text-sm text-[#79747e]'>ファイルツリー機能は実装予定です</div>
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className='border-r border-[#79747e]/20'>
      <SidebarContent>
        {isLoading ? (
          <div className='p-4 text-center'>
            <div className='text-[#79747e]'>読み込み中...</div>
          </div>
        ) : error ? (
          <div className='p-4 text-center'>
            <div className='text-red-600 text-sm mb-2'>{error}</div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.location.reload()}
              className='text-[#4a4459] border-[#79747e]/30'
            >
              再読み込み
            </Button>
          </div>
        ) : (
          <SidebarMenu className='p-2'>
            {/* プロジェクト追加ボタン */}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onAddProject}>
                <Plus className='h-4 w-4' />
                <span>プロジェクトを追加</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* プロジェクト一覧 */}
            {projects.map(renderProjectItem)}
          </SidebarMenu>
        )}

        {/* フッター情報 */}
        {projects.length > 0 && (
          <div className='p-4 border-t border-[#79747e]/20 mt-auto'>
            <div className='text-xs text-[#79747e] text-center'>
              {projects.length} 個のプロジェクト
              {projects.filter(p => !p.isValid).length > 0 && (
                <span className='text-red-600 ml-2'>
                  ({projects.filter(p => !p.isValid).length} 個が無効)
                </span>
              )}
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
