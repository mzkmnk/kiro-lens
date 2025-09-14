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
                class="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer transition-colors"
                [class.hover:bg-gray-100]="!isSelectedProject(project.id)"
                [class.bg-gray-200]="isSelectedProject(project.id)"
                [class.text-gray-900]="isSelectedProject(project.id)"
                [class.font-medium]="isSelectedProject(project.id)"
              >
                <!-- 展開/折りたたみアイコン -->
                <div
                  class="w-4 h-4 mr-2 flex items-center justify-center flex-shrink-0"
                  (click)="toggleProject(project.id); $event.stopPropagation()"
                >
                  @if (isProjectExpanded(project.id)) {
                    <!-- 下向き矢印（展開状態） -->
                    <svg
                      class="w-3 h-3"
                      width="12"
                      height="12"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  } @else {
                    <!-- 右向き矢印（折りたたみ状態） -->
                    <svg
                      class="w-3 h-3"
                      width="12"
                      height="12"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  }
                </div>

                <!-- プロジェクト名（クリックでナビゲート） -->
                <span
                  class="flex-1 truncate"
                  (click)="navigateToProject(project.id)"
                >
                  {{ project.name }}
                </span>
              </div>

              <!-- プロジェクトのファイルツリー（展開時のみ表示） -->
              @if (isProjectExpanded(project.id)) {
                @for (item of getProjectFiles(project.id); track item.id) {
                  <app-file-tree-item
                    [item]="item"
                    [depth]="0"
                    [expandedItems]="expandedItems()"
                    (toggleExpanded)="toggleExpanded($event)"
                  />
                }
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
  expandedProjects = signal<Set<string>>(new Set());

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
        // 選択されたプロジェクトを自動的に展開
        this.expandProject(project.id);
      }
    });

    // 展開されたプロジェクトのファイルツリーを取得
    effect(() => {
      const expandedProjects = this.expandedProjects();
      expandedProjects.forEach((projectId) => {
        this.fileTreeStore.getFileTree({ projectId });
      });
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

  isProjectExpanded(projectId: string): boolean {
    return this.expandedProjects().has(projectId);
  }

  toggleProject(projectId: string): void {
    const expanded = this.expandedProjects();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }

    this.expandedProjects.set(newExpanded);
  }

  expandProject(projectId: string): void {
    const expanded = this.expandedProjects();
    const newExpanded = new Set(expanded);
    newExpanded.add(projectId);
    this.expandedProjects.set(newExpanded);
  }
}
