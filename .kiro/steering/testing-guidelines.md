# テストガイドライン

## 基本原則

### YAGNI原則に基づくテスト設計

- **必要最小限**: 仕様に沿った最低限のテストのみを作成する
- **実用性重視**: 実際のバグを発見できるテストに集中する
- **保守性**: テストコードも保守コストを考慮して設計する

### 避けるべきテスト

#### 型定義テスト

```typescript
// ❌ 避ける - TypeScriptコンパイラがチェックするため不要
expect(typeof value.port).toBe('number');
expect(value).toMatchObject({
  port: expect.any(Number),
  verbose: expect.any(Boolean),
});
```

#### ライブラリの基本機能テスト

```typescript
// ❌ 避ける - Commander.js自体の機能をテストしている
expect(program.options).toHaveLength(6);
expect(options.find(opt => opt.short === '-p')).toBeDefined();
```

#### 過度なモックテスト

```typescript
// ❌ 避ける - 複雑なモック設定で実装と乖離
vi.mock('./module.js', async () => {
  const actual = await vi.importActual('./module.js');
  return { ...actual, func: vi.fn() };
});
```

#### 重複テスト

```typescript
// ❌ 避ける - 同じ機能を複数の方法でテスト
test('ポート番号バリデーション1', () => {
  /* ... */
});
test('ポート番号バリデーション2', () => {
  /* ... */
});
test('ポート番号の型安全性', () => {
  /* ... */
});
```

### 推奨するテスト

#### 仕様の核心機能

```typescript
// ✅ 推奨 - 実際の仕様要件をテスト
test('無効なポート番号でエラーになる', async () => {
  const program = createProgram();
  await expect(async () => {
    await program.parseAsync(['node', 'app', '--port', 'invalid']);
  }).rejects.toThrow('Port must be a number');
});
```

#### エラーハンドリング

```typescript
// ✅ 推奨 - 実際のエラーケースをテスト
test('範囲外のポート番号でエラーになる', async () => {
  const program = createProgram();
  await expect(async () => {
    await program.parseAsync(['node', 'app', '--port', '70000']);
  }).rejects.toThrow('Port must be between 1 and 65535');
});
```

#### ビジネスロジック

```typescript
// ✅ 推奨 - アプリケーション固有のロジックをテスト
test('同じポート番号でエラーになる', async () => {
  const program = createProgram();
  await expect(async () => {
    await program.parseAsync(['node', 'app', '--frontend-port', '3000', '--backend-port', '3000']);
  }).rejects.toThrow('Frontend and backend ports must be different');
});
```

## テスト構造

### シンプルな構成

```typescript
import { describe, test, expect } from 'vitest';
import { functionToTest } from './module.js';

describe('機能名', () => {
  test('正常ケース', () => {
    // テスト内容
  });

  test('エラーケース', () => {
    // テスト内容
  });
});
```

### 避けるべき複雑な構成

```typescript
// ❌ 避ける - 過度に複雑な構成
describe('機能A', () => {
  describe('サブ機能1', () => {
    describe('詳細機能1-1', () => {
      beforeEach(() => {
        /* 複雑なセットアップ */
      });
      test('ケース1', () => {
        /* ... */
      });
      test('ケース2', () => {
        /* ... */
      });
    });
  });
});
```

## 実装指針

### テスト駆動開発（TDD）

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードを改善

### テストの粒度

- **単体テスト**: 個別の関数・メソッドの動作確認
- **統合テスト**: モジュール間の連携確認
- **E2Eテスト**: ユーザーシナリオの確認

### 命名規則

```typescript
// ✅ 推奨 - 何をテストしているかが明確
test('無効なポート番号でエラーになる', () => {});
test('設定ファイルが正しく読み込まれる', () => {});

// ❌ 避ける - 抽象的で意図が不明
test('バリデーション', () => {});
test('正常ケース', () => {});
```

## チェックリスト

### テスト作成時

- [ ] 仕様要件を直接テストしているか？
- [ ] 型定義テストになっていないか？
- [ ] ライブラリの基本機能をテストしていないか？
- [ ] 実際のバグを発見できるか？
- [ ] テストの意図が明確か？

### テストレビュー時

- [ ] 不要なモックがないか？
- [ ] 重複テストがないか？
- [ ] テスト名が適切か？
- [ ] 保守しやすい構造か？
- [ ] 実装と乖離していないか？
