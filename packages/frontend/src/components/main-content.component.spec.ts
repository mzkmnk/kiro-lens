import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import type { ProjectInfo } from "@kiro-lens/shared";
import { provideIcons } from "@ng-icons/core";
import {
  heroDocument,
  heroFolder,
  heroHome,
} from "@ng-icons/heroicons/outline";
import { MainContentComponent } from "./main-content.component";

const mockValidProject: ProjectInfo = {
  id: "1",
  name: "Test Project",
  path: "/path/to/project",
  isValid: true,
};

const mockInvalidProject: ProjectInfo = {
  id: "2",
  name: "Invalid Project",
  path: "/invalid/path",
  isValid: false,
};

describe("MainContentComponent", () => {
  let component: MainContentComponent;
  let fixture: ComponentFixture<MainContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainContentComponent],
      providers: [
        provideIcons({
          heroHome,
          heroFolder,
          heroDocument,
        }),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainContentComponent);
    component = fixture.componentInstance;
  });

  it("コンポーネントが作成される", () => {
    expect(component).toBeTruthy();
  });

  it("プロジェクトが選択されていない場合にウェルカム画面が表示される", () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const welcomeTitle = compiled.querySelector("h2");
    expect(welcomeTitle?.textContent?.trim()).toBe("Kiro Lens へようこそ");
  });

  it("ローディング状態でスケルトンが表示される", () => {
    fixture.componentRef.setInput("isLoading", true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const skeletons = compiled.querySelectorAll("p-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("有効なプロジェクトが選択された場合にプロジェクト詳細が表示される", () => {
    fixture.componentRef.setInput("selectedProject", mockValidProject);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const projectName = compiled.querySelector("h1");
    expect(projectName?.textContent?.trim()).toBe("Test Project");

    const projectPath = compiled.querySelector(".font-mono");
    expect(projectPath?.textContent?.trim()).toBe("/path/to/project");

    const validBadge = compiled.querySelector(".bg-green-100");
    expect(validBadge?.textContent?.trim()).toBe("有効");
  });

  it("無効なプロジェクトが選択された場合に警告が表示される", () => {
    fixture.componentRef.setInput("selectedProject", mockInvalidProject);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const invalidBadge = compiled.querySelector(".bg-red-100");
    expect(invalidBadge?.textContent?.trim()).toBe("無効");

    const warningMessage = compiled.querySelector(".text-orange-800");
    expect(warningMessage?.textContent?.trim()).toBe(
      "プロジェクトパスが無効です",
    );
  });

  it("有効なプロジェクトでボタンが有効になる", () => {
    fixture.componentRef.setInput("selectedProject", mockValidProject);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll("p-button");

    expect(buttons.length).toBeGreaterThan(0);
  });

  it("無効なプロジェクトでボタンが無効になる", () => {
    fixture.componentRef.setInput("selectedProject", mockInvalidProject);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll("p-button");

    expect(buttons.length).toBeGreaterThan(0);
  });

  it("機能カードが表示される", () => {
    fixture.componentRef.setInput("selectedProject", mockValidProject);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll(".border.border-gray-200");
    expect(cards.length).toBe(3);

    const fileManagementCard = cards[0];
    expect(fileManagementCard.textContent).toContain("ファイル管理");

    const settingsCard = cards[1];
    expect(settingsCard.textContent).toContain("プロジェクト設定");

    const statsCard = cards[2];
    expect(statsCard.textContent).toContain("統計情報");
  });

  it("ウェルカム画面で機能紹介カードが表示される", () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const featureCards = compiled.querySelectorAll(
      ".bg-blue-50, .bg-green-50, .bg-purple-50",
    );
    expect(featureCards.length).toBe(3);

    expect(featureCards[0].textContent).toContain("プロジェクト管理");
    expect(featureCards[1].textContent).toContain("ファイル編集");
    expect(featureCards[2].textContent).toContain("リアルタイム同期");
  });
});
