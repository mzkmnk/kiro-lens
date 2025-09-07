import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ApiClient } from '@/services/api';
import type { ProjectInfo } from '@kiro-lens/shared';

interface ProjectManagerProps {
    /** プロジェクト選択時のコールバック */
    onProjectSelect: (project: ProjectInfo) => void;
    /** 現在選択中のプロジェクト */
    currentProject?: ProjectInfo;
    /** プロジェクト追加ボタンクリック時のコールバック */
    onAddProject: () => void;
}

interface ProjectManagerState {
    /** 管理対象のプロジェクト一覧 */
    projects: readonly ProjectInfo[];
    /** ローディング状態 */
    isLoading: boolean;
    /** エラーメッセージ */
    error?: string;
}

/**
 * ProjectManagerコンポーネント
 *
 * 複数のプロジェクトの管理機能を提供します。
 * プロジェクト一覧表示、選択、削除機能を含みます。
 *
 * @param onProjectSelect - プロジェクト選択時のコールバック
 * @param currentProject - 現在選択中のプロジェクト
 * @param onAddProject - プロジェクト追加ボタンクリック時のコールバック
 */
export const ProjectManager: React.FC<ProjectManagerProps> = ({
    onProjectSelect,
    currentProject,
    onAddProject,
}) => {
    const [state, setState] = useState<ProjectManagerState>({
        projects: [],
        isLoading: true,
        error: undefined,
    });

    const apiClient = useMemo(() => new ApiClient(), []);

    // プロジェクト一覧を取得
    const loadProjects = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: undefined }));
            const response = await apiClient.getProjects();
            setState(prev => ({
                ...prev,
                projects: response.projects,
                isLoading: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'プロジェクトの取得に失敗しました',
                isLoading: false,
            }));
        }
    }, [apiClient]);

    // プロジェクトを削除
    const handleDeleteProject = async (project: ProjectInfo) => {
        // 確認ダイアログを表示
        const confirmed = window.confirm(
            `プロジェクト「${project.name}」を削除しますか？\n\nパス: ${project.path}\n\nこの操作は元に戻せません。`
        );

        if (!confirmed) {
            return;
        }

        try {
            await apiClient.removeProject(project.id);
            // プロジェクト一覧を再読み込み
            await loadProjects();
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'プロジェクトの削除に失敗しました',
            }));
        }
    };

    // プロジェクトを選択
    const handleSelectProject = async (project: ProjectInfo) => {
        try {
            await apiClient.selectProject(project.id);
            onProjectSelect(project);
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'プロジェクトの選択に失敗しました',
            }));
        }
    };

    // コンポーネントマウント時にプロジェクト一覧を取得
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // プロジェクト項目のレンダリング
    const renderProjectItem = (project: ProjectInfo) => {
        const isSelected = currentProject?.id === project.id;
        const isInvalid = !project.isValid;

        return (
            <div
                key={project.id}
                className={`
          p-3 rounded-lg border transition-all cursor-pointer
          ${isSelected
                        ? 'bg-[#4a4459] text-white border-[#4a4459]'
                        : isInvalid
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-[#79747e]/20 hover:border-[#4a4459]/30 hover:bg-[#4a4459]/5'
                    }
        `}
                onClick={() => !isInvalid && handleSelectProject(project)}
                role='button'
                tabIndex={0}
                aria-label={`プロジェクト ${project.name} を選択`}
                onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isInvalid) {
                        e.preventDefault();
                        handleSelectProject(project);
                    }
                }}
            >
                <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                            <h3
                                className={`font-medium text-sm truncate ${isSelected ? 'text-white' : isInvalid ? 'text-red-700' : 'text-[#4a4459]'
                                    }`}
                                title={project.name}
                            >
                                {project.name}
                            </h3>
                            {isSelected && (
                                <span
                                    className='bg-white/20 text-white px-2 py-0.5 rounded text-xs font-medium'
                                    aria-label='現在選択中'
                                >
                                    選択中
                                </span>
                            )}
                            {isInvalid && (
                                <span
                                    className='bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium'
                                    aria-label='無効なプロジェクト'
                                >
                                    無効
                                </span>
                            )}
                        </div>
                        <p
                            className={`text-xs mt-1 truncate ${isSelected ? 'text-white/80' : isInvalid ? 'text-red-600' : 'text-[#79747e]'
                                }`}
                            title={project.path}
                        >
                            {project.path}
                        </p>
                        {project.lastAccessedAt && (
                            <p
                                className={`text-xs mt-1 ${isSelected ? 'text-white/60' : isInvalid ? 'text-red-500' : 'text-[#79747e]/70'
                                    }`}
                            >
                                最終アクセス: {new Date(project.lastAccessedAt).toLocaleDateString('ja-JP')}
                            </p>
                        )}
                    </div>
                    <Button
                        variant='ghost'
                        size='sm'
                        className={`
              ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity
              ${isSelected ? 'text-white hover:bg-white/20' : 'text-red-600 hover:bg-red-100'}
            `}
                        onClick={e => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                        }}
                        aria-label={`プロジェクト ${project.name} を削除`}
                    >
                        ×
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className='h-full flex flex-col bg-white border-r border-[#79747e]/20'>
            {/* ヘッダー */}
            <div className='p-4 border-b border-[#79747e]/20'>
                <div className='flex items-center justify-between'>
                    <h2 className='font-bold text-lg text-[#4a4459]'>プロジェクト</h2>
                    <Button
                        size='sm'
                        onClick={onAddProject}
                        className='bg-[#4a4459] hover:bg-[#4a4459]/90 text-white'
                        aria-label='新しいプロジェクトを追加'
                    >
                        + 追加
                    </Button>
                </div>
            </div>

            {/* プロジェクト一覧 */}
            <div className='flex-1 overflow-hidden'>
                <ScrollArea className='h-full'>
                    <div className='p-4 space-y-3'>
                        {state.isLoading ? (
                            <div className='text-center py-8'>
                                <div className='text-[#79747e]'>読み込み中...</div>
                            </div>
                        ) : state.error ? (
                            <div className='text-center py-8'>
                                <div className='text-red-600 text-sm mb-2'>{state.error}</div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={loadProjects}
                                    className='text-[#4a4459] border-[#79747e]/30'
                                >
                                    再試行
                                </Button>
                            </div>
                        ) : state.projects.length === 0 ? (
                            <div className='text-center py-8'>
                                <div className='text-[#79747e] text-sm mb-4'>プロジェクトが登録されていません</div>
                                <Button
                                    size='sm'
                                    onClick={onAddProject}
                                    className='bg-[#4a4459] hover:bg-[#4a4459]/90 text-white'
                                >
                                    最初のプロジェクトを追加
                                </Button>
                            </div>
                        ) : (
                            <div className='space-y-3 group'>{state.projects.map(renderProjectItem)}</div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* フッター */}
            <div className='p-4 border-t border-[#79747e]/20'>
                <div className='text-xs text-[#79747e] text-center'>
                    {state.projects.length > 0 && (
                        <>
                            {state.projects.length} 個のプロジェクト
                            {state.projects.filter(p => !p.isValid).length > 0 && (
                                <span className='text-red-600 ml-2'>
                                    ({state.projects.filter(p => !p.isValid).length} 個が無効)
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
