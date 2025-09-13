import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";

interface Project {
  id: string;
  name: string;
}

@Component({
  selector: "app-sidebar",
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

  selectedProjectId = signal<string | null>(null);

  projects = signal<Project[]>([
    { id: "d4598392-bb2e-48bc-ab5b-69d5b366ef41", name: "プロジェクト 1" },
    { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "プロジェクト 2" },
    { id: "f9e8d7c6-b5a4-9382-7160-5948372615ab", name: "プロジェクト 3" },
    { id: "12345678-9abc-def0-1234-56789abcdef0", name: "プロジェクト 4" },
    { id: "abcdef01-2345-6789-abcd-ef0123456789", name: "プロジェクト 5" },
    { id: "98765432-10ab-cdef-9876-543210abcdef", name: "プロジェクト 6" },
    { id: "fedcba09-8765-4321-fedc-ba0987654321", name: "プロジェクト 7" },
    { id: "11111111-2222-3333-4444-555555555555", name: "プロジェクト 8" },
    { id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", name: "プロジェクト 9" },
    { id: "99999999-8888-7777-6666-555555555555", name: "プロジェクト 10" },
    { id: "zzzzzzzz-yyyy-xxxx-wwww-vvvvvvvvvvvv", name: "プロジェクト 11" },
    { id: "qqqqqqqq-wwww-eeee-rrrr-tttttttttttt", name: "プロジェクト 12" },
    { id: "asdfghjk-lzxc-vbnm-qwer-tyuiopasdfgh", name: "プロジェクト 13" },
    { id: "poiuytre-wqas-dfgh-jklz-xcvbnmpoiuyt", name: "プロジェクト 14" },
    { id: "mnbvcxza-sdfg-hjkl-poiu-ytrewqasdfgh", name: "プロジェクト 15" },
    { id: "lkjhgfds-apoiu-ytre-wqzx-cvbnmlkjhgf", name: "プロジェクト 16" },
    { id: "qazwsxed-crfv-tgby-hnuj-mikolpqazwsx", name: "プロジェクト 17" },
    { id: "plokijuh-ygtr-edcv-frbg-tnhymjukilop", name: "プロジェクト 18" },
    { id: "xswzaqed-cvfr-tgby-hnuj-mikolpxswzaq", name: "プロジェクト 19" },
    { id: "cdefghij-klmn-opqr-stuv-wxyzabcdefgh", name: "プロジェクト 20" },
  ]);

  navigateToProject(projectId: string) {
    this.selectedProjectId.set(projectId);
    this.router.navigate(["/dashboard", projectId]);
  }
}
