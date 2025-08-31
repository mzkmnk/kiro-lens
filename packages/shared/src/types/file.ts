export interface FileTreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileTreeNode[];
    size?: number;
    lastModified?: Date;
}