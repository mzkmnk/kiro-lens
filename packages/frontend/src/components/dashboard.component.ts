import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { NgIconComponent } from "@ng-icons/core";
import { ButtonModule } from "primeng/button";
import { PanelModule } from "primeng/panel";
import { SplitterModule } from "primeng/splitter";
import { ConfigService } from "../services/config.service";
import { ProjectService } from "../services/project.service";

@Component({
  selector: "app-dashboard",
  imports: [SplitterModule, PanelModule, ButtonModule, NgIconComponent],
  template: `
    <div class="h-screen flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <ng-icon name="heroHome" class="text-blue-600" size="24"></ng-icon>
            <h1 class="text-xl font-semibold text-gray-800">
              {{ title() }}
            </h1>
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              v{{ version() }}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">
              プロジェクト: {{ selectedProjectCount() }}
            </span>
            @if (hasKiroDir()) {
              <span
                class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded"
              >
                .kiro 検出済み
              </span>
            } @else {
              <span
                class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded"
              >
                .kiro 未検出
              </span>
            }
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden">
        <p-splitter
          [style]="{ height: '100%' }"
          [panelSizes]="[25, 75]"
          [minSizes]="[200, 400]"
          layout="horizontal"
          styleClass="h-full"
        >
          <!-- Left Panel - Project Sidebar -->
          <ng-template pTemplate="panel">
            <p-panel
              header="プロジェクト管理"
              [toggleable]="false"
              styleClass="h-full border-0 shadow-none"
            >
              <ng-template pTemplate="content">
                <div class="p-4 h-full overflow-y-auto">
                  <!-- Project List -->
                  <div class="space-y-2">
                    @if (projects().length === 0) {
                      <div class="text-center py-8">
                        <ng-icon
                          name="heroFolder"
                          class="text-gray-400 mx-auto mb-2"
                          size="32"
                        ></ng-icon>
                        <p class="text-sm text-gray-500 mb-4">
                          プロジェクトが登録されていません
                        </p>
                        <p-button
                          label="プロジェクトを追加"
                          icon="pi pi-plus"
                          size="small"
                          (onClick)="onAddProject()"
                          styleClass="w-full"
                        >
                        </p-button>
                      </div>
                    } @else {
                      <div class="mb-4">
                        <p-button
                          label="プロジェクトを追加"
                          icon="pi pi-plus"
                          size="small"
                          (onClick)="onAddProject()"
                          styleClass="w-full"
                        >
                        </p-button>
                      </div>
                      @for (project of projects(); track project.id) {
                        <div
                          class="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          [class.bg-blue-50]="
                            project.id === selectedProject()?.id
                          "
                          [class.border-blue-200]="
                            project.id === selectedProject()?.id
                          "
                        >
                          <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                              <h3
                                class="text-sm font-medium text-gray-900 truncate"
                              >
                                {{ project.name }}
                              </h3>
                              <p class="text-xs text-gray-500 truncate">
                                {{ project.path }}
                              </p>
                            </div>
                            <div class="flex items-center space-x-1 ml-2">
                              @if (project.id !== selectedProject()?.id) {
                                <p-button
                                  icon="pi pi-check"
                                  size="small"
                                  severity="success"
                                  [text]="true"
                                  (onClick)="onSelectProject(project.id)"
                                  pTooltip="選択"
                                >
                                </p-button>
                              }
                              <p-button
                                icon="pi pi-trash"
                                size="small"
                                severity="danger"
                                [text]="true"
                                (onClick)="onRemoveProject(project.id)"
                                pTooltip="削除"
                              >
                              </p-button>
                            </div>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              </ng-template>
            </p-panel>
          </ng-template>

          <!-- Right Panel - Main Content -->
          <ng-template pTemplate="panel">
            <p-panel
              header="メインコンテンツ"
              [toggleable]="false"
              styleClass="h-full border-0 shadow-none"
            >
              <ng-template pTemplate="content">
                <div class="p-6 h-full overflow-y-auto">
                  @if (selectedProject()) {
                    <div class="text-center py-12">
                      <ng-icon
                        name="heroDocumentText"
                        class="text-blue-600 mx-auto mb-4"
                        size="48"
                      ></ng-icon>
                      <h2 class="text-xl font-semibold text-gray-800 mb-2">
                        {{ selectedProject()?.name }}
                      </h2>
                      <p class="text-gray-600 mb-4">
                        {{ selectedProject()?.path }}
                      </p>
                      <p class="text-sm text-gray-500">
                        ファイルツリー機能は今後実装予定です
                      </p>
                    </div>
                  } @else {
                    <div class="text-center py-12">
                      <ng-icon
                        name="heroHome"
                        class="text-gray-400 mx-auto mb-4"
                        size="48"
                      ></ng-icon>
                      <h2 class="text-xl font-semibold text-gray-800 mb-2">
                        Kiro Lens へようこそ
                      </h2>
                      <p class="text-gray-600 mb-6">
                        プロジェクトを選択してファイル管理を開始してください
                      </p>
                      @if (projects().length === 0) {
                        <p-button
                          label="最初のプロジェクトを追加"
                          icon="pi pi-plus"
                          (onClick)="onAddProject()"
                        >
                        </p-button>
                      }
                    </div>
                  }
                </div>
              </ng-template>
            </p-panel>
          </ng-template>
        </p-splitter>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly configService = inject(ConfigService);

  // Signals
  protected readonly title = signal("Kiro Lens");
  protected readonly version = signal("1.0.0");
  protected readonly isAddingProject = signal(false);

  // Computed signals
  protected readonly projects = computed(() => this.projectService.projects());
  protected readonly selectedProject = computed(() =>
    this.projectService.selectedProject(),
  );
  protected readonly hasKiroDir = computed(() =>
    this.configService.hasKiroDir(),
  );
  protected readonly selectedProjectCount = computed(
    () => this.projects().length,
  );

  async ngOnInit(): Promise<void> {
    await this.loadInitialData();
  }

  protected onAddProject(): void {
    this.isAddingProject.set(true);
    // TODO: PathInputコンポーネント実装後に実際の追加処理を実装
    console.log("プロジェクト追加機能は今後実装予定");
    this.isAddingProject.set(false);
  }

  protected async onSelectProject(projectId: string): Promise<void> {
    await this.projectService.selectProject(projectId);
  }

  protected async onRemoveProject(projectId: string): Promise<void> {
    if (confirm("このプロジェクトを削除しますか？")) {
      await this.projectService.removeProject(projectId);
    }
  }

  private async loadInitialData(): Promise<void> {
    await this.projectService.loadProjects();
  }
}
