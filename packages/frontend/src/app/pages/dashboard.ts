import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Sidebar } from "../components/sidebar";

@Component({
  selector: "app-dashboard",
  imports: [Sidebar],
  template: `
    <div class="flex h-full">
      <app-sidebar />
      <main class="flex-1 overflow-y-auto p-6">
        @if (selectedProjectId()) {
          <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">
              プロジェクト詳細
            </h1>
            <div class="bg-gray-50 p-4 rounded-md">
              <p class="text-sm text-gray-600 mb-2">プロジェクトID:</p>
              <p class="font-mono text-sm bg-white p-2 rounded border">
                {{ selectedProjectId() }}
              </p>
            </div>
          </div>
        } @else {
          <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">
              ダッシュボード
            </h1>
            <p class="text-gray-600">
              左のサイドバーからプロジェクトを選択してください。
            </p>
          </div>
        }
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class dashbaord implements OnInit {
  private route = inject(ActivatedRoute);

  selectedProjectId = signal<string | null>(null);

  ngOnInit() {
    // ルートパラメータの変更を監視
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      this.selectedProjectId.set(id);
    });
  }
}
