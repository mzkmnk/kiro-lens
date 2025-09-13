import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  heroCheck,
  heroDocument,
  heroFolder,
  heroHome,
} from "@ng-icons/heroicons/outline";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NgIconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 font-noto-sans-jp">
      <!-- ヘッダー -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center gap-3">
          <ng-icon name="heroHome" class="text-blue-600" size="24" />
          <h1 class="text-xl font-semibold text-gray-900">Kiro Lens</h1>
        </div>
      </header>

      <!-- メインコンテンツ -->
      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ heroHome, heroFolder, heroDocument, heroCheck })],
})
export class App {}
