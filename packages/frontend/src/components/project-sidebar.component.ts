import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { NgIconComponent } from "@ng-icons/core";
import type { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { TooltipModule } from "primeng/tooltip";
import { TreeModule } from "primeng/tree";
import { ProjectService } from "../services/project.service";

@Component({
  selector: "app-project-sidebar",
  imports: [
    TreeModule,
    ButtonModule,
    MenuModule,
    NgIconComponent,
    TooltipModule,
  ],
  template: `
    <div class="h-full flex flex-col bg-white border-r border-gray-200">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <h2
            class="text-lg font-semibold text-gray-800 flex items-center gap-2"
          >
            <ng-icon
              name="heroFolder"
              class="text-blue-600"
              size="20"
            ></ng-icon>
            プロジェクト
          </h2>
          <p-button
            icon="pi pi-plus"
            size="small"
            severity="success"
            [text]="true"
            (onClick)="onAddProject()"
            pTooltip="プロジェクトを追加"
            tooltipPosition="bottom"
          >
          </p-button>
        </div>

        <!-- Project Count -->
        <div class="text-xs text-gray-500">
          {{ projectCount() }} 個のプロジェクト
        </div>
      </div>

      <!-- Project List -->
      <div class="flex-1 overflow-y-auto p-2">
        @if (projects().length === 0) {
          <div class="text-center py-8">
            <ng-icon
              name="heroFolder"
              class="text-gray-400 mx-auto mb-3"
              size="32"
            ></ng-icon>
            <p class="text-sm text-gray-500 mb-4">プロジェクトを追加</p>
            <p-button
              label="追加"
              icon="pi pi-plus"
              size="small"
              (onClick)="onAddProject()"
              class="w-full"
            >
            </p-button>
          </div>
        } @else {
          <div class="space-y-1">
            @for (project of projects(); track project.id) {
              <div
                class="group p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer"
                [class.bg-blue-50]="project.id === selectedProject()?.id"
                [class.border-blue-200]="project.id === selectedProject()?.id"
                [class.shadow-sm]="project.id === selectedProject()?.id"
                [class.bg-white]="project.id !== selectedProject()?.id"
                [class.border-gray-200]="project.id !== selectedProject()?.id"
                [class.hover:bg-gray-50]="project.id !== selectedProject()?.id"
                (click)="onSelectProject(project.id)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      @if (project.isValid) {
                        <ng-icon
                          name="heroFolder"
                          class="text-green-600 flex-shrink-0"
                          size="16"
                        ></ng-icon>
                      } @else {
                        <ng-icon
                          name="heroFolder"
                          class="text-red-600 flex-shrink-0"
                          size="16"
                        ></ng-icon>
                      }
                      <h3
                        class="text-sm font-medium text-gray-900 truncate"
                        [class.text-blue-700]="
                          project.id === selectedProject()?.id
                        "
                      >
                        {{ project.name }}
                      </h3>
                      @if (project.id === selectedProject()?.id) {
                        <ng-icon
                          name="heroCheck"
                          class="text-blue-600 flex-shrink-0"
                          size="14"
                        ></ng-icon>
                      }
                    </div>
                    <p
                      class="text-xs text-gray-500 truncate"
                      [title]="project.path"
                    >
                      {{ project.path }}
                    </p>
                    @if (!project.isValid) {
                      <p class="text-xs text-red-600 mt-1">無効なパス</p>
                    }
                  </div>

                  <!-- Action Menu -->
                  <div
                    class="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <p-button
                      icon="pi pi-ellipsis-v"
                      size="small"
                      [text]="true"
                      severity="secondary"
                      (onClick)="onShowMenu($event, project.id)"
                      pTooltip="メニュー"
                      tooltipPosition="left"
                    >
                    </p-button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Context Menu -->
      <p-menu #menu [model]="menuItems()" [popup]="true"></p-menu>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSidebarComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  // Signals
  private readonly selectedProjectId = signal<string | null>(null);

  // Computed signals
  protected readonly projects = computed(() => this.projectService.projects());
  protected readonly selectedProject = computed(() =>
    this.projectService.selectedProject(),
  );
  protected readonly projectCount = computed(() => this.projects().length);
  protected readonly menuItems = computed((): MenuItem[] => [
    {
      label: "選択",
      icon: "pi pi-check",
      command: () => this.selectCurrentProject(),
      visible: this.selectedProjectId() !== this.selectedProject()?.id,
    },
    {
      label: "削除",
      icon: "pi pi-trash",
      command: () => this.removeCurrentProject(),
      styleClass: "text-red-600",
    },
  ]);

  async ngOnInit(): Promise<void> {
    await this.projectService.loadProjects();
  }

  protected onAddProject(): void {
    // TODO: PathInputコンポーネント実装後に実際の追加処理を実装
    console.log("プロジェクト追加機能は今後実装予定");
  }

  protected async onSelectProject(projectId: string): Promise<void> {
    if (projectId !== this.selectedProject()?.id) {
      await this.projectService.selectProject(projectId);
    }
  }

  protected onShowMenu(event: Event, projectId: string): void {
    event.stopPropagation();
    this.selectedProjectId.set(projectId);
    // メニューを表示（PrimeNG Menuの実装に依存）
  }

  private async selectCurrentProject(): Promise<void> {
    const projectId = this.selectedProjectId();
    if (projectId) {
      await this.projectService.selectProject(projectId);
    }
  }

  private async removeCurrentProject(): Promise<void> {
    const projectId = this.selectedProjectId();
    if (projectId && confirm("このプロジェクトを削除しますか？")) {
      await this.projectService.removeProject(projectId);
    }
  }
}
