import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectsStore } from '../stores/projects-store';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  template: `
    <div class="w-72 border-r border-gray-200 h-full flex flex-col bg-gray-50">
      <div class="flex-1 overflow-y-auto px-4 py-3">
        <div class="space-y-2">
          @for (project of projects(); track project.id) {
            <div
              class="px-3 py-2 text-sm text-gray-700 rounded-md cursor-pointer transition-colors"
              [class.hover:bg-gray-100]="selectedProjectId() !== project.id"
              [class.bg-gray-200]="selectedProjectId() === project.id"
              [class.text-gray-900]="selectedProjectId() === project.id"
              [class.font-medium]="selectedProjectId() === project.id"
              (click)="navigateToProject(project.id)"
            >
              {{ project.name }}
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

  projects = this.projectsStore.projects;

  selectedProjectId = this.projectsStore.selectedProjectId;

  navigateToProject(projectId: string) {
    this.projectsStore.setSelectedProjectId(projectId);
    this.router.navigate(['/dashboard', projectId]);
  }
}
