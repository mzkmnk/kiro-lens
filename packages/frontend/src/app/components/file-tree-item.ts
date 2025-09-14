import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FileItem } from '@kiro-lens/shared';

@Component({
  selector: 'app-file-tree-item',
  imports: [CommonModule],
  template: `
    <div>
      <!-- アイテム本体 -->
      <div
        class="flex items-center py-1 px-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer transition-colors"
        [style.padding-left.px]="depth() * 16 + 8"
        (click)="onItemClick()"
      >
        <!-- 展開/折りたたみアイコンスペース（全アイテム共通の固定幅） -->
        <div
          class="w-4 h-4 mr-2 flex items-center justify-center flex-shrink-0"
        >
          @if (hasChildren()) {
            @if (isExpanded()) {
              <!-- 下向き矢印（展開状態） -->
              <svg
                class="w-3 h-3"
                width="12"
                height="12"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            } @else {
              <!-- 右向き矢印（折りたたみ状態） -->
              <svg
                class="w-3 h-3"
                width="12"
                height="12"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            }
          }
        </div>

        <!-- ファイル/フォルダアイコン -->
        @if (item().type === 'folder') {
          <svg
            class="w-4 h-4 mr-2 text-blue-500 flex-shrink-0"
            width="16"
            height="16"
            style="min-width: 16px; min-height: 16px;"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            ></path>
          </svg>
        } @else {
          <svg
            class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
            width="16"
            height="16"
            style="min-width: 16px; min-height: 16px;"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clip-rule="evenodd"
            ></path>
          </svg>
        }

        <!-- ファイル/フォルダ名 -->
        <span class="truncate">{{ item().name }}</span>
      </div>

      <!-- 子要素（展開時のみ表示） -->
      @if (hasChildren() && isExpanded()) {
        @for (child of item().children; track child.id) {
          <app-file-tree-item
            [item]="child"
            [depth]="depth() + 1"
            [expandedItems]="expandedItems()"
            (toggleExpanded)="toggleExpanded.emit($event)"
          />
        }
      }
    </div>
  `,
})
export class FileTreeItemComponent {
  // Input signals
  item = input.required<FileItem>();
  depth = input.required<number>();
  expandedItems = input.required<Set<string>>();

  // Output events
  toggleExpanded = output<string>();

  hasChildren(): boolean {
    const fileItem = this.item();
    return (
      fileItem.type === 'folder' &&
      fileItem.children !== undefined &&
      fileItem.children.length > 0
    );
  }

  isExpanded(): boolean {
    return this.expandedItems().has(this.item().id);
  }

  onItemClick(): void {
    if (this.hasChildren()) {
      this.toggleExpanded.emit(this.item().id);
    }
  }
}
