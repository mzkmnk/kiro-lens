# Requirements Document

## Introduction

kiro-lensプロジェクトにおいて、現在のViteバージョン競合問題を解決するため、npm workspacesからpnpm workspacesへの移行を行う。

## Requirements

### 要件1：基本的なパッケージマネージャー移行

**ユーザーストーリー:** 開発者として、Viteバージョン競合問題を解決し、安定した依存関係管理を実現したい。

#### 受け入れ基準

1. WHEN npm関連ファイルを削除 THEN システムはpackage-lock.jsonとnode_modulesを完全に除去する
2. WHEN pnpm installを実行 THEN システムは依存関係を正しくインストールしpnpm-lock.yamlを生成する
3. WHEN pnpm-workspace.yamlを作成 THEN システムは3つのパッケージ（frontend、backend、shared）を認識する

### 要件2：コマンド更新

**ユーザーストーリー:** 開発者として、既存の開発ワークフローを維持したい。

#### 受け入れ基準

1. WHEN package.jsonのスクリプトを更新 THEN システムはnpmコマンドをpnpmコマンドに変換する
2. WHEN pnpm run buildを実行 THEN システムは全パッケージのビルドを正常に完了する
3. WHEN pnpm run testを実行 THEN システムは全テストを正常に実行する

### 要件3：依存関係の分離と最適化

**ユーザーストーリー:** 開発者として、依存関係を適切に分離し、Viteバージョン競合問題を根本的に解決したい。

#### 受け入れ基準

1. WHEN ルートからVite系依存関係を削除 THEN システムはバージョン競合を完全に解消する
2. WHEN フロントエンドのViteを最新版に更新 THEN システムは最新機能とパフォーマンス改善を利用できる
3. WHEN 開発サーバーを起動 THEN システムは正常に動作する
