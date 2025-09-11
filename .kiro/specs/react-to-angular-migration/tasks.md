# Implementation Plan

## 完了済みタスク

なし

## 実装タスク

- [x] 1. 既存Reactフロントエンドの削除
  - packages/frontend ディレクトリの完全削除
  - package.json からフロントエンド関連スクリプトの削除
  - ルートpackage.json のワークスペース設定更新
  - 既存の依存関係クリーンアップ
  - _要件: 1.1_

- [x] 2. Angular 20プロジェクト環境セットアップ
  - 新しいAngularプロジェクト作成（スタンドアロンコンポーネント構成）
  - packages/frontend ディレクトリにAngularプロジェクト作成
  - Node.js 22対応確認
  - _要件: 1.1, 1.2, 1.3_

- [x] 3. 依存関係とUIライブラリのインストール
  - PrimeNG 20.x インストール・設定
  - ng-icons ライブラリインストール・設定
  - Tailwind CSS 4.x Angular対応設定
  - Noto Sans JP フォント設定
  - _要件: 3.1, 3.2, 3.3_

- [x] 4. 既存ワークスペース統合設定
  - 既存ESLint設定の拡張（Angular ESLint追加）
  - 既存Prettier設定の拡張（Angular対応）
  - package.jsonスクリプト更新
  - モノレポ構成への統合
  - _要件: 4.3_

- [ ] 5. Vitest実験的サポート設定
  - Angular 20のVitest unit-test builder設定
  - vitest.config.ts作成
  - テストセットアップファイル作成
  - angular.json テスト設定更新
  - _要件: 4.2_

- [ ] 6. 共通型定義の統合
  - @kiro-lens/shared パッケージとの連携設定
  - Angular固有型定義の作成
  - ng-icons用型定義の作成
  - 環境設定ファイル作成
  - _要件: 5.1, 5.2, 5.3, 5.4_

- [ ] 7. 基盤サービス実装（TDD）
  - ApiService実装（HTTP通信、inject()使用）
  - エラーハンドリング（HTTP Interceptor）
  - 環境設定サービス
  - 全サービスのテスト作成
  - _要件: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. ProjectService実装（Signals）
  - Signalsベースの状態管理実装
  - computed()による派生状態
  - プロジェクト管理機能（追加・削除・選択）
  - テスト作成（Vitest）
  - _要件: 2.1, 2.2, 2.3, 2.4_

- [ ] 9. AppComponent実装
  - スタンドアロンコンポーネント作成
  - OnPush変更検知戦略設定
  - 基本レイアウト実装
  - ng-icons統合テスト
  - _要件: 1.1, 1.2_

- [ ] 10. DashboardComponent実装
  - スタンドアロンコンポーネント作成
  - Signalsベースの状態管理
  - PrimeNG Splitter、Panel使用のレスポンシブレイアウト
  - コンポーネントテスト作成
  - _要件: 2.1, 3.1, 3.2_

- [ ] 11. ProjectSidebarComponent実装
  - スタンドアロンコンポーネント作成
  - ネイティブ制御フロー（@if, @for）使用
  - PrimeNG Tree、Button、Menu使用
  - ng-iconsアイコン統合
  - プロジェクト操作機能実装
  - _要件: 2.1, 2.2, 2.3, 2.4, 3.1_

- [ ] 12. MainContentComponent実装
  - スタンドアロンコンポーネント作成
  - input()関数によるプロパティ受け取り
  - PrimeNG Card、Skeleton使用のレスポンシブデザイン
  - コンテンツ表示機能
  - _要件: 2.1, 3.1, 3.2_

- [ ] 13. PathInputComponent実装
  - スタンドアロンコンポーネント作成
  - Reactive Forms使用
  - パス入力・検証機能（PrimeNG InputText、Button使用）
  - PrimeNG Message、FloatLabel活用
  - _要件: 2.3_

- [ ] 14. FileTreeService実装
  - ファイルツリー管理サービス
  - Signalsベースの状態管理
  - APIとの連携機能
  - テスト作成
  - _要件: 2.2_

- [ ] 15. MSW統合（Angular対応）
  - Angular Service Worker統合
  - APIモックハンドラー移行
  - 開発環境設定
  - モック機能テスト
  - _要件: 4.1_

- [ ] 16. ルーティング設定
  - Angular Router設定
  - 遅延読み込み設定
  - ナビゲーション機能
  - ルートガード実装
  - _要件: 1.1, 1.2_

- [ ] 17. エラーハンドリング統合
  - Global Error Handler実装
  - HTTP Error Interceptor統合
  - ユーザーフレンドリーエラー表示
  - エラー処理テスト
  - _要件: 5.4_

- [ ] 18. パフォーマンス最適化
  - OnPush変更検知戦略全体適用
  - Tree Shaking設定
  - バンドルサイズ最適化
  - Lazy Loading実装
  - _要件: 1.3, 1.4_

- [ ] 19. テスト統合・E2E
  - 全コンポーネントテスト統合
  - E2Eテスト作成（Playwright）
  - テストカバレッジ確認
  - CI/CD統合テスト
  - _要件: 4.2_

- [ ] 20. バックエンド連携テスト
  - Fastify APIとの通信確認
  - WebSocket連携テスト
  - CORS設定確認
  - エラーレスポンス処理確認
  - _要件: 5.1, 5.2, 5.3, 5.4_

- [ ] 21. 最終統合・移行完了
  - Angular版との機能確認
  - パフォーマンス測定
  - ユーザビリティテスト
  - 本番環境デプロイ準備
  - _要件: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_
