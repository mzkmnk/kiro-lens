import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Sidebar } from '../components/sidebar';
import { ProjectsStore } from '../stores/projects-store';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, InputTextModule, FormsModule, ButtonModule],
  template: `
    <div class="flex h-full">
      <app-sidebar />
      <main class="flex-1 overflow-y-auto p-6">
        @let project = selectedProject();

        @if (project) {
          <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">
              プロジェクト詳細
            </h1>
            <div class="bg-gray-50 p-4 rounded-md">
              <p class="text-sm text-gray-600 mb-2">プロジェクトID:</p>
              <p class="font-mono text-sm bg-white p-2 rounded border">
                {{ project.id }}
              </p>
            </div>
          </div>
        } @else {
          <div class="h-full flex flex-col justify-center items-center">
            <div class="w-8/12 flex flex-col justify-center items-center gap-4">
              <input
                class="w-full"
                type="text"
                pInputText
                [(ngModel)]="inputPath"
              />
              <p-button
                class="self-end"
                label="submit"
                size="small"
                (onClick)="addProject()"
              />
            </div>
          </div>
        }
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class dashbaord {
  private projectsStore = inject(ProjectsStore);

  selectedProject = this.projectsStore.selectedProject;

  inputPath = model<string>('');

  addProject(): void {
    this.projectsStore.addProject({
      path: this.inputPath(),
    });
  }
}
