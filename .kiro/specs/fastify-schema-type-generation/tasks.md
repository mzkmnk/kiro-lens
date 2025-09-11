# 実装計画

- [x] 1. 基盤構築とTypeBox導入
  - TypeBox関連の依存関係を追加し、基本的なプロジェクト構造を整備する
  - _要件: 1.1, 1.2_

- [x] 1.1 TypeBox依存関係の追加
  - `@sinclair/typebox`をsharedパッケージに追加
  - `@fastify/type-provider-typebox`をバックエンドに追加
  - package.jsonの依存関係を更新してインストール
  - _要件: 1.1, 1.2_

- [x] 1.2 sharedパッケージのスキーマ構造作成
  - `packages/shared/src/schemas/`ディレクトリを作成
  - `api/`、`domain/`、`security/`サブディレクトリを作成
  - 基本的なindex.tsファイルを作成してエクスポート構造を準備
  - _要件: 2.1, 2.2_

- [x] 1.3 Fastify TypeProvider設定
  - `packages/backend/src/app.ts`でTypeBoxTypeProviderを設定
  - TypeBoxValidatorCompilerを設定
  - FastifyTypeboxカスタム型を定義
  - _要件: 1.1, 1.3_

- [x] 2. ドメインスキーマの実装
  - ビジネスロジックの核となるドメインスキーマを定義する
  - _要件: 2.1, 2.2_

- [x] 2.1 ファイルツリードメインスキーマの実装
  - `packages/shared/src/schemas/domain/file-tree.ts`を作成
  - FileItemSchemaを再帰的定義で実装
  - 既存のFileItem型との互換性を確保
  - Static型エクスポートを追加
  - _要件: 2.1, 2.2_

- [x] 2.2 プロジェクトドメインスキーマの実装
  - `packages/shared/src/schemas/domain/project.ts`を作成
  - ProjectInfoSchemaをUUID形式のIDで実装
  - バリデーション関連スキーマ（ValidationResultSchema、DirectoryPermissionsSchema）を実装
  - 既存の型定義との互換性を確保
  - _要件: 2.1, 2.2_

- [x] 2.3 セキュリティスキーマの実装
  - `packages/shared/src/schemas/security/sanitization.ts`を作成
  - SecureStringSchema、SafePathSchema、ProjectIdSchemaを実装
  - 入力サニタイゼーション用のパターン定義
  - _要件: 7.1, 7.2_

- [x] 3. APIスキーマの実装
  - HTTPトランスポート層のスキーマを定義する
  - _要件: 2.1, 2.2_

- [x] 3.1 共通APIスキーマの実装
  - `packages/shared/src/schemas/api/common.ts`を作成
  - ApiResponseSchema、ApiErrorSchemaを実装
  - ResultSchema（Success/Error型）を実装
  - 型ガード関数（isApiSuccess、isApiError）を実装
  - _要件: 4.1, 4.2_

- [x] 3.2 ファイル関連APIスキーマの実装
  - `packages/shared/src/schemas/api/files.ts`を作成
  - ProjectFilesParamsSchemaをUUID形式で実装
  - FileTreeResponseSchemaを実装
  - ドメインスキーマとの適切な連携を確保
  - _要件: 2.1, 2.2, 4.1_

- [x] 3.3 プロジェクト関連APIスキーマの実装
  - `packages/shared/src/schemas/api/projects.ts`を作成
  - プロジェクト一覧、作成、削除、選択のスキーマを実装
  - パスバリデーション用のスキーマを実装
  - _要件: 2.1, 2.2_

- [x] 4. 型定義の自動エクスポート
  - sharedパッケージから型定義を自動エクスポートする仕組みを構築する
  - _要件: 2.1, 2.2, 5.1_

- [x] 4.1 generated.tsファイルの作成
  - `packages/shared/src/types/generated.ts`を作成
  - 全スキーマからのStatic型エクスポートを実装
  - 自動生成コメントとタイムスタンプを追加
  - _要件: 2.1, 2.2, 5.1_

- [x] 4.2 sharedパッケージのindex.ts更新
  - `packages/shared/src/index.ts`を更新
  - スキーマとgenerated型の両方をエクスポート
  - 適切なre-exportの構造を実装
  - _要件: 2.1, 2.2, 5.1_

- [x] 5. バックエンドのTypeBox統合
  - 既存のFastifyルートをTypeBoxスキーマベースに移行する
  - _要件: 1.3, 3.1, 3.2_

- [x] 5.1 files.tsルートのTypeBox化
  - `packages/backend/src/routes/files.ts`を更新
  - ProjectFilesParamsSchemaとFileTreeResponseSchemaを使用
  - 既存のバリデーションロジックをTypeBoxに移行
  - エラーハンドリングをApiResponseSchemaに統一
  - _要件: 1.3, 3.1, 3.2, 4.1_

- [x] 5.2 エラーハンドリングプラグインの実装
  - `packages/backend/src/plugins/error-handler.ts`を作成
  - TypeBoxErrorの詳細なエラーハンドリングを実装
  - 統一されたエラーレスポンス形式を確保
  - _要件: 4.1, 4.2, 7.1_

