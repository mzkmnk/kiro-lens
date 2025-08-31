// 共通型定義のエクスポート（最低限）
export interface FileTreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
}