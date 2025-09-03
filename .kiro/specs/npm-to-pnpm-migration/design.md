# Design Document

## Overview

npm workspacesからpnpm workspacesへの移行により、Viteバージョン競合問題を解決し、依存関係管理を改善する。YAGNI原則に基づき、最小限の変更で最大の効果を得る設計とする。

## Architecture

### 移行戦略

**段階的移行アプローチ**

1. **クリーンアップフェーズ**: npm関連ファイルの完全削除
2. **設定フェーズ**: pnpm workspace設定の作成
3. **依存関係フェーズ**: pnpmによる依存関係インストール
4. **検証フェーズ**: ビルド・テスト動作確認

### パッケージ構成

```
kiro-lens/
├── pnpm-workspace.yaml          # 新規作成
├── package.json                 # スクリプト更新
├── pnpm-lock.yaml              # 自動生成
└── packages/
    ├── frontend/package.json    # Viteバージョン統一
    ├── backend/package.json     # 変更なし
    └── shared/package.json      # 変更なし
```

## Components and Interfaces

### 1. Workspace設定

**pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

**package.json更新**

- `workspaces`フィールド削除（pnpm-workspace.yamlに移行）
- スクリプト内の`npm`コマンドを`pnpm`に変更
- `--workspace=`を`--filter=`に変更

### 2. 依存関係統一

**Viteバージョン統一戦略**

- ルートレベルでVite 5.4.19に統一
- フロントエンドパッケージのVite 6.0.1を5.4.19にダウングレード
- pnpmの厳密な依存関係解決により競合を防止

### 3. コマンド変換マッピング

| npm コマンド                                | pnpm コマンド                |
| ------------------------------------------- | ---------------------------- |
| `npm run dev --workspace=packages/frontend` | `pnpm --filter=frontend dev` |
| `npm run build --workspaces`                | `pnpm --filter="*" build`    |
| `npm install`                               | `pnpm install`               |

## Data Models

### 依存関係構造

```typescript
// 変更前（npm）
{
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:frontend": "npm run dev --workspace=packages/frontend"
  }
}

// 変更後（pnpm）
{
  "scripts": {
    "dev:frontend": "pnpm --filter=frontend dev"
  }
}
```

## Error Handling

### 移行時の潜在的問題

1. **Viteバージョン競合**
   - 解決策: 明示的なバージョン統一
   - 検証: TypeScriptコンパイルエラーの解消

2. **workspace参照エラー**
   - 解決策: `@kiro-lens/shared: "*"`の動作確認
   - 検証: パッケージ間の依存関係解決

3. **スクリプト実行エラー**
   - 解決策: 段階的なコマンド変換
   - 検証: 各スクリプトの個別実行確認

## Testing Strategy

### 移行検証手順

1. **依存関係検証**

   ```bash
   pnpm install
   pnpm list --depth=0
   ```

2. **ビルド検証**

   ```bash
   pnpm run build
   ```

3. **テスト検証**

   ```bash
   pnpm run test
   ```

4. **開発サーバー検証**
   ```bash
   pnpm run dev
   ```

### 成功基準

- 全パッケージのビルドが成功する
- 全テストが通過する
- Viteバージョン競合エラーが解消される
- 開発サーバーが正常に起動する

## Performance Considerations

### 期待される改善

1. **インストール速度**: ハードリンクによる高速化
2. **ディスク使用量**: 重複排除による削減
3. **依存関係解決**: 決定論的な解決による安定性向上

### 測定指標

- `pnpm install`実行時間
- `node_modules`サイズ
- ビルド時間の変化
