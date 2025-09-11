# Design Document

## Overview

kiro-lensプロジェクトのフロントエンドをReactからAngular 20に移行する。既存のFastifyバックエンドとの互換性を維持しながら、Angularの最新機能を活用した開発環境を構築する。

## Architecture

### 技術スタック

- **Angular**: 20.2+ (最新安定版)
- **TypeScript**: 5.9+ (Angular 20.2対応)
- **Angular CLI**: 20.2+ (ビルド・開発サーバー)
- **Node.js**: 18.19.1+ または 20.11.1+
- **RxJS**: 7.8+ (Angular標準の非同期処理)

### UIフレームワーク

- **Angular Material**: 20.x (Angular 20対応版)
- **Tailwind CSS**: 4.x (Angular対応設定)
- **日本語フォント**: Noto Sans JP
- **アイコン**: Angular Material Icons

### 開発ツール

- **ESLint**: Angular ESLint 20.x
- **Prettier**: 3.x (Angular対応)
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
})
export class DashboardComponent implements OnInit {
  selectedFile: string | null = null;

  constructor(
    private projectService: ProjectService,
    private fileTreeService: FileTreeService
  ) {}
}
```

#### ProjectSidebarComponent

```typescript
@Component({
  selector: 'app-project-sidebar',
  templateUrl: './project-sidebar.component.html',
  styleUrls: ['./project-sidebar.component.scss'],
})
export class ProjectSidebarComponent implements OnInit {
  projects$ = this.projectService.projects$;
  selectedProject$ = this.projectService.selectedProject$;

  constructor(private projectService: ProjectService) {}
}
```

#### MainContentComponent

```typescript
@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
})
export class MainContentComponent {
  @Input() selectedFile: string | null = null;
  @Input() hasKiroDir: boolean = false;
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

  constructor(private http: HttpClient) {}

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
  private projectsSubject = new BehaviorSubject<ProjectInfo[]>([]);
  private selectedProjectSubject = new BehaviorSubject<ProjectInfo | null>(null);

  projects$ = this.projectsSubject.asObservable();
  selectedProject$ = this.selectedProjectSubject.asObservable();

  constructor(private apiService: ApiService) {}

  loadProjects(): Observable<ProjectInfo[]> {
    return this.apiService.getProjects().pipe(
      map(response => response.data),
      tap(projects => this.projectsSubject.next(projects))
    );
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
2. 依存関係インストール
3. 基本設定（TypeScript、ESLint、Prettier）

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

- Angular Material の必要コンポーネントのみインポート
- Tailwind CSS の未使用クラス除去
- 適切なコード分割
