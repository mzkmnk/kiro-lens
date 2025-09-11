import { Injectable, computed, signal } from "@angular/core";
import { environment } from "../environments/environment.development";

/**
 * ログレベルの型定義
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * アプリケーション設定の型定義
 */
export interface AppConfig {
  readonly apiUrl: string;
  readonly isProduction: boolean;
  readonly logLevel: LogLevel;
  readonly version: string;
  readonly enableMSW: boolean;
}

/**
 * 環境設定サービス
 * アプリケーションの設定を管理
 */
@Injectable({
  providedIn: "root",
})
export class ConfigService {
  // 設定値のSignals
  private readonly _apiUrl = signal(environment.apiUrl);
  private readonly _isProduction = signal(environment.production);
  private readonly _logLevel = signal<LogLevel>(environment.logLevel);
  private readonly _version = signal(environment.version);
  private readonly _enableMSW = signal(environment.enableMSW);

  // 読み取り専用のSignals
  readonly apiUrl = this._apiUrl.asReadonly();
  readonly isProduction = this._isProduction.asReadonly();
  readonly logLevel = this._logLevel.asReadonly();
  readonly version = this._version.asReadonly();
  readonly enableMSW = this._enableMSW.asReadonly();

  // 設定オブジェクト全体のcomputed
  readonly config = computed<AppConfig>(() => ({
    apiUrl: this._apiUrl(),
    isProduction: this._isProduction(),
    logLevel: this._logLevel(),
    version: this._version(),
    enableMSW: this._enableMSW(),
  }));

  /**
   * API URLを更新
   */
  updateApiUrl(url: string): void {
    this._apiUrl.set(url);
  }

  /**
   * ログレベルを更新
   */
  updateLogLevel(level: LogLevel): void {
    this._logLevel.set(level);
  }

  /**
   * 設定オブジェクトを取得
   */
  getConfig(): AppConfig {
    return this.config();
  }
}