- [x] 5.3 パフォーマンス最適化の実装
  - `packages/backend/src/config/typebox.ts`を作成
  - OptimizedValidatorクラスを実装
  - スキーマコンパイルとキャッシュ機能を追加
  - _要件: 6.1, 6.2_

- [x] 6. フロントエンドの型安全API統合
  - 既存のAPIクライアントをTypeBoxスキーマベースに置き換える
  - _要件: 2.1, 4.1, 5.1_

- [x] 6.1 TypedApiClientの実装
  - `packages/frontend/src/services/typedApiClient.ts`を作成
  - TypedApiClientクラスを実装（ky基盤）
  - 型安全なHTTPメソッド（get、post、delete）を実装
  - 開発環境でのログ機能を統合
  - _要件: 2.1, 4.1, 5.1_

- [x] 6.2 ProjectApiServiceの実装
  - ProjectApiServiceクラスを実装
  - getProjectFiles、getProjects等のメソッドを型安全に実装
  - エラーハンドリングをApiResponseSchemaベースに統一
  - _要件: 2.1, 4.1, 5.1_

- [x] 6.3 既存APIサービスの置き換え
  - `packages/frontend/src/services/projectApi.ts`を削除
  - `packages/frontend/src/services/fileTreeApi.ts`を削除
  - `packages/frontend/src/services/httpClient.ts`を削除
  - 新しいtypedApiClientを使用するように更新
  - _要件: 2.1, 4.1, 5.1_

- [x] 7. コンポーネントとストアの更新
  - フロントエンドのコンポーネントとストアを新しい型安全APIに対応させる
  - _要件: 4.1, 4.2, 5.1_

- [x] 7.1 React Queryフックの更新
  - 既存のuseQuery、useMutationフックを更新
  - 新しいProjectApiServiceを使用するように変更
  - 型安全性を確保したデータフェッチング
  - _要件: 4.1, 4.2, 5.1_

- [x] 7.2 コンポーネントの型更新
  - FileTreeコンポーネント等で新しい型定義を使用
  - プロパティの型安全性を確保
  - TypeScriptエラーの修正
  - _要件: 4.1, 4.2_

- [ ] 8. テストの実装と更新
  - TypeBoxスキーマのテストと既存テストの更新を行う
  - _要件: 4.1, 4.2, 7.3_

- [ ] 8.1 スキーマテストの実装
  - `packages/shared/src/schemas/__tests__/`ディレクトリを作成
  - files.test.ts、projects.test.ts、common.test.tsを実装
  - Value.Checkを使用したスキーマバリデーションテスト
  - 有効・無効データのテストケースを網羅
  - _要件: 7.3, 7.4_

- [ ] 8.2 バックエンドAPIテストの更新
  - `packages/backend/src/routes/files.test.ts`を更新
  - TypeBoxスキーマベースのテストに変更
  - レスポンス形式の検証を追加
  - _要件: 4.1, 4.2, 7.3_

- [ ] 8.3 フロントエンドAPIテストの更新
  - TypedApiClientとProjectApiServiceのテストを実装
  - モック設定を新しいAPIクライアントに対応
  - 型安全性のテストケースを追加
  - _要件: 4.1, 4.2, 7.3_

- [ ] 9. 開発ツール統合と最適化
  - 開発体験を向上させるツールとスクリプトを整備する
  - _要件: 5.1, 5.2, 6.1_

- [ ] 9.1 VSCode設定の更新
  - `.vscode/settings.json`を更新
  - TypeBoxスキーマのJSON Schema設定を追加
  - TypeScript設定の最適化
  - _要件: 5.1, 5.2_

- [ ] 9.2 開発スクリプトの追加
  - package.jsonに型チェック、スキーマ検証スクリプトを追加
  - 開発環境での自動型チェック設定
  - _要件: 5.1, 5.2, 6.1_

- [ ] 9.3 型推論最適化の実装
  - `packages/frontend/src/types/api-helpers.ts`を作成
  - ExtractApiData、型ガード関数を実装
  - TypeScript型推論の最適化
  - _要件: 6.1, 6.2_

- [ ] 10. 全体統合テストと動作確認
  - システム全体の動作確認と最終調整を行う
  - _要件: 4.1, 4.2, 4.3, 4.4_

- [ ] 10.1 TypeScriptコンパイルエラーの修正
  - 全パッケージでTypeScriptコンパイルを実行
  - 型定義の不整合やエラーを修正
  - 型安全性の最終確認
  - _要件: 4.1, 4.2, 4.3_

- [ ] 10.2 開発サーバーの動作確認
  - `pnpm run dev`でフロントエンドとバックエンドを起動
  - APIエンドポイントの動作確認
  - 型安全性の実行時確認
  - _要件: 4.1, 4.2, 4.3, 4.4_

- [ ] 10.3 E2Eテストの実行
  - 主要なユーザーフローのテスト実行
  - APIレスポンスの型安全性確認
  - エラーハンドリングの動作確認
  - _要件: 4.1, 4.2, 4.3, 4.4_

- [ ] 10.4 パフォーマンステスト
  - TypeBoxバリデーションのパフォーマンス測定
  - フロントエンドの型推論パフォーマンス確認
  - 最適化の効果測定
  - _要件: 6.1, 6.2, 6.3_
