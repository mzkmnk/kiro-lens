import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroFolder } from '@ng-icons/heroicons/outline';
import { ProjectsStore } from '../stores/projects-store';
import { FileTreeStore } from '../stores/file-tree-store';
import { FileTreeItemComponent } from './file-tree-item';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, FileTreeItemComponent, NgIconComponent],
  providers: [
    provideIcons({
      heroFolder,
    }),
  ],
  template: `
    <div class="w-72 border-r border-gray-200 h-full flex flex-col bg-gray-50">
      <div class="flex-1 overflow-y-auto px-4 py-3">
        <div class="space-y-1">
          @for (project of projects(); track project.id) {
            <div class="flex gap-1 flex-col">
              <!-- プロジェクト名 -->
              <div
                class="flex items-center py-1 px-2 text-sm rounded cursor-pointer transition-colors text-gray-700 hover:bg-gray-100"
                style="padding-left: 8px"
                (click)="navigateToProject(project.id)"
              >
                <!-- プロジェクトアイコン -->
                <ng-icon
                  name="heroFolder"
                  class="w-4 h-4 mr-2 flex-shrink-0"
                  [strokeWidth]="2.5"
                />

                <!-- プロジェクト名 -->
                <p class="truncate">{{ project.name }}</p>
              </div>

              <!-- プロジェクトのファイルツリー -->
              @for (item of getProjectFiles(project.id); track item.id) {
                <app-file-tree-item
                  [item]="item"
                  [depth]="1"
                  [expandedItems]="expandedItems()"
                  [selectedFileId]="selectedFileId()"
                  (toggleExpanded)="toggleExpanded($event)"
                  (fileSelected)="onFileSelected($event)"
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
  selectedFileId = signal<string | null>(null);

  getProjectFiles(projectId: string) {
    const files = this.fileTreeStore.projectFiles()[projectId];
    return files || [];
  }

  navigateToProject(projectId: string) {
    this.projectsStore.setSelectedProject({ projectId });
    this.selectedFileId.set(null); // プロジェクト選択時はファイル選択をクリア
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

  onFileSelected(fileId: string): void {
    this.selectedFileId.set(fileId);
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }
}
