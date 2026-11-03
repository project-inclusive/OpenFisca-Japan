# フロントエンドのテストレポート

`dashboard` のテスト一覧、コードのタグ、任意の実行結果・網羅率を合わせ、対象 × 観点・条件の空きを調べる。分類に agent は使わない。

## 前提と生成

プロダクトリポジトリのルートで実行する。既存の Python 環境（PyYAML）、Node.js、`dashboard/node_modules` が必要。追加の依存は不要。構文解析には dashboard が既に使っている TypeScript を使う。

```bash
make test-report
# 出力: tmp/test-report/frontend.md
# 保存した一覧だけで再生成する
make test-report TEST_REPORT_ARGS='--offline'
# 低網羅率の候補を 60% 未満に変える
make test-report TEST_REPORT_ARGS='--offline --low-coverage 60'
python -m pytest tools/test_report
```

通常の生成は一覧だけを新規取得し、テスト本体を実行しない。テスト実行は時間・ブラウザー環境を要するため別操作にしている。`dashboard/package.json` は変更しない。`--input-dir` と `--output` はルートからの相対パス（絶対パスも指定可）。一覧・結果は、同じコミット、同じフィルターなしの設定で採取する。

実際の一覧取得コマンドは `viewpoints.yaml` の `stages` にある。

```bash
cd dashboard
npx vitest list --no-static-parse --includeTaskLocation --json
npx vitest list --config vitest.browser.config.mts --no-static-parse --includeTaskLocation --json
npx playwright test --list --reporter=json
```

Vitest 5 の標準の静的一覧は `each` の展開前のため、単体では 919 件になる。`--no-static-parse` はテストモジュールを読み込んで登録を行い、939 件に展開する。テスト本体は実行しないが、モジュールのトップレベル処理・セットアップの読み込みは行う。Browser Mode の一覧にはサーバー・ブラウザーの準備が必要になる場合がある。

一覧を取得できない段階は「未取得」とエラーを表示し、その段階の古い一覧は削除する。不足候補は取得済みの段階だけによる暫定値になる。エラーの全文は `*.list.error.txt` に保存する。`--offline` は明示的に保存済みの一覧を利用する。存在する JSON が壊れていたらエラーで終了する。

## 実行結果と網羅率の追加

以下は一覧取得とは別に、人が必要に応じて実行する。E2E は事前に `npm run build` を実行する。

```bash
mkdir -p tmp/test-report
cd dashboard
npm run test -- --reporter=json --outputFile=../tmp/test-report/unit.results.json
npm run test:ui -- --reporter=json --outputFile=../tmp/test-report/ui.results.json
PLAYWRIGHT_JSON_OUTPUT_NAME=../tmp/test-report/e2e.results.json npm run test:e2e -- --reporter=json
npm run test:unit -- --coverage
npm run test:ui -- --coverage
cd ..
make test-report
```

結果がなければ「未実行」、網羅率がなければ「未計測」と再取得コマンドを出す。結果は最終試行の成功・失敗・スキップを数え、一覧との件数の差も表示する。古い結果の自動判別はできないため、コード更新後は再採取するか削除する。起動時点の失敗で JSON が生成されない場合も、前回の結果を削除してから採取する。

網羅率は [dashboard/COVERAGE.md](../../dashboard/COVERAGE.md) の `coverage/unit/coverage-summary.json` と `coverage/ui/coverage-summary.json` を読む。全体と全ファイルの Statements・Branches・Functions・Lines をそれぞれ出す。unit と UI の値は足さない。既定の 80% は不足の調査先を絞る目安で、CI の合否条件ではない。4 指標のいずれかでunit/UIの高い方が基準未満なら候補とする。分母 0 や `n/a` は低網羅率とみなさない。「両方で 0%」は両方に存在し Statements の分母が正、かつ値が 0% のファイルを出す。

## タグと分類の正本

`viewpoints.yaml` の `viewpoints` が正本である。名前・説明・条件の型を定義し、`観点:条件` をタグとして使う。初期の分類は、入力、遷移、通信、アクセシビリティ、表示、互換、共有、状態の 8 観点。既存の入力正規化・質問遷移・HTTP の失敗・キー操作・表示幅・共有互換・状態変換を分け、不足を別々に確認できるようにした。

