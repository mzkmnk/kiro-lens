import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { App } from "./app";

describe("App", () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("コンポーネントが作成される", () => {
    expect(component).toBeTruthy();
  });

  it("router-outletが存在する", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector("router-outlet");
    expect(routerOutlet).toBeTruthy();
  });

  it("ヘッダーが表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector("header");
    expect(header).toBeTruthy();

    const title = compiled.querySelector("h1");
    expect(title?.textContent?.trim()).toBe("Kiro Lens");
  });

  it("ng-iconsアイコンが表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector("ng-icon");
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute("name")).toBe("heroHome");
  });

  it("基本レイアウトクラスが適用される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rootDiv = compiled.querySelector("div");
    expect(rootDiv?.classList.contains("min-h-screen")).toBe(true);
    expect(rootDiv?.classList.contains("bg-gray-50")).toBe(true);
    expect(rootDiv?.classList.contains("font-noto-sans-jp")).toBe(true);
  });
});
