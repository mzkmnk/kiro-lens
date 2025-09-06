// プロジェクト関連の型定義

/**
 * プロジェクト情報
 *
 * パス管理システムで管理される各プロジェクトの詳細情報を表します。
 * 複数のプロジェクトを管理するための拡張された情報を含みます。
 */
export interface ProjectInfo {
  /** プロジェクトの一意識別子 */
  readonly id: string;
  /** プロジェクト名（通常はディレクトリ名） */
  readonly name: string;
  /** プロジェクトルートパス */
  readonly path: string;
  /** .kiroディレクトリの絶対パス */
  readonly kiroPath: string;
  /** .kiroディレクトリが存在するかどうか */
  readonly hasKiroDir: boolean;
  /** パスが現在も有効かどうか */
  readonly isValid: boolean;
  /** プロジェクト追加日時 */
  readonly addedAt: string;
  /** 最終アクセス日時 */
  readonly lastAccessedAt?: string;
}

/**
 * プロジェクト情報レスポンス
 *
 * GET /api/project エンドポイントのレスポンス形式を定義します。
 * ProjectInfoから必要な情報のみを抽出したAPI用の型です。
 */
export interface ProjectResponse {
  /** プロジェクト名 */
  readonly name: string;
  /** .kiroディレクトリが存在するかどうか */
  readonly hasKiroDir: boolean;
  /** .kiroディレクトリのパス（存在する場合のみ） */
  readonly kiroPath?: string;
}
