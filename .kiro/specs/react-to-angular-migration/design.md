# Design Document

## Overview

kiro-lensプロジェクトのフロントエンドをReactからAngular 20に移行する。既存のFastifyバックエンドとの互換性を維持しながら、Angularの最新機能を活用した開発環境を構築する。

## Architecture

### 技術スタック

- **Angular**: 20.2+ (最新安定版)
- **TypeScript**: 5.9+ (Angular 20.2対応)
- **Angular CLI**: 20.2+ (ビルド・開発サーバー)
- **Node.js**: 22+ (最新LTS)
- **RxJS**: 7.8+ (Angular標準の非同期処理)

### UIフレームワーク

- **PrimeNG**: 20.x (Angular 20対応版)
- **Tailwind CSS**: 4.x (Angular対応設定)
- **日本語フォント**: Noto Sans JP
- **アイコン**: ng-icons (96,000+のアイコンライブラリ)

### 開発ツール

- **ESLint**: 既存ワークスペース設定を拡張 (Angular ESLint追加)
- **Prettier**: 既存ワークスペース設定を拡張 (Angular対応)
- **Vitest**: Angular 20実験的サポート (unit-test builder)
- **MSW**: 2.x (Angular Service Worker統合)

## Components and Interfaces

### コンポーネント設計

#### AppComponent (ルートコンポーネント)

```typescript
@Component({
  selector: 'app-root',
  template: '<app-dashboard></app-dashboard>',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'kiro-lens';
}
```

#### DashboardComponent

```typescript
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  selectedFile = signal<string | null>(null);

  private projectService = inject(ProjectService);
  private fileTreeService = inject(FileTreeService);
}
```

#### ProjectSidebarComponent

```typescript
@Component({
  selector: 'app-project-sidebar',
  templateUrl: './project-sidebar.component.html',
  styleUrls: ['./project-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSidebarComponent implements OnInit {
  private projectService = inject(ProjectService);

  projects = this.projectService.projects;
  selectedProject = this.projectService.selectedProject;
}
```

#### MainContentComponent

```typescript
@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainContentComponent {
  selectedFile = input<string | null>(null);
  hasKiroDir = input<boolean>(false);
}
```

### サービス設計

#### ApiService (HTTP通信)

```typescript
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // プロジェクト管理API
  getProjects(): Observable<ApiResponse<ProjectInfo[]>> {
    return this.http.get<ApiResponse<ProjectInfo[]>>(`${this.baseUrl}/api/projects`);
  }

  addProject(path: string): Observable<ApiResponse<ProjectInfo>> {
    return this.http.post<ApiResponse<ProjectInfo>>(`${this.baseUrl}/api/projects`, { path });
  }

  // ファイルツリーAPI
  getProjectFiles(projectId: number): Observable<ApiResponse<FileTreeResponse>> {
    return this.http.get<ApiResponse<FileTreeResponse>>(
      `${this.baseUrl}/api/projects/${projectId}/files`
    );
  }
}
```

#### ProjectService (状態管理)

```typescript
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiService = inject(ApiService);

  // Signalsを使用した状態管理
  private _projects = signal<ProjectInfo[]>([]);
  private _selectedProject = signal<ProjectInfo | null>(null);

  // 読み取り専用のSignals
  projects = this._projects.asReadonly();
  selectedProject = this._selectedProject.asReadonly();

  // 派生状態
  hasProjects = computed(() => this._projects().length > 0);

  loadProjects(): void {
    this.apiService.getProjects().subscribe({
      next: response => this._projects.set(response.data),
      error: error => console.error('Failed to load projects:', error),
    });
  }

  selectProject(project: ProjectInfo): void {
    this._selectedProject.set(project);
  }
}
```

## Data Models

### 共通型定義の活用

既存の`@kiro-lens/shared`パッケージの型定義を継続使用：

```typescript
// @kiro-lens/shared/types から継続使用
export interface ProjectInfo {
  id: number;
  name: string;
  path: string;
  isValid: boolean;
  lastAccessed: string;
}

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

### Angular固有型定義

```typescript
// src/app/types/angular-specific.ts
export interface ComponentState {
  loading: boolean;
  error: string | null;
}

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

