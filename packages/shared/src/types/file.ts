/**
 * ファイルシステム関連の型定義
 */

export interface FileTreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileTreeNode[];
    isExpanded?: boolean;
    size?: number;
    lastModified?: Date;
    isHidden?: boolean;
}

export interface FileContent {
    path: string;
    content: string;
    type: 'markdown' | 'text' | 'json' | 'javascript' | 'typescript' | 'css' | 'html' | 'other';
    lastModified: Date;
    size: number;
    encoding: string;
    isReadable: boolean;
    isWritable: boolean;
}

export interface FileMetadata {
    path: string;
    encoding: string;
    mimeType: string;
    isReadable: boolean;
    isWritable: boolean;
    stats: {
        size: number;
        created: Date;
        modified: Date;
        accessed: Date;
    };
}

export interface MarkdownFile {
    frontMatter: Record<string, any>;
    content: string;
    rawContent: string;
    htmlContent?: string;
    tableOfContents?: TOCItem[];
}

export interface TOCItem {
    level: number;
    title: string;
    anchor: string;
    children?: TOCItem[];
}