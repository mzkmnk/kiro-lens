import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronRight,
  heroFolder,
  heroDocument,
} from '@ng-icons/heroicons/outline';
import { FileItem } from '@kiro-lens/shared';

@Component({
  selector: 'app-file-tree-item',
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronRight,
      heroFolder,
      heroDocument,
    }),
  ],
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
              <ng-icon name="heroChevronDown" class="w-3 h-3 text-gray-600" />
            } @else {
              <!-- 右向き矢印（折りたたみ状態） -->
              <ng-icon name="heroChevronRight" class="w-3 h-3 text-gray-600" />
            }
          }
        </div>

        <!-- ファイル/フォルダアイコン -->
        @if (item().type === 'folder') {
          <ng-icon
            name="heroFolder"
            class="w-4 h-4 mr-2 text-blue-500 flex-shrink-0"
          />
        } @else {
          <ng-icon
            name="heroDocument"
            class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"
          />
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
