import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import type { ProjectInfo } from "@kiro-lens/shared";
import { provideIcons } from "@ng-icons/core";
import {
  heroDocumentText,
  heroFolder,
  heroHome,
} from "@ng-icons/heroicons/outline";
import { ConfigService } from "../services/config.service";
import { ProjectService } from "../services/project.service";
import { DashboardComponent } from "./dashboard.component";

const mockProjects: ProjectInfo[] = [
  {
    id: "1",
    name: "Test Project 1",
    path: "/path/to/project1",
    isValid: true,
  },
  {
    id: "2",
    name: "Test Project 2",
    path: "/path/to/project2",
    isValid: true,
  },
];

describe("DashboardComponent", () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockProjectService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockProjectService = {
      loadProjects: vi.fn().mockResolvedValue(undefined),
      selectProject: vi.fn().mockResolvedValue(undefined),
      removeProject: vi.fn().mockResolvedValue(undefined),
      projects: signal([]),
      selectedProject: signal(null),
    };

    mockConfigService = {
      hasKiroDir: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: ConfigService, useValue: mockConfigService },
        provideIcons({
          heroHome,
          heroFolder,
          heroDocumentText,
        }),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it("コンポーネントが作成される", () => {
    expect(component).toBeTruthy();
  });

  it("初期化時にプロジェクトを読み込む", async () => {
    await component.ngOnInit();
    expect(mockProjectService.loadProjects).toHaveBeenCalled();
  });

  it("プロジェクトが存在しない場合の表示", () => {
    mockProjectService.projects = signal([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMessage = compiled.querySelector(".text-center");
    expect(emptyMessage?.textContent).toContain(
      "プロジェクトが登録されていません",
    );
  });

  it("プロジェクト一覧が表示される", () => {
    mockProjectService.projects = signal(mockProjects);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const projectElements = compiled.querySelectorAll(".p-3.border");
    expect(projectElements.length).toBe(mockProjects.length);
  });

  it("選択されたプロジェクトがハイライトされる", () => {
    const selectedProject = mockProjects[0];
    mockProjectService.projects = signal(mockProjects);
    mockProjectService.selectedProject = signal(selectedProject);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const selectedElement = compiled.querySelector(".bg-blue-50");
    expect(selectedElement).toBeTruthy();
  });

  it("プロジェクト選択が動作する", async () => {
    const projectId = "test-id";
    await component["onSelectProject"](projectId);
    expect(mockProjectService.selectProject).toHaveBeenCalledWith(projectId);
  });

  it("プロジェクト削除が動作する", async () => {
    const projectId = "test-id";
    vi.spyOn(window, "confirm").mockReturnValue(true);

    await component["onRemoveProject"](projectId);
    expect(mockProjectService.removeProject).toHaveBeenCalledWith(projectId);
  });

  it("プロジェクト削除をキャンセルできる", async () => {
    const projectId = "test-id";
    vi.spyOn(window, "confirm").mockReturnValue(false);

    await component["onRemoveProject"](projectId);
    expect(mockProjectService.removeProject).not.toHaveBeenCalled();
  });

  it(".kiroディレクトリの検出状態が表示される", () => {
    mockConfigService.hasKiroDir = signal(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusElement = compiled.querySelector(".text-green-600");
    expect(statusElement?.textContent).toContain(".kiro 検出済み");
  });

  it("プロジェクト数が表示される", () => {
    mockProjectService.projects = signal(mockProjects);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const countElement = compiled.querySelector(".text-sm.text-gray-600");
    expect(countElement?.textContent).toContain(
      `プロジェクト: ${mockProjects.length}`,
    );
  });

  it("選択されたプロジェクトの詳細が表示される", () => {
    const selectedProject = mockProjects[0];
    mockProjectService.selectedProject = signal(selectedProject);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const projectName = compiled.querySelector("h2");
    expect(projectName?.textContent?.trim()).toBe(selectedProject.name);
  });
});
