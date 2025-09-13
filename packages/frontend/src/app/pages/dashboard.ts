import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Sidebar } from "../components/sidebar";

@Component({
  selector: "app-dashboard",
  imports: [Sidebar],
  template: `
    <div class="flex h-full">
      <app-sidebar />
      <main class="flex-1 overflow-y-auto">
        <!-- メインコンテンツエリア -->
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class dashbaord {}
