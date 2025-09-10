/**
 * プロジェクトファイル取得APIのパラメータ型
 */
export interface ProjectFilesParams {
  /** プロジェクトID */
  id: string;
}

/**
 * プロジェクト選択APIのパラメータ型
 */
export interface ProjectSelectParams {
  /** プロジェクトID */
  id: string;
}

/**
 * プロジェクト削除APIのパラメータ型
 */
export interface ProjectDeleteParams {
  /** プロジェクトID */
  id: string;
}

/**
 * 汎用IDパラメータ型
 */
export interface IdParams {
  /** ID */
  id: string;
}