```typescript
test('未入力のとき、次へで進めない', { tags: ['input:empty'] }, () => {
  // assertion
});
// Playwright は @ を付ける（レポートでは取り除く）
test(
  '狭い画面のとき、操作できる',
  { tag: ['@compatibility:smoke'] },
  async () => {
    // assertion
  }
);
// Storybook の各 story オブジェクトには name と tags を直接付ける
export const Empty = {
  name: '未入力のとき、入力欄を表示する',
  tags: ['display:present'],
};
```

Vitest の一覧 JSON はタグを出さない。JSON reporter の `assertionResults[].tags` はタグを出す。Playwright の一覧と結果は `specs[].tags` にタグを出す（この版では `@` は除去済み）。このため、テストを実行しなくても分類できるよう、TypeScript の構文解析で各テスト宣言のタグを読み、一覧のファイル・行番号と結ぶ。`each` の複数ケースは同じ宣言に対応する。story は生成された行番号が異なる場合に、明示した story 名で照合する。Vitest の Browser Mode が展開した `storybook (chromium)` などの project 名も受け入れる。

タグは各 `test` / `it` の第 2 引数、Playwright の `tag`、各 story のオブジェクトに、文字列の配列リテラルで直接書く。共有変数や `describe` からの継承・計算したタグは構文アダプターの対象外なので、各宣言にも明記する。対応できない宣言や対象との対応がないテストは「未分類」に残る。Storybook のタグは story のメタデータとして扱い、Vitest の実行結果に同じタグが出ることを前提にしない。

条件を増やす場合は YAML を直し、次で Vitest / Playwright 共通のタグ定義を再生成する。

```bash
python tools/test_report/report.py --write-tags
cd dashboard
npx prettier --write testReportTags.ts
cd ..
make test-report
```

`testReportTags.ts` は unit と Browser Mode の両設定で `test.tags` に設定し、Playwright 設定の `metadata.reportTags` にも公開する。YAML との不一致、未知のテストタグ、存在しない対応先や理由のない対象外は生成エラーになる。

## 対象と期待する条件の編集

`source_index.mjs` はアプリを実行せず、次を抽出する。

- `App.tsx` のルートの `path`
- `questionDefinition.ts` の質問名と「見積もりモード」の選択肢
- 入力テンプレートとエラー画面の実装ファイル
- 給付・貸付・窓口の実装ファイル
- `hooks/calculate.ts` の環境変数との比較値
- `playwright.config.ts` の project 名（ブラウザーと端末）
- テスト・モック・型宣言を除く `src` の実装ファイル

共有形式と送信先の else 分岐は意味上の同値クラスを構文だけで判断できないため `manual_targets` に理由付きで置く。抽出に使う構造を変更したらアダプターと小さな入力の pytest を更新する。必須の対象グループが一つも取れなくなった場合はエラーになる。

`applicability` は対象グループごとに期待する観点・条件、`file_cells` は実装ファイルの具体的な期待条件を指定する。対象はテストの有無に依存せず作る。質問とテンプレートは別の対象として、状態機械のテストだけで質問画面の接続を確認済みにしない。

`bindings` はテストファイルと任意の名前の正規表現から対象を指定する。ファイル名で責務を絞り、複数部品を扱うテストでは名前で対象を絞る。状態機械のテストは現在の質問のタイトル部分だけを質問名に対応づける。E2E の project は同名の端末に対応する。タグが示す条件と対応先の期待条件が一致したますだけを埋める。

`exclusions` には `target`（glob 可）、`cells`（タグの一覧、全条件なら `'*'`）、`reason` を書く。説明文だけの 4 部品と起動入口、説明のみのプライバシーポリシー画面は対象外にしている。選択式の部品に IME の条件を求めないなど、責務の違いも理由付きで除外する。実装ファイルの除外は網羅率データを削除する意味ではなく、網羅率表に対象外と記す。

## 出力の読み方と拡張

空きはテスト追加の候補であり、必ず追加すべきという判定ではない。名前・タグ・対応定義と実際の assertion を確認し、必要がなければ対象外の理由を書く。テストにタグがあるだけでは成功を意味しない。OS ごとの IME、共有コピーの拒否など、現在の条件より細かい要件は条件と対象を追加して表現する。網羅率が高くても assertion が十分とは限らない。