// ng-icons用の型定義
export interface IconConfig {
  name: string;
  size?: string;
  color?: string;
}
```

### ng-iconsライブラリ統合

```typescript
// app.config.ts
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { heroUsers, heroHome, heroFolder } from '@ng-icons/heroicons/outline';
import { matSettings, matAdd } from '@ng-icons/material-icons/baseline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons({
      heroUsers,
      heroHome,
      heroFolder,
      matSettings,
      matAdd,
    }),
  ],
};
```

```html
<!-- コンポーネントテンプレートでの使用例 -->
<ng-icon name="heroUsers" size="24" color="currentColor"></ng-icon>
<ng-icon name="matAdd" size="20"></ng-icon>
```

## Error Handling

### エラーハンドリング戦略

#### HTTP Interceptor

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // 既存のFastify APIエラー形式に対応
        const errorMessage = error.error?.error || 'Unknown error occurred';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

#### Global Error Handler

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error:', error);
    // エラー通知サービスとの連携
  }
  }
}
```

## Testing Strategy

### テスト環境

- **Unit Tests**: Vitest (Angular 20実験的サポート)
- **Component Tests**: Angular Testing Utilities + Vitest
- **Service Tests**: HttpClientTestingModule + Vitest
- **E2E Tests**: Playwright または Cypress

### angular.json設定例

```json
{
  "projects": {
    "kiro-lens": {
      "architect": {
        "test": {
          "builder": "@angular-devkit/build-angular:vitest",
          "options": {
            "configFile": "vitest.config.ts"
          }
        }
      }
    }
  }
}
```

### vitest.config.ts設定例

```typescript
import { defineConfig } from 'vitest/config';
import { angular } from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
```

