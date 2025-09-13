import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideIcons } from "@ng-icons/core";
import { heroFolder } from "@ng-icons/heroicons/outline";
import { ProjectService } from "../services/project.service";
import { PathInputComponent } from "./path-input.component";

describe("PathInputComponent", () => {
  let component: PathInputComponent;
  let fixture: ComponentFixture<PathInputComponent>;
  let mockProjectService: any;

  beforeEach(async () => {
    mockProjectService = {
      addProject: vi.fn().mockResolvedValue(undefined),
      validatePath: vi.fn().mockResolvedValue({ isValid: true }),
      projects: signal([]),
      selectedProject: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [PathInputComponent, ReactiveFormsModule],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        provideIcons({ heroFolder }),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PathInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("コンポーネントが作成される", () => {
    expect(component).toBeTruthy();
  });

  it("フォームが初期化される", () => {
    expect(component.pathForm).toBeDefined();
    expect(component.pathForm.get("projectName")).toBeDefined();
    expect(component.pathForm.get("projectPath")).toBeDefined();
  });

  it("必須フィールドのバリデーションが動作する", () => {
    const nameControl = component.pathForm.get("projectName");
    const pathControl = component.pathForm.get("projectPath");

    // 空の値でバリデーションエラーが発生することを確認
    nameControl?.setValue("");
    pathControl?.setValue("");
    nameControl?.markAsTouched();
    pathControl?.markAsTouched();

    expect(nameControl?.invalid).toBe(true);
    expect(pathControl?.invalid).toBe(true);
  });

  it("有効な値でフォームが有効になる", () => {
    component.pathForm.patchValue({
      projectName: "Test Project",
      projectPath: "/valid/path",
    });

    expect(component.pathForm.valid).toBe(true);
  });

  it("無効なパス形式でバリデーションエラーが発生する", () => {
    const pathControl = component.pathForm.get("projectPath");

    pathControl?.setValue("invalid-path");
    pathControl?.markAsTouched();

    expect(pathControl?.invalid).toBe(true);
    expect(pathControl?.errors?.["invalidPath"]).toBe(true);
  });

  it("Windowsパス形式が有効と認識される", () => {
    const pathControl = component.pathForm.get("projectPath");

    pathControl?.setValue("C:\\Users\\test\\project");

    expect(pathControl?.valid).toBe(true);
  });

  it("Unixパス形式が有効と認識される", () => {
    const pathControl = component.pathForm.get("projectPath");

    pathControl?.setValue("/home/user/project");

    expect(pathControl?.valid).toBe(true);
  });

  it("フォーム送信時にプロジェクトが追加される", async () => {
    component.pathForm.patchValue({
      projectName: "Test Project",
      projectPath: "/test/path",
    });

    const projectAddedSpy = vi.fn();
    component.projectAdded.subscribe(projectAddedSpy);

    await component.onSubmit();

    expect(mockProjectService.addProject).toHaveBeenCalledWith(
      "Test Project",
      "/test/path",
    );
    expect(projectAddedSpy).toHaveBeenCalledWith({
      name: "Test Project",
      path: "/test/path",
    });
  });

  it("キャンセル時にフォームがリセットされる", () => {
    component.pathForm.patchValue({
      projectName: "Test Project",
      projectPath: "/test/path",
    });

    const cancelledSpy = vi.fn();
    component.cancelled.subscribe(cancelledSpy);

    component.onCancel();

    expect(component.pathForm.get("projectName")?.value).toBe(null);
    expect(component.pathForm.get("projectPath")?.value).toBe(null);
    expect(cancelledSpy).toHaveBeenCalled();
  });

  it("パス検証が動作する", async () => {
    component.pathForm.patchValue({
      projectPath: "/test/path",
    });

    await component.onValidatePath();

    expect(mockProjectService.validatePath).toHaveBeenCalledWith("/test/path");
  });

  it("無効なパス検証結果が表示される", async () => {
    mockProjectService.validatePath.mockResolvedValue({ isValid: false });

    component.pathForm.patchValue({
      projectPath: "/invalid/path",
    });

    await component.onValidatePath();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorMessage = compiled.querySelector('p-message[severity="error"]');
    expect(errorMessage).toBeTruthy();
  });

  it("ヘッダーにアイコンとタイトルが表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector("h2");
    expect(title?.textContent?.trim()).toBe("新しいプロジェクトを追加");

    const icon = compiled.querySelector('ng-icon[name="heroFolder"]');
    expect(icon).toBeTruthy();
  });
});
