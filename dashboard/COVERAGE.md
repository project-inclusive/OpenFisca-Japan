# フロントエンドのテスト網羅率

`dashboard` で既存のテストスクリプトに `--coverage` を渡す。通常のテスト実行では網羅率を計測しない。
`@vitest/coverage-v8` は Vitest と同じ版を使い、ブラウザー側は Chromium で計測する。

```bash
# node・jsdom の単体テスト
npm run test:unit -- --coverage
# story と Browser Mode をまとめて計測
npm run test:ui -- --coverage
```

単体テストは `coverage/unit/`、story と Browser Mode の合算は `coverage/ui/` に出力する。
それぞれ端末のファイル別一覧、`index.html`（未実行行・分岐）、`coverage-summary.json`（ファイル別の Statements・Branches・Functions・Lines）を生成する。
`dashboard/.gitignore` の `/coverage` で生成物を除外している。各実行は自分の出力先を消して作り直すため、前回の結果と混ざらない。

両設定とも `src/**/*.{ts,tsx}` を対象とし、テストが一度も読み込まない実装も 0% として含める。
型宣言、`*.test.*`・`*.spec.*`・`*.stories.*`、`src/mocks/`、`src/testSetup.ts`、`*TestUtils.*` はテスト用のコードなので除外する。
設定データを含む実装の TypeScript は対象に残し、JSON・CSS・画像、`e2e/` や `.storybook/` の補助コードは対象に含めない。
unit と UI は同じ対象を別々に測った値であり、両者の百分率は足さない。E2E の網羅率はここには含まれない。

story と Browser Mode の寄与を分けて調べる場合は、出力先も分けて上書きを防ぐ。

```bash
npm run test:stories -- --coverage --coverage.reportsDirectory=coverage/stories
npm run test:browser -- --coverage --coverage.reportsDirectory=coverage/browser
```

数値はテスト追加先を探すために使う。網羅率の閾値や CI での強制は設定していない。
未実行行・分岐と既存テストの操作・期待値を照合し、表示しただけで検証していない操作や異常系も確認する。
