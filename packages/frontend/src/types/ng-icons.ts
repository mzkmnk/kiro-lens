/**
 * ng-icons用型定義
 */

/**
 * ng-iconsで使用可能なアイコンセット
 */
export type IconSet = "heroicons" | "lucide";

/**
 * Heroiconsアイコン名の型定義（主要なもののみ）
 */
export type HeroIcon =
  | "heroFolderOpen"
  | "heroFolder"
  | "heroDocument"
  | "heroDocumentText"
  | "heroPlus"
  | "heroMinus"
  | "heroTrash"
  | "heroXMark"
  | "heroCheck"
  | "heroExclamationTriangle"
  | "heroInformationCircle"
  | "heroArrowPath"
  | "heroCog6Tooth"
  | "heroHome"
  | "heroMagnifyingGlass";

/**
 * Lucideアイコン名の型定義（主要なもののみ）
 */
export type LucideIcon =
  | "lucideFolder"
  | "lucideFolderOpen"
  | "lucideFile"
  | "lucideFileText"
  | "lucidePlus"
  | "lucideMinus"
  | "lucideTrash2"
  | "lucideX"
  | "lucideCheck"
  | "lucideAlertTriangle"
  | "lucideInfo"
  | "lucideRefreshCw"
  | "lucideSettings"
  | "lucideHome"
  | "lucideSearch";

/**
 * 使用可能なアイコン名の統合型
 */
export type IconName = HeroIcon | LucideIcon;

/**
 * アイコンサイズの型定義
 */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * アイコンコンポーネントのプロパティ
 */
export interface IconProps {
  readonly name: IconName;
  readonly size?: IconSize;
  readonly className?: string;
  readonly color?: string;
}

/**
 * アイコンボタンのプロパティ
 */
export interface IconButtonProps extends IconProps {
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
}
