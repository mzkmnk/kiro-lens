import { useState } from 'react';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { FileTreeItemProps } from '@/types/file-tree.js';
import type { FileItem } from '@shared/types/file-tree';

/**
 * ファイルツリーの個別アイテムコンポーネント
 * フォルダの展開/折りたたみとファイル選択機能を提供
 */
export function FileTreeItem({ item, onFileSelect, onFolderToggle }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (item.type === 'folder') {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      onFolderToggle?.(item, newIsOpen);
    } else {
      onFileSelect?.(item);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleToggle}
          className='w-full justify-start hover:bg-accent hover:text-accent-foreground'
        >
          <div className='flex items-center gap-2 min-w-0'>
            {/* 展開矢印（フォルダのみ） */}
            <div className='flex items-center justify-center w-4 h-4 flex-shrink-0'>
              {item.type === 'folder' && (
                <ChevronRight
                  className={`h-3 w-3 transition-transform duration-200 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              )}
            </div>

            {/* ファイル/フォルダアイコン */}
            <div className='flex items-center justify-center w-4 h-4 flex-shrink-0'>
              {item.type === 'folder' ? (
                isOpen ? (
                  <FolderOpen className='h-4 w-4 text-blue-500' />
                ) : (
                  <Folder className='h-4 w-4 text-blue-600' />
                )
              ) : (
                <File className='h-4 w-4 text-gray-500' />
              )}
            </div>

            {/* ファイル/フォルダ名 */}
            <span className='truncate text-sm' title={item.name}>
              {item.name}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* 子要素の再帰表示 */}
      {item.type === 'folder' && isOpen && item.children && (
        <div className='ml-4 border-l border-border/50 pl-2'>
          {item.children.map((child: FileItem) => (
            <FileTreeItem
              key={child.id}
              item={child}
              onFileSelect={onFileSelect}
              onFolderToggle={onFolderToggle}
            />
          ))}
        </div>
      )}
    </>
  );
}
