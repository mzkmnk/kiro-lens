/**
 * 汎用IDパラメータ型
 *
 * プロジェクトファイル取得、プロジェクト選択、プロジェクト削除等の
 * APIエンドポイントで共通して使用されるIDパラメータを定義します。
 */
export interface IdParams {
  /** リソースID */
  id: string;
}
