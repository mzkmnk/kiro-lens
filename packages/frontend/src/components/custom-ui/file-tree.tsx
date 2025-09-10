import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { FileTreeItem } from './file-tree-item';
import type { FileTreeProps } from '@/types/components.js';

/**
 * ファイルツリー全体を表示するコンポーネント
 * サイドバー内でファイル構造を階層表示
 */
export function FileTree({ items, onFileSelect, onFolderToggle }: FileTreeProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className='text-xs font-medium text-muted-foreground'>
        .kiro ディレクトリ
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <FileTreeItem
              key={item.id}
              item={item}
              onFileSelect={onFileSelect}
              onFolderToggle={onFolderToggle}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
