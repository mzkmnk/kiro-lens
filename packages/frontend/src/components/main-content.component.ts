import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
} from "@angular/core";
import type { ProjectInfo } from "@kiro-lens/shared";
import { NgIconComponent } from "@ng-icons/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { SkeletonModule } from "primeng/skeleton";

@Component({
  selector: "app-main-content",
  imports: [CardModule, SkeletonModule, ButtonModule, NgIconComponent],
  template: `
    <div class="h-full p-4 md:p-6 bg-gray-50">
      @if (isLoading) {
        <!-- Loading State -->
        <div
          class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
        >
          @for (item of [1, 2, 3]; track item) {
            <p-card class="h-48">
              <ng-template pTemplate="content">
                <div class="space-y-3">
                  <p-skeleton height="1.5rem" width="70%"></p-skeleton>
                  <p-skeleton height="1rem" width="100%"></p-skeleton>
                  <p-skeleton height="1rem" width="80%"></p-skeleton>
                  <p-skeleton
                    height="2rem"
                    width="40%"
                    class="mt-4"
                  ></p-skeleton>
                </div>
              </ng-template>
            </p-card>
          }
        </div>
      } @else if (selectedProject) {
        <!-- Selected Project Content -->
        <div class="max-w-4xl mx-auto">
          <p-card class="mb-6">
            <ng-template pTemplate="header">
              <div class="p-6 pb-0">
                <div class="flex items-center gap-3 mb-2">
                  <ng-icon
                    name="heroFolder"
                    class="text-blue-600"
                    size="24"
                  ></ng-icon>
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ selectedProject?.name }}
                  </h1>
                  @if (selectedProject?.isValid) {
                    <span
                      class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                    >
                      有効
                    </span>
                  } @else {
                    <span
                      class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                    >
                      無効
                    </span>
                  }
                </div>
                <p
                  class="text-gray-600 text-sm font-mono bg-gray-100 px-3 py-2 rounded"
                >
                  {{ selectedProject?.path }}
                </p>
              </div>
            </ng-template>

            <ng-template pTemplate="content">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- File Management Card -->
                <div
                  class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <ng-icon
                      name="heroDocument"
                      class="text-green-600"
                      size="20"
                    ></ng-icon>
                    <h3 class="font-semibold text-gray-900">ファイル管理</h3>
                  </div>
                  <p class="text-sm text-gray-600 mb-4">
                    プロジェクト内のファイルを閲覧・編集できます
                  </p>
                  <p-button
                    label="ファイルを表示"
                    size="small"
                    severity="success"
                    [disabled]="!selectedProject?.isValid"
                    (onClick)="onViewFiles()"
                  >
                  </p-button>
                </div>

                <!-- Project Settings Card -->
                <div
                  class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <ng-icon
                      name="heroHome"
                      class="text-blue-600"
                      size="20"
                    ></ng-icon>
                    <h3 class="font-semibold text-gray-900">
                      プロジェクト設定
                    </h3>
                  </div>
                  <p class="text-sm text-gray-600 mb-4">
                    プロジェクトの設定を変更できます
                  </p>
                  <p-button
                    label="設定を開く"
                    size="small"
                    severity="info"
                    [disabled]="!selectedProject?.isValid"
                    (onClick)="onOpenSettings()"
                  >
                  </p-button>
                </div>

                <!-- Statistics Card -->
                <div
                  class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <ng-icon
                      name="heroDocument"
                      class="text-purple-600"
                      size="20"
                    ></ng-icon>
                    <h3 class="font-semibold text-gray-900">統計情報</h3>
                  </div>
                  <p class="text-sm text-gray-600 mb-4">
                    プロジェクトの統計情報を表示します
                  </p>
                  <p-button
                    label="統計を表示"
                    size="small"
                    severity="secondary"
                    [disabled]="!selectedProject?.isValid"
                    (onClick)="onViewStats()"
                  >
                  </p-button>
                </div>
              </div>
            </ng-template>
          </p-card>

          <!-- Additional Info -->
          @if (!selectedProject?.isValid) {
            <p-card severity="warn" class="mt-4">
              <ng-template pTemplate="content">
                <div class="flex items-center gap-3">
                  <ng-icon
                    name="heroFolder"
                    class="text-orange-600"
                    size="20"
                  ></ng-icon>
                  <div>
                    <h4 class="font-semibold text-orange-800 mb-1">
                      プロジェクトパスが無効です
                    </h4>
                    <p class="text-sm text-orange-700">
                      指定されたパスが存在しないか、アクセスできません。パスを確認してください。
                    </p>
                  </div>
                </div>
              </ng-template>
            </p-card>
          }
        </div>
      } @else {
        <!-- Welcome State -->
        <div class="flex items-center justify-center h-full">
          <div class="text-center max-w-md mx-auto">
            <ng-icon
              name="heroHome"
              class="text-gray-400 mx-auto mb-6"
              size="64"
            ></ng-icon>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Kiro Lens へようこそ
            </h2>
            <p class="text-gray-600 mb-8">
              左側のサイドバーからプロジェクトを選択して、ファイル管理を開始してください。
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div class="p-4 bg-blue-50 rounded-lg">
                <ng-icon
                  name="heroFolder"
                  class="text-blue-600 mx-auto mb-2"
                  size="24"
                ></ng-icon>
                <h3 class="font-semibold text-blue-900 mb-1">
                  プロジェクト管理
                </h3>
                <p class="text-blue-700">複数のプロジェクトを効率的に管理</p>
              </div>
              <div class="p-4 bg-green-50 rounded-lg">
                <ng-icon
                  name="heroDocument"
                  class="text-green-600 mx-auto mb-2"
                  size="24"
                ></ng-icon>
                <h3 class="font-semibold text-green-900 mb-1">ファイル編集</h3>
                <p class="text-green-700">ブラウザ上でファイルを直接編集</p>
              </div>
              <div class="p-4 bg-purple-50 rounded-lg">
                <ng-icon
                  name="heroHome"
                  class="text-purple-600 mx-auto mb-2"
                  size="24"
                ></ng-icon>
                <h3 class="font-semibold text-purple-900 mb-1">
                  リアルタイム同期
                </h3>
                <p class="text-purple-700">変更をリアルタイムで反映</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainContentComponent {
  // Input properties using @Input() decorator (temporary for testing compatibility)
  @Input() selectedProject: ProjectInfo | null = null;
  @Input() isLoading: boolean = false;

  // Computed properties
  protected readonly hasValidProject = computed(
    () => this.selectedProject?.isValid ?? false,
  );

  protected onViewFiles(): void {
    console.log("ファイル表示機能は今後実装予定");
  }

  protected onOpenSettings(): void {
    console.log("設定機能は今後実装予定");
  }

  protected onViewStats(): void {
    console.log("統計機能は今後実装予定");
  }
}
