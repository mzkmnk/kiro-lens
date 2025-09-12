import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  heroDocumentText,
  heroFolder,
  heroHome,
} from "@ng-icons/heroicons/outline";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NgIconComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroHome,
      heroFolder,
      heroDocumentText,
    }),
  ],
})
export class App {
  protected readonly title = signal("Kiro Lens");
  protected readonly version = signal("Angular 20");
}
