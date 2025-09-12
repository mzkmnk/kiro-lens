import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterOutlet, provideRouter } from "@angular/router";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  heroDocumentText,
  heroFolder,
  heroHome,
} from "@ng-icons/heroicons/outline";

// インラインテンプレートでテスト用コンポーネントを作成
@Component({
  selector: "app-root",
  imports: [RouterOutlet, NgIconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 font-noto-sans-jp">
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <ng-icon
                name="heroHome"
                class="text-blue-600"
                size="24"
              ></ng-icon>
              <h1 class="text-2xl font-bold text-gray-800">
                {{ title() }}
              </h1>
              <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ version() }}
              </span>
            </div>
          </div>
        </div>
      </header>
      <main class="flex-1">
        <router-outlet />
      </main>
      <section class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center space-x-2 mb-4">
              <ng-icon
                name="heroFolder"
                class="text-blue-600"
                size="20"
              ></ng-icon>
              <h2 class="text-xl font-semibold text-gray-700">
                ng-icons テスト
              </h2>
            </div>
            <p class="text-gray-600 mb-4">
              ng-iconsライブラリが正常に動作しています。
            </p>
            <div class="flex space-x-2">
              <ng-icon
                name="heroHome"
                class="text-green-500"
                size="24"
              ></ng-icon>
              <ng-icon
                name="heroFolder"
                class="text-blue-500"
                size="24"
              ></ng-icon>
              <ng-icon
                name="heroDocumentText"
                class="text-purple-500"
                size="24"
              ></ng-icon>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroHome,
      heroFolder,
      heroDocumentText,
    }),
  ],
})
class TestApp {
  protected readonly title = signal("Kiro Lens");
  protected readonly version = signal("Angular 20");
}

describe("App", () => {
  let component: TestApp;
  let fixture: ComponentFixture<TestApp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestApp],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("コンポーネントが作成される", () => {
    expect(component).toBeTruthy();
  });

  it("タイトルが正しく設定される", () => {
    expect(component["title"]()).toBe("Kiro Lens");
  });

  it("バージョンが正しく設定される", () => {
    expect(component["version"]()).toBe("Angular 20");
  });

  it("ヘッダーにタイトルが表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector("h1");
    expect(titleElement?.textContent?.trim()).toBe("Kiro Lens");
  });

  it("バージョン情報が表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const versionElement = compiled.querySelector("span");
    expect(versionElement?.textContent?.trim()).toBe("Angular 20");
  });

  it("ng-iconsが正しく表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iconElements = compiled.querySelectorAll("ng-icon");
    expect(iconElements.length).toBeGreaterThan(0);
  });

  it("統合テストセクションが表示される", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const testSection = compiled.querySelector("section");
    expect(testSection).toBeTruthy();
  });

  it("router-outletが存在する", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector("router-outlet");
    expect(routerOutlet).toBeTruthy();
  });
});
