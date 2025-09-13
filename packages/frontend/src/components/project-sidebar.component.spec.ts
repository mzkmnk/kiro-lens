import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import type { ProjectInfo } from "@kiro-lens/shared";
import { provideIcons } from "@ng-icons/core";
import { heroCheck, heroFolder, heroHome } from "@ng-icons/heroicons/outline";
import { ProjectService } from "../services/project.service";
import { ProjectSidebarComponent } from "./project-sidebar.component";

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
    isValid: false,
  },
];

describe("ProjectSidebarComponent", () => {
  let component: ProjectSidebarComponent;
  let fixture: ComponentFixture<ProjectSidebarComponent>;
  let mockProjectService: any;

  beforeEach(async () => {
    mockProjectService = {
      loadProjects: vi.fn().mockResolvedValue(undefined),
      selectProject: vi.fn().mockResolvedValue(undefined),
      removeProject: vi.fn().mockResolvedValue(undefined),
      projects: signal([]),
      selectedProject: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [ProjectSidebarComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        provideIcons({
          heroHome,
          heroFolder,
          heroCheck,
        }),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("コンポーネントが作成される", () => {
    expect(component).toBeTruthy();
  });

  it("初期化時にプロジェクトを読み込む", () => {
    expect(mockProjectService.loadProjects).toHaveBeenCalled();
  });

  it("プロジェクトが存在しない場合の表示", () => {
    mockProjectService.projects.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMessage = compiled.querySelector(".text-center");
    expect(emptyMessage?.textContent).toContain("プロジェクトを追加");
  });

  it("プロジェクト一覧が表示される", () => {
    mockProjectService.projects.set(mockProjects);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const projectItems = compiled.querySelectorAll(".group");
    expect(projectItems.length).toBe(2);

    const firstProject = projectItems[0];
    expect(firstProject.textContent).toContain("Test Project 1");
    expect(firstProject.textContent).toContain("/path/to/project1");
  });

  it("無効なプロジェクトが適切に表示される", () => {
    mockProjectService.projects.set(mockProjects);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const projectItems = compiled.querySelectorAll(".group");
    const invalidProject = projectItems[1];

    expect(invalidProject.textContent).toContain("無効なパス");
  });

  it("選択されたプロジェクトがハイライトされる", () => {
    mockProjectService.projects.set(mockProjects);
    mockProjectService.selectedProject.set(mockProjects[0]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const selectedProject = compiled.querySelector(".bg-blue-50");
    expect(selectedProject).toBeTruthy();
    expect(selectedProject?.textContent).toContain("Test Project 1");
  });

  it("プロジェクト選択が動作する", async () => {
    mockProjectService.projects.set(mockProjects);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const projectItem = compiled.querySelector(".group") as HTMLElement;

    projectItem.click();

    expect(mockProjectService.selectProject).toHaveBeenCalledWith("1");
  });

  it("プロジェクト数が表示される", () => {
    mockProjectService.projects.set(mockProjects);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const countText = compiled.querySelector(".text-xs.text-gray-500");
    expect(countText?.textContent).toContain("2 個のプロジェクト");
  });

  it("プロジェクト追加ボタンが表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('p-button[icon="pi pi-plus"]');
    expect(addButton).toBeTruthy();
  });

  it("ヘッダーにアイコンとタイトルが表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector("h2");
    expect(header?.textContent?.trim()).toBe("プロジェクト");

    const icon = compiled.querySelector('ng-icon[name="heroFolder"]');
    expect(icon).toBeTruthy();
  });
});
