# メンテナンスガイド

## 依存関係更新戦略

### 定期更新スケジュール

- **月次**: パッチバージョン更新（セキュリティ修正含む）
- **四半期**: マイナーバージョン更新（新機能追加）
- **年次**: メジャーバージョン更新（破壊的変更）

### 更新手順

#### 1. 依存関係の確認

```bash
# 古い依存関係の確認
npm outdated

# セキュリティ脆弱性の確認
npm audit
```

#### 2. パッチ更新

```bash
# パッチバージョンのみ更新
npm update

# セキュリティ修正の適用
npm audit fix
```

#### 3. マイナー/メジャー更新

```bash
# 特定パッケージの更新
npm install package-name@latest

# 全体更新（注意深く実行）
npx npm-check-updates -u
npm install
```

#### 4. 更新後の検証

```bash
# ビルド確認
npm run build

# テスト実行
npm test

# リンティング確認
npm run quality

# 型チェック
npx tsc --noEmit
```

### 重要な依存関係

#### ESLint関連

- `eslint`: ESLintコア（Flat Config対応版）
- `@typescript-eslint/*`: TypeScript対応
- `eslint-plugin-react*`: React専用ルール
- `eslint-config-prettier`: Prettier競合回避

#### Prettier関連

- `prettier`: コードフォーマッター
- `eslint-plugin-prettier`: ESLint統合

### トラブルシューティング

#### ESLint設定エラー

```bash
# 設定ファイルの構文チェック
npx eslint --print-config eslint.config.js

# キャッシュクリア
rm -rf .eslintcache
```

#### Prettier競合エラー

```bash
# 競合ルールの確認
npx eslint-config-prettier path/to/file.ts
```

#### TypeScript型エラー

```bash
# 型定義の再生成
npm run build:types

# TypeScriptキャッシュクリア
npx tsc --build --clean
```

### 設定変更時の注意点

1. **ESLint設定変更**
   - 全パッケージでテスト実行
   - CI/CDパイプラインでの動作確認
   - チーム内での設定変更の共有

2. **Prettier設定変更**
   - 既存コードの一括フォーマット実行
   - `.editorconfig`との整合性確認
   - エディタ設定の更新案内

3. **依存関係更新**
   - 段階的な更新（一度に全て更新しない）
   - 各更新後のテスト実行
   - ロールバック手順の準備

### 参考リンク

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [TypeScript ESLint](https://typescript-eslint.io/)
