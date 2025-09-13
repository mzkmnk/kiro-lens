import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NgIconComponent } from "@ng-icons/core";
import { ButtonModule } from "primeng/button";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { ProjectService } from "../services/project.service";

@Component({
  selector: "app-path-input",
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    FloatLabelModule,
    NgIconComponent,
  ],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center gap-3 mb-6">
        <ng-icon name="heroFolder" class="text-blue-600" size="24"></ng-icon>
        <h2 class="text-xl font-semibold text-gray-900">
          新しいプロジェクトを追加
        </h2>
      </div>

      <form [formGroup]="pathForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Project Name Input -->
        <div>
          <p-floatlabel>
            <input
              pInputText
              id="projectName"
              formControlName="projectName"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('projectName')"
            />
            <label for="projectName">プロジェクト名</label>
          </p-floatlabel>

          @if (isFieldInvalid("projectName")) {
            <p-message
              severity="error"
              text="プロジェクト名は必須です"
              class="mt-2 block"
            ></p-message>
          }
        </div>

        <!-- Project Path Input -->
        <div>
          <p-floatlabel>
            <input
              pInputText
              id="projectPath"
              formControlName="projectPath"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('projectPath')"
              placeholder="/path/to/your/project"
            />
            <label for="projectPath">プロジェクトパス</label>
          </p-floatlabel>

          @if (isFieldInvalid("projectPath")) {
            <p-message
              severity="error"
              text="有効なプロジェクトパスを入力してください"
              class="mt-2 block"
            ></p-message>
          }
        </div>

        <!-- Validation Status -->
        @if (validationStatus()) {
          <div class="mt-4">
            @if (validationStatus() === "validating") {
              <p-message
                severity="info"
                text="パスを検証中..."
                class="block"
              ></p-message>
            } @else if (validationStatus() === "valid") {
              <p-message
                severity="success"
                text="有効なプロジェクトパスです"
                class="block"
              ></p-message>
            } @else if (validationStatus() === "invalid") {
              <p-message
                severity="error"
                text="指定されたパスが存在しないか、アクセスできません"
                class="block"
              ></p-message>
            }
          </div>
        }

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <p-button
            type="submit"
            label="追加"
            icon="pi pi-plus"
            [disabled]="!pathForm.valid || isSubmitting()"
            [loading]="isSubmitting()"
          >
          </p-button>

          <p-button
            type="button"
            label="キャンセル"
            severity="secondary"
            [text]="true"
            (onClick)="onCancel()"
            [disabled]="isSubmitting()"
          >
          </p-button>

          <p-button
            type="button"
            label="パス検証"
            severity="info"
            [text]="true"
            (onClick)="onValidatePath()"
            [disabled]="!pathForm.get('projectPath')?.value || isValidating()"
            [loading]="isValidating()"
          >
          </p-button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathInputComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  // Output events
  projectAdded = output<{ name: string; path: string }>();
  cancelled = output<void>();

  // Signals
  private readonly isSubmitting = signal(false);
  private readonly isValidating = signal(false);
  private readonly validationStatus = signal<
    "validating" | "valid" | "invalid" | null
  >(null);

  // Reactive Form
  protected readonly pathForm: FormGroup = this.fb.group({
    projectName: ["", [Validators.required, Validators.minLength(1)]],
    projectPath: ["", [Validators.required, this.pathValidator]],
  });

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.pathForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  protected async onSubmit(): Promise<void> {
    if (this.pathForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      try {
        const formValue = this.pathForm.value;

        // パス検証を実行
        const isValid = await this.validateProjectPath(formValue.projectPath);

        if (isValid) {
          // プロジェクトを追加
          await this.projectService.addProject(
            formValue.projectName,
            formValue.projectPath,
          );

          // 成功イベントを発行
          this.projectAdded.emit({
            name: formValue.projectName,
            path: formValue.projectPath,
          });

          // フォームをリセット
          this.pathForm.reset();
          this.validationStatus.set(null);
        } else {
          this.validationStatus.set("invalid");
        }
      } catch (error) {
        console.error("プロジェクト追加エラー:", error);
        this.validationStatus.set("invalid");
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  protected onCancel(): void {
    this.pathForm.reset();
    this.validationStatus.set(null);
    this.cancelled.emit();
  }

  protected async onValidatePath(): Promise<void> {
    const pathValue = this.pathForm.get("projectPath")?.value;

    if (pathValue && !this.isValidating()) {
      this.isValidating.set(true);
      this.validationStatus.set("validating");

      try {
        const isValid = await this.validateProjectPath(pathValue);
        this.validationStatus.set(isValid ? "valid" : "invalid");
      } catch (error) {
        console.error("パス検証エラー:", error);
        this.validationStatus.set("invalid");
      } finally {
        this.isValidating.set(false);
      }
    }
  }

  private async validateProjectPath(path: string): Promise<boolean> {
    try {
      const result = await this.projectService.validatePath(path);
      return result.isValid;
    } catch (error) {
      console.error("パス検証API呼び出しエラー:", error);
      return false;
    }
  }

  private pathValidator(control: any) {
    const value = control.value;
    if (!value) {
      return null; // required validator will handle empty values
    }

    // 基本的なパス形式チェック
    const pathPattern = /^\/.*|^[A-Za-z]:\\.*/;
    if (!pathPattern.test(value)) {
      return { invalidPath: true };
    }

    return null;
  }
}
