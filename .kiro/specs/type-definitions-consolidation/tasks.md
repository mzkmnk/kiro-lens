# 実装計画

- [x] 1. 新規共通型定義の作成
  - sharedパッケージに新しい型定義ファイルを作成し、分散している型を統合する
  - _要件: 1.1, 2.1_

- [x] 1.1 ファイルシステム関連型定義の作成
  - `packages/shared/src/types/filesystem.ts`を作成
  - `DirectoryPermissions`、`FileSystemError`、`FileSystemErrorType`型を定義
  - バックエンドの`fileSystemService.ts`から`DirectoryPermissions`型を移動
  - _要件: 2.1, 2.2_

- [x] 1.2 ルートパラメータ型定義の作成
  - `packages/shared/src/types/route-params.ts`を作成
  - `ProjectFilesParams`、`ProjectSelectParams`、`ProjectDeleteParams`、`IdParams`型を定義
  - バックエンドの各ルートファイルで使用されているパラメータ型を統合
  - _要件: 2.1, 2.2_

- [x] 1.3 API型定義の拡張
  - `packages/shared/src/types/api.ts`に型ガード関数を追加
  - `isValidationSuccess`、`isApiSuccess`関数を実装
  - `ApiResult`型を追加してより型安全なエラーハンドリングを提供
  - _要件: 4.1, 4.2_

- [x] 2. 重複型定義の解消
  - バックエンドで重複定義されている型を削除し、sharedからのインポートに変更する
  - _要件: 1.1, 1.2_

- [x] 2.1 ValidationResult型の重複解消
  - `packages/backend/src/services/projectService.ts`の`ValidationResult`型定義を削除
  - sharedパッケージの`ValidationResult`型をインポートするように変更
  - 型の互換性を確認し、必要に応じてshared側の型定義を調整
  - _要件: 1.1, 1.2, 4.1_

- [x] 2.2 DirectoryPermissions型の移動
  - `packages/backend/src/services/fileSystemService.ts`の`DirectoryPermissions`型をsharedに移動
  - バックエンドでsharedからインポートするように変更
  - 型定義の参照を更新
  - _要件: 2.1, 2.2_

- [x] 3. パッケージ固有型の整理
  - フロントエンドとバックエンドで固有の型定義を適切なファイルに整理する
  - _要件: 3.1, 3.2_

- [x] 3.1 フロントエンド固有型の整理
  - `packages/frontend/src/types/components.ts`を作成
  - `FileTreeProps`、`FileTreeItemProps`、`ProjectState`型を定義
  - 既存の`packages/frontend/src/types/file-tree.ts`から型を移動
  - `packages/frontend/src/stores/projectStore.ts`の`ProjectState`型を移動
  - _要件: 3.1, 3.2_

- [x] 3.2 バックエンド固有型の整理
  - `packages/backend/src/types/internal.ts`を作成
  - `ProjectFilesRequest`、`ProjectSelectRequest`、`ServiceConfig`、`FileTreeServiceError`型を定義
  - Fastify固有の型定義を集約
  - _要件: 3.1, 3.2_

- [ ] 4. インポート文の統一と中間層削除
  - 全ファイルのインポート文をsharedからの直接インポートに統一し、不要な再エクスポートを削除する
  - _要件: 5.1, 5.2_

- [ ] 4.1 バックエンドのインポート文更新
  - `packages/backend/src/routes/files.ts`のインポート文を更新
  - `packages/backend/src/services/projectService.ts`のインポート文を更新
  - `packages/backend/src/services/fileSystemService.ts`のインポート文を更新
  - 各ファイルでsharedから直接型をインポートするように変更
  - _要件: 5.1, 5.2_

- [ ] 4.2 フロントエンドのインポート文更新
  - `packages/frontend/src/services/fileTreeApi.ts`のインポート文を更新
  - `packages/frontend/src/services/projectApi.ts`のインポート文を更新
  - `packages/frontend/src/stores/projectStore.ts`のインポート文を更新
  - 各ファイルでsharedから直接型をインポートするように変更
  - _要件: 5.1, 5.2_

- [ ] 4.3 不要な中間層ファイルの削除
  - フロントエンドとバックエンドで不要な型の再エクスポートファイルを特定
  - 不要な`types/index.ts`ファイルがあれば削除
  - 使用されていない型定義ファイルを削除
  - _要件: 5.1, 5.2_

- [ ] 5. sharedパッケージのエクスポート更新
  - 新しく追加した型定義をsharedパッケージのindex.tsからエクスポートする
  - _要件: 2.1, 2.2, 5.1_

- [ ] 5.1 index.tsのエクスポート追加
  - `packages/shared/src/index.ts`に新しい型定義のエクスポートを追加
  - `filesystem.ts`と`route-params.ts`の型をエクスポート
  - 型ガード関数のエクスポートを追加
  - _要件: 2.1, 2.2, 5.1_

- [ ] 6. TypeScriptコンパイルエラーの修正
  - 型定義の変更により発生するコンパイルエラーを修正する
  - _要件: 4.1, 4.2, 4.3_

- [ ] 6.1 バックエンドのコンパイルエラー修正
  - バックエンドパッケージでTypeScriptコンパイルを実行
  - 型定義の変更により発生したエラーを修正
  - 型の不整合や未定義の型参照を解決
  - _要件: 4.1, 4.2, 4.3_

- [ ] 6.2 フロントエンドのコンパイルエラー修正
  - フロントエンドパッケージでTypeScriptコンパイルを実行
  - 型定義の変更により発生したエラーを修正
  - 型の不整合や未定義の型参照を解決
  - _要件: 4.1, 4.2, 4.3_

- [ ] 7. 全体の動作確認
  - 型定義の統合が完了した後、アプリケーション全体の動作を確認する
  - _要件: 4.1, 4.2, 4.3, 4.4_

- [ ] 7.1 開発サーバーの起動確認
  - `pnpm run dev`でフロントエンドとバックエンドが正常に起動することを確認
  - TypeScriptコンパイルエラーが発生しないことを確認
  - 型定義の変更がランタイムエラーを引き起こしていないことを確認
  - _要件: 4.1, 4.2, 4.3, 4.4_
