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
    <div class="flex flex-col gap-1">
      <!-- アイテム本体 -->
      <div
        class="flex items-center py-1 px-2 text-sm rounded cursor-pointer transition-colors"
        [class.text-gray-700]="!isSelected()"
        [class.hover:bg-gray-100]="!isSelected()"
        [class.bg-gray-200]="isSelected()"
        [class.text-gray-900]="isSelected()"
        [class.font-medium]="isSelected()"
        [style.padding-left.px]="depth() * 16 + 8"
        (click)="onItemClick()"
      >
        <!-- 展開/折りたたみアイコンスペース（全アイテム共通の固定幅） -->
        @if (hasChildren()) {
          <div
            class="w-4 h-4 mr-2 flex items-center justify-center flex-shrink-0"
          >
            @if (isExpanded()) {
              <!-- 下向き矢印（展開状態） -->
              <ng-icon
                name="heroChevronDown"
                class="w-3 h-3"
                [strokeWidth]="2.5"
              />
            } @else {
              <!-- 右向き矢印（折りたたみ状態） -->
              <ng-icon
                name="heroChevronRight"
                class="w-3 h-3"
                [strokeWidth]="2.5"
              />
            }
          </div>
        }

        <!-- ファイル/フォルダアイコン -->
        @if (item().type === 'folder') {
          <ng-icon
            name="heroFolder"
            class="w-4 h-4 mr-2 flex-shrink-0"
            [strokeWidth]="2.5"
          />
        } @else {
          <ng-icon
            name="heroDocument"
            class="w-4 h-4 mr-2 flex-shrink-0"
            [strokeWidth]="2.5"
          />
        }

        <!-- ファイル/フォルダ名 -->
        <p class="truncate">{{ item().name }}</p>
      </div>

      <!-- 子要素（展開時のみ表示） -->
      @if (hasChildren() && isExpanded()) {
        @for (child of item().children; track child.id) {
          <app-file-tree-item
            [item]="child"
            [depth]="depth() + 1"
            [expandedItems]="expandedItems()"
            [selectedFileId]="selectedFileId()"
            (toggleExpanded)="toggleExpanded.emit($event)"
            (fileSelected)="fileSelected.emit($event)"
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
  selectedFileId = input.required<string | null>();

  // Output events
  toggleExpanded = output<string>();
  fileSelected = output<string>();

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

  isSelected(): boolean {
    return this.selectedFileId() === this.item().id;
  }

  onItemClick(): void {
    // ファイル/フォルダを選択状態にする
    this.fileSelected.emit(this.item().id);

    // フォルダの場合は展開/折りたたみも行う
    if (this.hasChildren()) {
      this.toggleExpanded.emit(this.item().id);
    }
  }
}
