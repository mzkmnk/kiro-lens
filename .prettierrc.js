/**
 * Prettier設定ファイル
 *
 * kiro-lensプロジェクト全体で統一されたコードフォーマットルール
 *
 * 設定方針:
 * - 2スペースインデント（既存コードベースに合わせる）
 * - 100文字行幅（可読性とモニタ幅のバランス）
 * - シングルクォート（JavaScript慣例）
 * - セミコロン必須（TypeScriptベストプラクティス）
 * - ES5準拠の末尾カンマ（互換性重視）
 */
export default {
  // セミコロン: TypeScriptベストプラクティスに従い必須
  semi: true,

  // クォート: JavaScript慣例に従いシングルクォート
  singleQuote: true,

  // インデント: 既存コードベースに合わせて2スペース
  tabWidth: 2,

  // 行幅: 可読性とモニタ幅のバランスを考慮して100文字
  printWidth: 100,

  // 末尾カンマ: ES5準拠で互換性重視
  trailingComma: 'es5',

  // 改行コード: Unix系統一（LF）
  endOfLine: 'lf',

  // オブジェクトリテラルの括弧内スペース
  bracketSpacing: true,

  // JSX要素の最後の>を次の行に配置するか
  bracketSameLine: false,

  // アロー関数の引数が1つの場合の括弧
  arrowParens: 'avoid',

  // 引用符で囲む必要のないオブジェクトプロパティ
  quoteProps: 'as-needed',

  // JSXでのシングルクォート使用
  jsxSingleQuote: true,

  // HTMLの空白感度（CSSのdisplayプロパティを尊重）
  htmlWhitespaceSensitivity: 'css',

  // Vue SFCのスクリプトとスタイルタグのインデント
  vueIndentScriptAndStyle: false,

  // 埋め込み言語のフォーマット
  embeddedLanguageFormatting: 'auto',

  // Angular HTML テンプレート用設定
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
        printWidth: 120, // HTMLテンプレートは少し長めに
        htmlWhitespaceSensitivity: 'ignore', // Angularテンプレートの空白を無視
      },
    },
  ],
};
