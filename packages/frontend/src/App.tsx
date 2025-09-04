import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';

// ファイルツリーのモックデータ
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'specs',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'kiro-lens-foundation',
        type: 'folder',
        children: [
          { id: '3', name: 'design.md', type: 'file' },
          { id: '4', name: 'requirements.md', type: 'file' },
          { id: '5', name: 'tasks.md', type: 'file' },
        ],
      },
      {
        id: '6',
        name: 'kiro-lens-full',
        type: 'folder',
        children: [
          { id: '7', name: 'design.md', type: 'file' },
          { id: '8', name: 'requirements.md', type: 'file' },
          { id: '9', name: 'tasks.md', type: 'file' },
        ],
      },
      {
        id: '10',
        name: 'npm-to-pnpm-migration',
        type: 'folder',
        children: [
          { id: '11', name: 'design.md', type: 'file' },
          { id: '12', name: 'requirements.md', type: 'file' },
          { id: '13', name: 'tasks.md', type: 'file' },
        ],
      },
      {
        id: '14',
        name: 'prettier-eslint-setup',
        type: 'folder',
        children: [
          { id: '15', name: 'design.md', type: 'file' },
          { id: '16', name: 'requirements.md', type: 'file' },
          { id: '17', name: 'tasks.md', type: 'file' },
        ],
      },
    ],
  },
  {
    id: '18',
    name: 'steering',
    type: 'folder',
    children: [
      { id: '19', name: 'behavior.md', type: 'file' },
      { id: '20', name: 'create-pr.md', type: 'file' },
      { id: '21', name: 'language.md', type: 'file' },
      { id: '22', name: 'product.md', type: 'file' },
      { id: '23', name: 'software-development-methodology.md', type: 'file' },
      { id: '24', name: 'structure.md', type: 'file' },
      { id: '25', name: 'tech.md', type: 'file' },
      { id: '26', name: 'testing-guidelines.md', type: 'file' },
    ],
  },
];

// ファイルツリーアイテムコンポーネント
function FileTreeItem({ item }: { item: FileItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={handleToggle} className="w-full justify-start">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
              {item.type === 'folder' && (
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              )}
            </div>
            <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
              {item.type === 'folder' ? (
                isOpen ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )
              ) : (
                <File className="h-4 w-4" />
              )}
            </div>
            <span className="truncate" title={item.name}>{item.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {item.type === 'folder' && isOpen && item.children && (
        <div className="ml-4">
          {item.children.map((child) => (
            <FileTreeItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold px-4 py-2">Kiro プロジェクト</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>.kiro ディレクトリ</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mockFiles.map((item) => (
                    <FileTreeItem key={item.id} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Kiro Lens</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                設定
              </Button>
              <Button size="sm">
                保存
              </Button>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Welcome to Kiro Lens</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border border-border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-3">プロジェクト概要</h2>
                  <p className="text-muted-foreground">
                    Kiro Lensは、開発者向けの統合開発環境です。
                  </p>
                </div>
                <div className="p-6 border border-border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-3">ファイル管理</h2>
                  <p className="text-muted-foreground">
                    左側のサイドバーからプロジェクトファイルを管理できます。
                  </p>
                </div>
                <div className="p-6 border border-border rounded-lg bg-card">
                  <h2 className="text-xl font-semibold mb-3">設定</h2>
                  <p className="text-muted-foreground">
                    右上の設定ボタンから環境設定を変更できます。
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;
