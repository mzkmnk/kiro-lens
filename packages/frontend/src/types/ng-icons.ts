/**
 * ng-icons関連の型定義
 */

/**
 * ng-iconsで使用可能なアイコン名の型定義
 */
export type IconName =
  | "heroHome"
  | "heroFolder"
  | "heroDocument"
  | "heroPlus"
  | "heroMinus"
  | "heroTrash"
  | "heroCheck"
  | "heroX"
  | "heroExclamationTriangle"
  | "heroInformationCircle"
  | "heroSettings"
  | "heroRefresh"
  | "heroEye"
  | "heroEyeSlash"
  | "heroChevronDown"
  | "heroChevronUp"
  | "heroChevronLeft"
  | "heroChevronRight"
  | "lucideFile"
  | "lucideFolder"
  | "lucideFolderOpen"
  | "lucideFileText"
  | "lucideSettings"
  | "lucideRefreshCw"
  | "lucideCheck"
  | "lucideX"
  | "lucidePlus"
  | "lucideMinus";

/**
 * アイコンのサイズ型定義
 */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * アイコンコンポーネントのプロパティ
 */
export interface IconProps {
  name: IconName;
  size?: IconSize;
  class?: string;
}
