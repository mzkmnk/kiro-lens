# Requirements Document

## Introduction

kiro-lensプロジェクトにPrettierとESLintを導入し、コード品質の向上と開発体験の統一を図る機能です。モノレポ構成のTypeScriptプロジェクトにおいて、フロントエンド（React + Vite）、バックエンド（Fastify）、shared（共通型定義）の各パッケージに対して一貫したコードフォーマットとリンティングルールを適用します。

## Requirements

### Requirement 1

**User Story:** 開発者として、コードを保存時に自動的にフォーマットされるようにしたい。そうすることで、チーム全体で一貫したコードスタイルを維持できる。

#### Acceptance Criteria

1. WHEN 開発者がTypeScriptファイルを保存する THEN システム SHALL 自動的にPrettierでコードをフォーマットする
2. WHEN 開発者がJSX/TSXファイルを保存する THEN システム SHALL Reactに適したフォーマットルールを適用する
3. WHEN 開発者がJSONファイルを保存する THEN システム SHALL 適切なインデントでフォーマットする

### Requirement 2

**User Story:** 開発者として、コード品質の問題を早期に発見したい。そうすることで、バグの混入を防ぎ、保守性の高いコードを書ける。

#### Acceptance Criteria

1. WHEN 開発者がコードを編集する THEN ESLint SHALL リアルタイムで構文エラーや品質問題を検出する
2. WHEN TypeScriptの型安全性に問題がある THEN システム SHALL 適切なエラーメッセージを表示する
3. WHEN Reactのベストプラクティスに反するコードがある THEN システム SHALL 警告を表示する

### Requirement 3

**User Story:** 開発者として、プロジェクト全体で統一された設定ファイルから、パッケージごとに適切なルールを適用したい。そうすることで、設定の重複を避けながら各パッケージに最適化されたルールを使える。

#### Acceptance Criteria

1. WHEN プロジェクトルートに統一されたESLint設定がある THEN システム SHALL `packages/frontend/**/*.{ts,tsx}`に対してReact専用ルールを適用する
2. WHEN プロジェクトルートに統一されたESLint設定がある THEN システム SHALL `packages/backend/**/*.ts`に対してNode.js専用ルールを適用する
3. WHEN プロジェクトルートに統一されたESLint設定がある THEN システム SHALL `packages/shared/**/*.ts`に対して共通TypeScriptルールを適用する
4. WHEN 設定ファイルが更新される THEN システム SHALL 全パッケージで一貫した設定を維持する

### Requirement 4

**User Story:** 開発者として、CIパイプラインでコード品質をチェックしたい。そうすることで、品質の低いコードがmainブランチにマージされることを防げる。

#### Acceptance Criteria

1. WHEN プルリクエストが作成される THEN システム SHALL ESLintでコード品質をチェックする
2. WHEN コードフォーマットが不適切な場合 THEN システム SHALL Prettierチェックでエラーを報告する
3. IF リンティングエラーがある THEN システム SHALL マージを阻止する

### Requirement 5

**User Story:** 開発者として、既存のコードを一括でフォーマットしたい。そうすることで、プロジェクト全体のコードスタイルを統一できる。

#### Acceptance Criteria

1. WHEN 開発者がフォーマットコマンドを実行する THEN システム SHALL 全パッケージのコードを一括フォーマットする
2. WHEN 開発者がリンティングコマンドを実行する THEN システム SHALL 全パッケージのコードをチェックする
3. WHEN 自動修正可能なリンティングエラーがある THEN システム SHALL 自動的に修正を適用する

### Requirement 6

**User Story:** 開発者として、エディタでリアルタイムにフォーマットとリンティングの結果を確認したい。そうすることで、開発中に即座に問題を修正できる。

#### Acceptance Criteria

1. WHEN 開発者がVS Codeを使用する THEN システム SHALL 適切な拡張機能設定を提供する
2. WHEN コードに問題がある THEN エディタ SHALL 該当箇所をハイライト表示する
3. WHEN 開発者がファイルを保存する THEN エディタ SHALL 自動的にフォーマットとリンティング修正を実行する