import type { FileItem } from '@shared/types/file-tree';

/**
 * .kiroディレクトリの構造を模擬したモックデータ
 */
export const mockFiles: FileItem[] = [
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
