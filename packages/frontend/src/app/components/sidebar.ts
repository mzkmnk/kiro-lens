import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsStore } from '../stores/projects-store';
import { FileTreeStore } from '../stores/file-tree-store';
import { FileTreeItemComponent } from './file-tree-item';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, FileTreeItemComponent],
  template: `
    <div class="w-72 border-r border-gray-200 h-full flex flex-col bg-gray-50">
      <div class="flex-1 overflow-y-auto px-4 py-3">
        <div class="space-y-1">
          @for (project of projects(); track project.id) {
            <div>
              <!-- プロジェクト名 -->
              <div
                class="px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer transition-colors"
                [class.hover:bg-gray-100]="!isSelectedProject(project.id)"
                [class.bg-gray-200]="isSelectedProject(project.id)"
                [class.text-gray-900]="isSelectedProject(project.id)"
                [class.font-medium]="isSelectedProject(project.id)"
                (click)="navigateToProject(project.id)"
              >
                {{ project.name }}
              </div>

              <!-- プロジェクトのファイルツリー -->
              @for (item of getProjectFiles(project.id); track item.id) {
                <app-file-tree-item
                  [item]="item"
                  [depth]="0"
                  [expandedItems]="expandedItems()"
                  (toggleExpanded)="toggleExpanded($event)"
                />
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class Sidebar {
  private router = inject(Router);
  private projectsStore = inject(ProjectsStore);
  private fileTreeStore = inject(FileTreeStore);

  // プロジェクト関連
  projects = this.projectsStore.projects;
  selectedProject = this.projectsStore.selectedProject;

  // ファイルツリー関連
  expandedItems = signal<Set<string>>(new Set());

  getProjectFiles(projectId: string) {
    const files = this.fileTreeStore.projectFiles()[projectId];
    return files || [];
  }

  constructor() {
    // 選択されたプロジェクトが変更されたときにファイルツリーを取得
    effect(() => {
      const project = this.selectedProject();
      if (project) {
        this.fileTreeStore.getFileTree({ projectId: project.id });
      }
    });
  }

  isSelectedProject(projectId: string): boolean {
    return projectId === this.selectedProject()?.id;
  }

  navigateToProject(projectId: string) {
    this.projectsStore.setSelectedProject({ projectId });
    this.router.navigate(['/dashboard', projectId]);
  }

  toggleExpanded(itemId: string): void {
    const expanded = this.expandedItems();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }

    this.expandedItems.set(newExpanded);
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }
}
