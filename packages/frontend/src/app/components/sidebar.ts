import { Component } from "@angular/core";

@Component({
  selector: "app-sidebar",
  template: `
    <div class="w-74 border-r-2 h-full flex flex-col">
      <div class="flex-1 overflow-y-auto px-4 py-2"></div>
    </div>
  `,
})
export class Sidebar {}