`stages` は段階ごとの一覧・結果ファイル、project、採取・実行コマンドを定義する。契約テストなどの段階は、Vitest 形式の一覧・結果ならこの配列への追加で集計できる。別の runner では Python の入出力アダプターを追加する。アプリのテストはこの道具のためには追加せず、不足候補を別途レビューして補う。

## 冒頭の構成と分類規則

冒頭はファイル別の段階・直接のローカル import・一覧の件数・観点別件数と、全体の受け持ちを示す。型や補助コードの import も対象に含む。複数条件を持つ同じ観点は1テストにつき1件数える。説明の2列は `test_descriptions`、全体の表は `responsibilities` で編集する。新しいファイルに説明がなければ「説明なし」、一覧が取れなければ件数は「未取得」と表示する。

既存の質問状態・世帯変換・進捗・共有URLの4ファイルはテスト本体にタグを加えず、`classification_rules` のファイル名と名前の正規表現で分類する。明示タグと規則の和集合を使う。質問状態と進捗の未知の名前は未分類に残す。世帯変換は「未回答」の有無、共有URLは「旧形式」の有無という既存の規約で分ける。分類と対象の `bindings` は別であり、タグがあっても対象の期待条件に結び付かなければ未分類になる。

低網羅率の候補は両段階に存在するファイルの各指標について、unit/UIの大きい方が基準未満かを判定する。片方で十分な実装を他方の0%だけで候補にしないためである。両段階の数値の結合や和集合の網羅率ではない。分母0は候補に使わず、計測対象の `n/a`・欠測はその指標の判定を保留する。`exclusions` で全条件を対象外にしたファイルは不足候補から外し、段階別の網羅率表には「対象外」を付けて残す。

## 状態機械の分岐と通過の記録

`machine_graph.cjs` は既存のTypeScriptコンパイラーで純粋なモデルだけを読み、`xstate/graph` の `toDirectedGraph` から各状態の宣言を取り出す。`always` も加え、同じeventのガード選択肢、回答保存の自己遷移を分けて数える。構造上の全遷移が分母となり、到達不能な宣言も自動では対象外にしない。

代表回答は質問定義の型と選択肢から作る。Booleanは両値と未回答、人数は0・1・2と未回答（なし・単数・複数）、年齢は0・17・18・64・65と未回答（未成年・成人・高齢の境界の目安）、金額は0・1万円と未回答、単一選択は全選択肢と未回答、複数選択は空・各単独・全選択、住所は東京都新宿区を使う。入力の妥当性や制度の境界値の全検証ではなく、遷移を調べる有限の代表値である。新しい型は黙って省かずエラーにする。

`getAdjacencyMap` は3モード×4続柄×6回答プロファイルについて各質問の1段の隣接を探索する。プロファイルは代表値を順に循環させ、世帯員には2人分を用意し、`back` 用にモードへの合成履歴を置く。完全なcontextと履歴を状態の識別に含め、ガードに影響する値をまとめない。代表回答の保存・next・reset・履歴があるときのbackを試す。探索数は代表値の動作確認であり、合成contextの到達可能性、全回答の組合せ、すべての人数や履歴を網羅したとは扱わない。

通過は名前から推測せず、既存の質問状態テストを実行した際の `@xstate.microstep` で選ばれた遷移を記録する。ガードの同じ到着先も分岐番号で区別する。補助の設定とセットアップを使うため、アプリのテスト・通常の設定・件数は変えない。

```bash
cd dashboard
npm run test -- --config ../tools/test_report/trace.config.mjs --reporter=json --outputFile=../tmp/test-report/unit.results.json
cd ..
make test-report
```

記録は `tmp/test-report/transitions.trace.json` に保存する（`--input-dir` を変える場合は同じディレクトリへコピーする）。モデル・質問定義・質問状態テストのSHA-256が一致するときだけ採用し、不一致や未採取は「判定不能」とする。記録にない遷移は「未通過」と表示する。これは経路準備の `skipUntil` も含む実行の通過であり、各遷移への専用assertionや成功の保証ではない。実行結果の成否と採取した版も併せて確認する。
