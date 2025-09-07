import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ProjectSidebar } from './ProjectSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ApiClient } from '@/services/api';
import type { ProjectInfo, ProjectListResponse } from '@kiro-lens/shared';

// ApiClientをモック
vi.mock('@/services/api');
const mockApiClient = vi.mocked(ApiClient);

describe('ProjectSidebar', () => {
    const mockOnProjectSelect = vi.fn();
    const mockOnAddProject = vi.fn();
    const mockOnFileSelect = vi.fn();

    // テスト用のラッパーコンポーネント
    const renderWithProvider = (component: React.ReactElement) => {
        return render(
            <SidebarProvider>
                {component}
            </SidebarProvider>
        );
    };

    const mockProjects: ProjectInfo[] = [
        {
            id: '1',
            name: 'Project 1',
            path: '/path/to/project1',
            kiroPath: '/path/to/project1/.kiro',
            hasKiroDir: true,
            isValid: true,
            addedAt: '2024-01-01T00:00:00Z',
            lastAccessedAt: '2024-01-02T00:00:00Z',
        },
        {
            id: '2',
            name: 'Project 2',
            path: '/path/to/project2',
            kiroPath: '/path/to/project2/.kiro',
            hasKiroDir: true,
            isValid: false, // 無効なプロジェクト
            addedAt: '2024-01-01T00:00:00Z',
        },
    ];

    const mockProjectListResponse: ProjectListResponse = {
        projects: mockProjects,
        currentProject: mockProjects[0],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // ApiClientのモック実装
        mockApiClient.prototype.getProjects = vi.fn().mockResolvedValue(mockProjectListResponse);
        mockApiClient.prototype.selectProject = vi.fn().mockResolvedValue({
            project: mockProjects[0],
            message: 'プロジェクトを選択しました',
        });
        mockApiClient.prototype.removeProject = vi.fn().mockResolvedValue({
            message: 'プロジェクトを削除しました',
        });
    });

    test('プロジェクト一覧が表示される', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        // ローディング状態の確認
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();

        // プロジェクト一覧の表示を待機
        await waitFor(() => {
            expect(screen.getByText('Project 1')).toBeInTheDocument();
            expect(screen.getByText('Project 2')).toBeInTheDocument();
        });
    });

    test('現在選択中のプロジェクトが視覚的に識別できる', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                currentProject={mockProjects[0]}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Project 1')).toBeInTheDocument();
        });

        // 選択中のプロジェクトに「選択中」バッジが表示される
        expect(screen.getByText('選択中')).toBeInTheDocument();
    });

    test('無効なプロジェクトが視覚的に表示される', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Project 2')).toBeInTheDocument();
        });

        // 無効なプロジェクトに「無効」バッジが表示される
        expect(screen.getByText('無効')).toBeInTheDocument();
    });

    test('プロジェクト選択機能が動作する', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Project 1')).toBeInTheDocument();
        });

        // プロジェクトをクリック
        fireEvent.click(screen.getByText('Project 1'));

        await waitFor(() => {
            expect(mockApiClient.prototype.selectProject).toHaveBeenCalledWith('1');
            expect(mockOnProjectSelect).toHaveBeenCalledWith(mockProjects[0]);
        });
    });

    test('選択されたプロジェクトの.kiroファイルが表示される', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                currentProject={mockProjects[0]}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Project 1')).toBeInTheDocument();
        });

        // .kiroディレクトリの内容が表示される
        expect(screen.getByText('specs')).toBeInTheDocument();
        expect(screen.getByText('steering')).toBeInTheDocument();
    });

    test('フォルダの展開/折りたたみが動作する', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                currentProject={mockProjects[0]}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('specs')).toBeInTheDocument();
        });

        // specsフォルダをクリックして展開
        fireEvent.click(screen.getByText('specs'));

        // サブフォルダが表示される
        await waitFor(() => {
            expect(screen.getByText('kiro-lens-foundation')).toBeInTheDocument();
            expect(screen.getByText('kiro-lens-full')).toBeInTheDocument();
        });
    });

    test('ファイル選択機能が動作する', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                currentProject={mockProjects[0]}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('specs')).toBeInTheDocument();
        });

        // specsフォルダを展開
        fireEvent.click(screen.getByText('specs'));

        await waitFor(() => {
            expect(screen.getByText('kiro-lens-foundation')).toBeInTheDocument();
        });

        // kiro-lens-foundationフォルダを展開
        fireEvent.click(screen.getByText('kiro-lens-foundation'));

        await waitFor(() => {
            expect(screen.getByText('requirements.md')).toBeInTheDocument();
        });

        // ファイルをクリック
        fireEvent.click(screen.getByText('requirements.md'));

        expect(mockOnFileSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'requirements.md',
                type: 'file',
            })
        );
    });

    test('プロジェクト削除機能が動作する', async () => {
        // window.confirmをモック
        const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Project 1')).toBeInTheDocument();
        });

        // 削除ボタンをクリック（SidebarMenuActionを探す）
        const deleteButton = screen.getByRole('button', { name: /プロジェクト Project 1 を削除/ });
        fireEvent.click(deleteButton);

        // 確認ダイアログが表示される
        expect(mockConfirm).toHaveBeenCalledWith(
            expect.stringContaining('プロジェクト「Project 1」を削除しますか？')
        );

        await waitFor(() => {
            expect(mockApiClient.prototype.removeProject).toHaveBeenCalledWith('1');
        });

        mockConfirm.mockRestore();
    });

    test('プロジェクト追加ボタンが動作する', async () => {
        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Project 1')).toBeInTheDocument();
        });

        // ヘッダーの追加ボタンをクリック
        const addButtons = screen.getAllByText('追加');
        fireEvent.click(addButtons[0]);

        expect(mockOnAddProject).toHaveBeenCalled();
    });

    test('プロジェクトが0個の場合の表示', async () => {
        // 空のプロジェクト一覧を返すモック
        mockApiClient.prototype.getProjects = vi.fn().mockResolvedValue({
            projects: [],
            currentProject: undefined,
        });

        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('プロジェクトが登録されていません')).toBeInTheDocument();
            expect(screen.getByText('最初のプロジェクトを追加')).toBeInTheDocument();
        });
    });

    test('エラー状態の表示と再試行機能', async () => {
        // エラーを返すモック
        mockApiClient.prototype.getProjects = vi.fn().mockRejectedValue(
            new Error('ネットワークエラー')
        );

        renderWithProvider(
            <ProjectSidebar
                onProjectSelect={mockOnProjectSelect}
                onAddProject={mockOnAddProject}
                onFileSelect={mockOnFileSelect}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('ネットワークエラー')).toBeInTheDocument();
            expect(screen.getByText('再試行')).toBeInTheDocument();
        });

        // 再試行ボタンをクリック
        fireEvent.click(screen.getByText('再試行'));

        expect(mockApiClient.prototype.getProjects).toHaveBeenCalledTimes(2);
    });
});