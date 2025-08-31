// プロジェクト関連の型定義

/**
 * プロジェクト情報
 *
 * 現在のプロジェクトの基本情報と.kiroディレクトリの存在状況を表します。
 * kiro-lensが動作するプロジェクトのコンテキスト情報を提供します。
 */
export interface ProjectInfo {
  /** プロジェクト名（通常はディレクトリ名） */
  readonly name: string;
  /** プロジェクトの絶対パス */
  readonly path: string;
  /** .kiroディレクトリが存在するかどうか */
  readonly hasKiroDirectory: boolean;
  /** .kiroディレクトリの絶対パス（存在する場合のみ） */
  readonly kiroPath?: string;
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