### テスト構成例

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { ProjectInfo } from '@kiro-lens/shared';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load projects', () => {
    const mockProjects: ProjectInfo[] = [
      { id: 1, name: 'Test Project', path: '/test', isValid: true, lastAccessed: '2025-01-01' },
    ];

    service.loadProjects().subscribe(projects => {
      expect(projects).toEqual(mockProjects);
    });

    const req = httpMock.expectOne('/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockProjects });
  });
});
```

### MSW統合

```typescript
// src/app/mocks/handlers.ts
export const handlers = [
  rest.get('/api/projects', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { id: 1, name: 'Mock Project', path: '/mock', isValid: true, lastAccessed: '2025-01-01' },
        ],
      })
    );
  }),
];
```

## Migration Strategy

### 段階的移行アプローチ

#### Phase 1: 環境セットアップ

1. Angular 20プロジェクト作成
2. 依存関係インストール（ng-icons、PrimeNG、Tailwind CSS）
3. 既存ESLint・Prettier設定の拡張（Angular対応）
4. Vitest設定（Angular 20実験的サポート）

#### Phase 2: 基盤コンポーネント実装

1. AppComponent
2. DashboardComponent（レイアウトのみ）
3. 基本ルーティング設定

#### Phase 3: サービス層実装

1. ApiService（HTTP通信）
2. ProjectService（状態管理）
3. エラーハンドリング

#### Phase 4: 機能コンポーネント実装

1. ProjectSidebarComponent
2. MainContentComponent
3. PathInputComponent

#### Phase 5: 統合・テスト

1. MSW統合
2. E2Eテスト
3. パフォーマンス最適化

### 並行運用期間

- React版とAngular版を並行運用
- 段階的な機能移行
- ユーザーフィードバック収集
- 最終的なReact版削除

## Performance Considerations

### 最適化戦略

- **OnPush Change Detection**: パフォーマンス向上
- **Lazy Loading**: ルートベースの遅延読み込み
- **Tree Shaking**: 未使用コードの除去
- **AOT Compilation**: 事前コンパイル

### バンドルサイズ最適化

- PrimeNG の必要コンポーネントのみインポート
- Tailwind CSS の未使用クラス除去
- 適切なコード分割

## Angular開発ガイドライン

### Angularベストプラクティス

#### コンポーネント設計

- **Single Responsibility**: 各コンポーネントは単一の責任を持つ
- **Standalone Components**: NgModulesではなくスタンドアロンコンポーネントを使用
- **OnPush Change Detection**: 全コンポーネントでChangeDetectionStrategy.OnPushを設定
- **Signals**: 状態管理にSignalsを活用、RxJSのObservableは最小限に
- **input()/output()**: デコレーターではなく関数を使用
- **Native Control Flow**: *ngIf/*ngForではなく@if/@for/@switchを使用

#### サービス設計

- **Injectable Services**: `providedIn: 'root'`で適切にDI設定
- **inject() Function**: コンストラクター注入ではなくinject()関数を使用
- **RxJS Operators**: 適切なオペレーターを使用した非同期処理
- **Error Handling**: HTTP Interceptorでの統一エラーハンドリング

#### テンプレート設計

- **Control Flow**: Angular 17+の新しい制御フロー構文を使用
- **Template Variables**: 適切な変数宣言とスコープ管理
- **Content Projection**: 再利用可能なコンポーネント設計

#### 状態管理

- **Signals**: プライマリな状態管理手法、signal()とcomputed()を活用
- **RxJS**: HTTP通信とイベント処理のみに限定、状態管理には使用しない
- **Services**: アプリケーション状態の中央管理、inject()関数を使用
- **Pure Functions**: 状態変換は純粋関数で実装、mutateは使用せずsetとupdateを使用

### 既存ワークスペース統合

#### ESLint設定拡張

```json
// eslint.config.js に追加
{
  "extends": ["@angular-eslint/recommended", "@angular-eslint/template/process-inline-templates"],
  "rules": {
    "@angular-eslint/directive-selector": [
      "error",
      { "type": "attribute", "prefix": "app", "style": "camelCase" }
    ],
    "@angular-eslint/component-selector": [
      "error",
      { "type": "element", "prefix": "app", "style": "kebab-case" }
    ]
  }
}
```

#### Prettier設定拡張

```json
// .prettierrc.js に追加
{
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

### パフォーマンス最適化

#### バンドルサイズ最適化

- **Tree Shaking**: 未使用のng-iconsアイコンセットを除去
- **Lazy Loading**: ルートベースの遅延読み込み
- **OnPush Strategy**: 変更検知の最適化

#### 開発体験向上

- **Angular DevTools**: ブラウザ拡張機能の活用
- **Strict Mode**: TypeScriptの厳密モード有効化
- **Angular Language Service**: IDE統合の活用

### テンプレート例

#### ネイティブ制御フロー使用例

```html
<!-- ProjectSidebarComponent テンプレート -->
<div class="project-sidebar">
  @if (projects().length > 0) {
  <div class="project-list">
    @for (project of projects(); track project.id) {
    <div
      class="project-item"
      [class.selected]="selectedProject()?.id === project.id"
      (click)="selectProject(project)"
    >
      <ng-icon name="heroFolder" size="16"></ng-icon>
      <span>{{ project.name }}</span>
    </div>
    }
  </div>
  } @else {
  <div class="empty-state">
    <ng-icon name="heroPlus" size="24"></ng-icon>
    <p>プロジェクトを追加</p>
  </div>
  }
</div>
```

#### Signalsとcomputed()使用例

```typescript
@Component({
  selector: 'app-project-stats',
  template: `
    <div class="stats">
      <div class="stat-item">
        <span>総プロジェクト数: {{ totalProjects() }}</span>
      </div>
      <div class="stat-item">
        <span>有効プロジェクト数: {{ validProjects() }}</span>
      </div>
      @if (selectedProjectName()) {
        <div class="stat-item">
          <span>選択中: {{ selectedProjectName() }}</span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectStatsComponent {
  private projectService = inject(ProjectService);

  // 派生状態をcomputed()で定義
  totalProjects = computed(() => this.projectService.projects().length);
  validProjects = computed(() => this.projectService.projects().filter(p => p.isValid).length);
  selectedProjectName = computed(() => this.projectService.selectedProject()?.name || null);
}
```

### PrimeNG統合例

#### PrimeNG設定

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    }),
  ],
};
```

#### 全コンポーネントでのPrimeNG積極活用例

```typescript
// DashboardComponent - PrimeNG Splitter使用
@Component({
  selector: 'app-dashboard',
  template: `
    <p-splitter [style]="{ height: '100vh' }" [panelSizes]="[20, 80]">
      <ng-template pTemplate="panel">
        <app-project-sidebar></app-project-sidebar>
      </ng-template>
      <ng-template pTemplate="panel">
        <app-main-content [selectedFile]="selectedFile()"></app-main-content>
      </ng-template>
    </p-splitter>
  `,
  imports: [SplitterModule, ProjectSidebarComponent, MainContentComponent],
})
export class DashboardComponent {
  selectedFile = signal<string | null>(null);
}

// ProjectSidebarComponent - PrimeNG Tree、Menu使用
@Component({
  selector: 'app-project-sidebar',
  template: `
    <p-panel header="プロジェクト" [toggleable]="true">
      <p-button
        label="プロジェクト追加"
        icon="pi pi-plus"
        (onClick)="addProject()"
        class="w-full mb-3"
      >
      </p-button>

      @if (projects().length > 0) {
        <p-tree
          [value]="treeNodes()"
          selectionMode="single"
          [(selection)]="selectedNode"
          (onNodeSelect)="onProjectSelect($event)"
        >
        </p-tree>
      } @else {
        <p-message severity="info" text="プロジェクトがありません"> </p-message>
      }
    </p-panel>
  `,
  imports: [PanelModule, ButtonModule, TreeModule, MessageModule],
})
export class ProjectSidebarComponent {
  projects = computed(() => this.projectService.projects());
  treeNodes = computed(() => this.convertToTreeNodes(this.projects()));
}

// MainContentComponent - PrimeNG Card、Skeleton使用
@Component({
  selector: 'app-main-content',
  template: `
    <div class="p-4">
      @if (loading()) {
        <p-skeleton height="200px" class="mb-3"></p-skeleton>
        <p-skeleton height="100px" width="70%"></p-skeleton>
      } @else {
        <p-card header="ファイル内容" [style]="{ height: '100%' }">
          @if (selectedFile()) {
            <p>選択されたファイル: {{ selectedFile() }}</p>
          } @else {
            <p-message severity="info" text="ファイルを選択してください"> </p-message>
          }
        </p-card>
      }
    </div>
  `,
  imports: [CardModule, SkeletonModule, MessageModule],
})
export class MainContentComponent {
  selectedFile = input<string | null>(null);
  loading = signal(false);
}

// PathInputComponent - PrimeNG InputText、FloatLabel使用
@Component({
  selector: 'app-path-input',
  template: `
    <div class="path-input-container">
      <p-floatlabel>
        <input pInputText id="path" [formControl]="pathControl" class="w-full" />
        <label for="path">プロジェクトパス</label>
      </p-floatlabel>

      <p-button label="参照" icon="pi pi-folder-open" (onClick)="openFileDialog()" class="ml-2">
      </p-button>

      @if (pathControl.invalid && pathControl.touched) {
        <p-message severity="error" text="有効なパスを入力してください"> </p-message>
      }
    </div>
  `,
  imports: [InputTextModule, FloatLabelModule, ButtonModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathInputComponent {
  pathControl = new FormControl('', [Validators.required]);
}
```

#### PrimeNG活用方針

- **レイアウト**: Splitter、Panel、Card を積極使用
- **ナビゲーション**: Tree、Menu、Breadcrumb を活用
- **フォーム**: InputText、FloatLabel、Button を使用
- **フィードバック**: Message、Toast、ProgressBar を活用
- **データ表示**: Table、DataView、Skeleton を使用
- **ダイアログ**: Dialog、ConfirmDialog、Sidebar を活用
