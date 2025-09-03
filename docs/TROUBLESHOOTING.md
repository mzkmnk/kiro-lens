# トラブルシューティングガイド

## よくある問題と解決方法

### ESLint関連

#### 問題: "Resolve error: typescript with invalid interface loaded as resolver"

**原因**: TypeScript resolverの設定問題

**解決方法**:

```bash
# eslint-import-resolver-typescriptの再インストール
pnpm add -D eslint-import-resolver-typescript

# 設定ファイルの確認
# eslint.config.js の import/resolver 設定を確認
```

#### 問題: "Parsing error: Cannot read file 'tsconfig.json'"

**原因**: TypeScriptプロジェクト設定の参照エラー

**解決方法**:

```bash
# tsconfig.jsonの存在確認
ls -la tsconfig.json packages/*/tsconfig.json

# ESLint設定のproject指定を確認
# eslint.config.js の parserOptions.project を確認
```

#### 問題: 大量の"no-unused-vars"エラー

**原因**: 開発中のコードでの未使用変数

**解決方法**:

```bash
# 自動修正可能なエラーを修正
pnpm run lint:fix

# 一時的に警告レベルに変更（eslint.config.js）
'@typescript-eslint/no-unused-vars': 'warn'
```

### Prettier関連

#### 問題: ESLintとPrettierの競合エラー

**原因**: フォーマットルールの重複

**解決方法**:

```bash
# 競合ルールの確認
npx eslint-config-prettier path/to/file.ts

# eslint-config-prettierが最後に配置されているか確認
# eslint.config.js の配列の最後にprettierConfigがあることを確認
```

#### 問題: "No parser could be inferred for file"

**原因**: Prettierがファイル形式を認識できない

**解決方法**:

```bash
# 対象ファイル形式の確認
npx prettier --check --debug-check path/to/file

# .prettierrc.js の対象拡張子を確認
```

### VS Code統合

#### 問題: 保存時の自動フォーマットが動作しない

**解決方法**:

1. 拡張機能の確認
   - ESLint拡張機能がインストール済みか
   - Prettier拡張機能がインストール済みか

2. 設定の確認

   ```json
   // .vscode/settings.json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode"
   }
   ```

3. 拡張機能の再起動
   - VS Codeのコマンドパレット > "Developer: Reload Window"

#### 問題: ESLintエラーが表示されない

**解決方法**:

1. ESLint出力パネルの確認
   - VS Code下部の"出力"パネル > "ESLint"を選択

2. ワークスペース設定の確認
   ```json
   // .vscode/settings.json
   {
     "eslint.workingDirectories": ["packages/frontend", "packages/backend", "packages/shared"]
   }
   ```

### パフォーマンス問題

#### 問題: ESLintの実行が遅い

**解決方法**:

```bash
# キャッシュの有効化確認
pnpm run lint -- --cache --cache-location .eslintcache

# 除外設定の確認（eslint.config.js）
# node_modules, dist, build が除外されているか確認
```

#### 問題: Prettierの実行が遅い

**解決方法**:

```bash
# 対象ファイルの絞り込み
pnpm run format -- --ignore-path .prettierignore

# .prettierignore の確認
# 不要なファイルが除外されているか確認
```

### CI/CD関連

#### 問題: GitHub Actionsでリンティングが失敗

**解決方法**:

1. ローカルでの再現確認

   ```bash
   pnpm install --frozen-lockfile
   pnpm run quality
   ```

2. Node.jsバージョンの確認
   - `.github/workflows/lint.yml`のnode-versionを確認
   - `package.json`のenginesフィールドと整合性を確認

3. 依存関係の確認
   ```bash
   # pnpm-lock.yamlの更新
   pnpm install
   git add pnpm-lock.yaml
   ```

### 緊急時の対処

#### ESLintを一時的に無効化

```bash
# 特定ファイルでESLintを無効化
/* eslint-disable */

# 特定ルールを無効化
/* eslint-disable @typescript-eslint/no-unused-vars */

# 次の行のみ無効化
// eslint-disable-next-line @typescript-eslint/no-unused-vars
```

#### Prettierを一時的に無効化

```bash
# 特定ファイルでPrettierを無効化
<!-- prettier-ignore -->

# 特定ブロックを無効化
// prettier-ignore
const uglyCode = { a:1,b:2 };
```

### ヘルプとサポート

問題が解決しない場合:

1. [ESLint公式ドキュメント](https://eslint.org/docs/)
2. [Prettier公式ドキュメント](https://prettier.io/docs/)
3. [TypeScript ESLint](https://typescript-eslint.io/)
4. プロジェクトのIssueトラッカー
