# フロントエンドのテストレポート

`dashboard` のテスト一覧、コードのタグ、任意の実行結果・網羅率を合わせ、対象 × 観点 × 条件の確認ケースのうち、テストのないものを調べる。分類に agent は使わない。

テストを足す・名前を変える・消すときに `viewpoints.yaml` で直すところと、直さないときの動きは [docs/dev_note.md](../../docs/dev_note.md#テストを足すときにテストのレポートの定義で直すこと) の「テストを足すときに、テストのレポートの定義で直すこと」にある。

## 前提と生成

プロダクトリポジトリのルートで実行する。`make install` で入る Python の開発の依存（PyYAML・`viewpoints.yaml` の形を確かめる `jsonschema`）、Node.js、`dashboard/node_modules` が必要。構文解析には dashboard が既に使っている TypeScript を使う。

```bash
make test-report
# 出力: tmp/test-report/frontend.md（結論と集計）と、同じディレクトリの 6 つの CSV（詳細）
# CSV の出力先を変える（tests.csv の名前と、ほかの CSV を置くディレクトリが変わる）
make test-report TEST_REPORT_ARGS='--csv tmp/report-csv/all-tests.csv'
# 保存した一覧だけで再生成する
make test-report TEST_REPORT_ARGS='--offline'
# 低網羅率の候補を 60% 未満に変える
make test-report TEST_REPORT_ARGS='--offline --low-coverage 60'
python -m pytest tools/test_report
```

道具の pytest は CI に入れない。`report.py`・アダプター・`viewpoints.yaml`・スキーマとそのテストを変えたときに、変えた人が `python -m pytest tools/test_report` を手で流し、pull request の本文に結果を書く。

通常の生成は一覧だけを新規取得し、テスト本体を実行しない。テスト実行は時間・ブラウザー環境を要するため別操作にしている。`dashboard/package.json` は変更しない。`--input-dir`・`--output`・`--csv` はルートからの相対パス（絶対パスも指定可）。一覧・結果は、同じコミット、同じフィルターなしの設定で採取する。

実際の一覧取得コマンドは `viewpoints.yaml` の `stages` にある。

```bash
cd dashboard
npx vitest list --no-static-parse --includeTaskLocation --json
npx vitest list --config vitest.browser.config.mts --no-static-parse --includeTaskLocation --json
npx playwright test --list --reporter=json
```

Vitest 5 の標準の静的一覧は `each` の展開前の宣言を数えるため、実行される件数より少なくなる。`--no-static-parse` はテストモジュールを読み込んで登録を行い、`each` と `describe.each` を実行時と同じ件数に展開する。テスト本体は実行しないが、モジュールのトップレベル処理・セットアップの読み込みは行う。Browser Mode の一覧にはサーバー・ブラウザーの準備が必要になる場合がある。

一覧を取得できない段階は「未取得」とエラーを表示し、その段階の古い一覧は削除する。不足候補は取得済みの段階だけによる暫定値になる。エラーの全文は `*.list.error.txt` に保存する。`--offline` は明示的に保存済みの一覧を利用する。存在する JSON が壊れていたらエラーで終了する。

## 実行結果と網羅率の追加

以下は一覧取得とは別に、人が必要に応じて実行する。E2E は事前に `npm run build` を実行する。unit は補助の `trace.config.mjs` で流し、同じ実行で状態機械の遷移の通過も記録する（仕組みは「状態機械の分岐と通過の記録」の節）。ふつうの設定で流すと記録がなく、遷移はすべて「判定不能」になる。

```bash
mkdir -p tmp/test-report
cd dashboard
npm run test -- --config ../tools/test_report/trace.config.mjs --reporter=json --outputFile=../tmp/test-report/unit.results.json
npm run test:ui -- --reporter=json --outputFile=../tmp/test-report/ui.results.json
PLAYWRIGHT_JSON_OUTPUT_NAME=../tmp/test-report/e2e.results.json npm run test:e2e -- --reporter=json
npm run test:unit -- --coverage
npm run test:ui -- --coverage
cd ..
make test-report
```

結果がなければ「実行結果がないため、通ったかは分からない」、網羅率がなければ「網羅率を測っていないため、網羅率が低いファイルは判定できない」と結論の文で書き、再取得のコマンドを注記に出す。結果は最終試行の成功・失敗・スキップを数え、一覧との件数の差も表示する。古い結果の自動判別はできないため、コード更新後は再採取するか削除する。起動時点の失敗で JSON が生成されない場合も、前回の結果を削除してから採取する。

網羅率は、上の `--coverage` の実行で `dashboard` に出力される `coverage/unit/coverage-summary.json` と `coverage/ui/coverage-summary.json` を読む。計測の設定と読み方は [docs/dev_note.md](../../docs/dev_note.md) の「テストの網羅率」にある。Statements・Branches・Functions・Lines を、全体は Markdown に、ファイルごとは `coverage.csv` に出す。unit と UI の値は足さない。既定の 80% は不足の調査先を絞る目安で、CI の合否条件ではない。4 指標のいずれかでunit/UIの高い方が基準未満なら候補とする。分母 0 や `n/a` は低網羅率とみなさない。「両方で 0%」は両方に存在し Statements の分母が正、かつ値が 0% のファイルを出す。

## Markdown と CSV の分担

`frontend.md` は、人が最初に開いて状況をつかむための結論と集計だけを載せる。1 行ずつの詳細は種類ごとの CSV に出し、表計算のソフトで絞り込んで確かめる。CSV は `--csv` で指定した `tests.csv` と同じディレクトリ（既定は `tmp/test-report/`）に、毎回すべて書き直す。

**確認ケース**は、確かめる対象 × 観点 × 条件の組み合わせである。たとえば「年齢の入力欄 × 入力 × 境界値」（`template:ageQuestionTemplate` × `input` × `input:boundary`）が 1 つの確認ケースで、テスト 1 件とは別に数える。1 つの確認ケースを複数のテストが確かめることも、1 つのテストが複数の確認ケースを確かめることもある。`cases.csv` の 1 行が 1 つの確認ケースである。それぞれの値は `viewpoints.yaml` の次のキーから来る。

- 対象: 構文と実装ファイルから取り出した対象と `manual_targets` の `id`。対象のグループ（`template` など）が `applicability` のキーになる。
- 観点: `viewpoints` のキー（`input` など）。
- 条件: その観点の `viewpoints.<観点>.conditions` の値を `観点:条件` の形にしたもの（`input:boundary` など）。対象ごとに期待する条件は、`applicability` の対象のグループの値（実装ファイルは `file_cells` があればその値）である。

確認ケースの状態は、`テストあり`（`bindings` で対象に結び付いたテストのタグが条件と一致した）・`テストなし（不足の候補）`（理由のないテストの不足）・`対象外（理由つき）`（`exclusions` に理由がある）のどれかである。

`frontend.md` の各節は、その節で分かったことの結論の 1〜2 文（何件か、通ったか、何が残っているか）から始める。作り方・数え方・読み方の注意（一覧を実行せずに集めること、件数の展開、最終試行、同じ版の確認、単体とコンポーネントの網羅率を足さないこと、`n/a` の扱い、基準と抽出のしかた、遷移の数え方と隣接探索、ハッシュの一致、英語の識別子）は、最後の「注記」の節に番号つきでまとめ、本文には「注記 2」のように番号だけを書く。注記はいつも同じ順に全部出すので、番号は入力によって変わらない。結果・網羅率・遷移の記録がないときは、「実行結果がないため、通ったかは分からない。取り方は注記 2。」のように結論の文で言い切り、採取のコマンドは注記に出す。

| `frontend.md` の節 | Markdown に載せるもの | 詳細の CSV |
| --- | --- | --- |
| 集計（タイトルと説明の直後） | 結論の文（テストの件数と結果、未分類のテストの数、テストのない確認ケースの数と多い観点）と確認ケースの説明。段階・E2E の project ごとのファイル数と件数の表。未分類のテストの数、テストのない確認ケースの数（計と観点ごと）、段階ごとの成功・失敗の数（結果がなければ結果なし）、網羅率の全体の 4 指標（未計測を含む）、基準を下回ったファイルの数、状態機械の遷移の通過・未通過・判定不能の数を 1 つの表にまとめ、それぞれの詳しい節と CSV を示す | 各行に書いた CSV |
| テストの構成 | 結論の文（ファイル数、件数の多いファイル、説明のないファイル）。ファイルごとの段階・import・件数・観点の内訳（`<details>` で折りたたみ、`<summary>` にファイル数と件数）、全体の受け持ち。確かめていること・いないことは `docs/frontend_test_note.md` への案内だけにする | `tests.csv` |
| 確認ケース | 結論の文（確認ケースの数と状態ごとの数）。観点ごと・対象のグループごとの状態ごとの数と計 | `cases.csv` |
| テストの状況 | 結論の文（通ったか、失敗の数と `tests.csv` での絞り方、結果のない段階、一覧との件数の差）。結果のある段階の成功・失敗・スキップ・未実行・読み込みの失敗の数 | `tests.csv` の `結果` |
| 状態機械の分かれ道 | 結論の文（通過した遷移の数、未通過の数、記録がない・版が違うときはそのこと）。ガードのある遷移・代表回答を決めた質問・隣接探索の数、遷移の分母・通過・未通過・判定不能の表 | `transitions.csv`、`representatives.csv` |
| 網羅率 | 結論の文（全体の 4 指標、基準を下回ったファイルと両方で 0% のファイルの数、測っていない段階）。段階ごとの全体の 4 指標とファイル数、判定したファイル・対象外のファイルの数 | `coverage.csv` |
| 不足しているテスト | 結論の文（テストのない観点、未分類のテストの数、テストのない確認ケースの数）。未分類のテストの一覧（すぐ対処が要るため、件数だけにしない。0 件のときは出さない） | `cases.csv`、`tests.csv` の `未分類` |
| 詳細の CSV | 各 CSV の 1 行の単位・行数・絞り方の例 | — |
| 注記 | 作り方・数え方・読み方の注意と、一覧・実行結果・遷移の記録・網羅率の採取のコマンド。対象の抽出のしかたと、対象の数・手で定義した対象のグループごとの数 | `targets.csv` |

集計の表は「最初に見て対処が要るか」を決める数だけにした。観点ごとのテストあり・対象外、対象のグループごとの数、段階ごとのスキップ・未実行、網羅率のファイル数・対象外、隣接探索の数は、判断の前に要るものではないため後ろの節に残す。

対象の抽出根拠は、以前は 1 つの節だったが、注記に移した。対象をどう取り出したかは作り方の説明でありテストの結論ではないこと、対象のグループごとの対象の数は「確認ケース」の節の表にもあること、対象ごとのソースと理由は `targets.csv` で絞るほうが確かめやすいことによる。

Markdown の件数と CSV の行は同じ入力から作る。pytest は、CSV ごとの列と行数、確認ケースの状態・テストなし（計と観点ごと）・未分類・遷移の通過・網羅率の全体の値と判定・対象の抽出の数が、Markdown の集計の表、結論の文、後ろの節と一致することを確かめる。結論の文（結果がある・ない・失敗がある場合）、各節が結論の文から始まること、注記の番号と本文の参照、作り方の言葉と英語の識別子が本文になく注記にあること、古い用語が残っていないことも確かめる。

CSV の行は、次の決まった順に並べる。一覧を取り直すとテストの並びが変わるため、同じテストの集合からは、何度作っても同じバイト列になるようにしている（前の回の CSV と比べたときに、並びの差が出ない）。pytest は、収集の順を入れ替えた一覧から `frontend.md` とすべての CSV が同じバイト列になることを確かめる。

| CSV | 行の順 |
| --- | --- |
| `tests.csv` | 段階（`stages` の定義の順）・ファイル・行（数の順。行のないテストは最後）・テスト名・project。これが同じテストは残りの列の値の順 |
| `cases.csv` | 対象の ID の順。同じ対象の中は期待する条件の定義の順。`確かめたテスト` の中も `tests.csv` と同じ順 |
| `transitions.csv` | 状態機械の宣言の順（`machine_graph.cjs` の出力の順。同じ版のモデルからは同じ順になる）。`通過したテスト` の中は名前の順 |
| `representatives.csv` | 質問の名前の順 |
| `coverage.csv` | 段階（`unit`・`ui`）の順、同じ段階の中はファイルの順 |
| `targets.csv` | 対象の ID の順 |

Markdown の「未分類のテスト」の一覧も `tests.csv` と同じ順に並べる。

どの CSV も Python 標準の `csv` で書く（`,`・`"`・改行を含む値は `"` で囲み、`"` は 2 つ重ねる。行の区切りは CRLF）。文字コードは BOM 付きの UTF-8 にする。日本語版の Excel は BOM のない CSV を Shift_JIS として開き、テスト名が文字化けするためである。LibreOffice、Google スプレッドシート、Python（`encoding="utf-8-sig"`）も BOM 付きのまま読める。1 つのセルに複数の値を入れるとき、観点・条件・対象・基準未満の指標は `; `、テストと遷移を通したテストの一覧は改行で区切る（テスト名に `; ` が入りうるため）。

### `tests.csv`（テスト 1 件を 1 行）

一覧のテスト 1 件（パラメーターと project を展開した 1 件）を 1 行にする。一覧を取得できなかった段階のテストは行に出ない（Markdown の「未取得」を確かめる）。

| 列 | 内容 |
| --- | --- |
| 段階 | `stages` の `id`（`unit`・`ui`・`e2e`） |
| project | 一覧の project 名（`storybook (chromium)`・`webkit` など） |
| ファイル | `dashboard` からの相対パス |
| 行 | 一覧の行番号。ない場合は空 |
| テスト名 | `describe` などの親の名前を ` > ` でつないだ名前 |
| 観点 | 条件のタグの観点（`input` など）。重複を除き `; ` で区切る |
| 条件 | コードのタグと `classification_rules` の和集合（`input:empty` など）。`; ` で区切る |
| 対象 | このテストが確かめた確認ケース（状態が `テストあり`）の対象。`; ` で区切る。ないときは空 |
| 未分類 | Markdown の「未分類のテスト」に出るテストは `はい`、ほかは `いいえ` |
| 結果 | 実行の結果。成功・失敗・スキップ・未実行のどれか。その段階の結果 JSON がないときは空 |

結果は Markdown の「テストの状況」と同じ最終試行の数え方を使う。E2E はファイル・名前・project で、Vitest はファイルと名前（`ancestorTitles` と `title` を ` > ` でつなぐ）で結果を一覧に結ぶ。同じキーの結果が複数あるときは結果の JSON の順に割り当てる。結果 JSON はあるが一覧のテストに結ぶ結果がないときは「未実行」とする。未知の状態は英語の値のまま出す。

### `cases.csv`（確認ケース 1 つを 1 行）

対象ごとに期待する確認ケース（`applicability`・`file_cells`）を、テストの有無によらず全部出す。確認ケースの定義と値の出どころは「Markdown と CSV の分担」の節にある。

| 列 | 内容 |
| --- | --- |
| 対象 | 対象の ID（`template:ageQuestionTemplate`・`file:src/App.tsx` など） |
| 対象のグループ | 対象のグループ（`template`・`file`・`question` など） |
| 観点 | 条件のタグの観点（`input` など） |
| 条件 | 期待する条件のタグ（`input:empty` など） |
| 状態 | `テストあり`（確かめているテストがある）・`テストなし（不足の候補）`（理由のないテストの不足）・`対象外（理由つき）`（`exclusions` に理由がある）のどれか |
| テスト数 | 確かめたテストの数。テストなしと対象外は 0 |
| 確かめたテスト | `段階 / project / 名前 (ファイル:行)` を改行で区切る。行がないときは `?` |
| 対象外の理由 | `exclusions` の `reason`。複数あるときは ` / ` で区切る。対象外でなければ空 |

### `transitions.csv`（宣言された遷移 1 つを 1 行）

| 列 | 内容 |
| --- | --- |
| 遷移ID | `状態 / event / 分岐` の形の ID（実行記録の照合に使う） |
| 状態 | 出発の状態 |
| event | event の名前。自動の遷移は `always` |
| 分岐 | 同じ状態と event の選択肢のうちの番号（0 から） |
| 到着先 | 到着の状態。複数のときは `, ` で区切る |
| ガード | `あり`・`なし` |
| 通過 | `通過`・`未通過`・`判定不能`（実行記録がない、または版が不一致） |
| 通過したテスト | 実行記録でこの遷移を通したテスト。改行で区切る |

### `representatives.csv`（代表回答を決めた質問 1 つを 1 行）

| 列 | 内容 |
| --- | --- |
| 質問 | 質問の名前 |
| 代表回答の数 | 隣接探索に使う代表回答の数 |
| 代表回答（JSON） | 代表回答の配列（未回答は `selection` のない値） |

### `coverage.csv`（ファイル×段階を 1 行）

計測した段階（`unit`・`ui`）ごとに、`coverage-summary.json` のファイルを 1 行ずつ出す。Istanbul の全体の値は `ファイル` が `total` の行にある。未計測の段階の行はない（Markdown の「未計測」と採取コマンドを確かめる）。

| 列 | 内容 |
| --- | --- |
| ファイル | `dashboard` からの相対パス。全体は `total` |
| 段階 | `unit`・`ui` |
| Statements・Branches・Functions・Lines | その段階の百分率（`%` なしの数）。`Unknown` などの値はそのまま出す |
| 対象外 | `exclusions` で全条件を対象外にしたファイルは `はい`、ほかは `いいえ` |
| 基準未満の指標 | unit/UI の高い方が基準を下回った指標と値（`branches=40%; lines=70%` など）。下回らない、判定しない（片方の段階にしかない・対象外・`total`・未計測の段階がある）ときは空 |
| 両方で0% | 両段階で Statements の分母が正かつ 0% なら `はい`、判定したほかのファイルは `いいえ`、判定しないときは空 |

基準未満と両方で0%の列は、同じファイルの unit と ui の行に同じ値を入れる。Markdown の「基準を下回ったファイル」の数は、この列が空でないファイルの数（行の数ではない）。

### `targets.csv`（対象 1 つを 1 行）

対象の抽出根拠は対象 1 つにつき 1 行の情報で、対象は 150 を超えるため、Markdown の表にせず CSV にする。Markdown には、注記に対象の数と、手で定義した対象のグループごとの数だけを残す。

| 列 | 内容 |
| --- | --- |
| 対象 | 対象の ID |
| グループ | 対象のグループ |
| ソース | 抽出したソースのファイル（`dashboard` からの相対パス） |
| 抽出 | `構文・ファイル`（`source_index.mjs` と実装ファイルから抽出）・`手動`（`manual_targets`） |
| 手動定義の理由 | `manual_targets` の `reason`。抽出した対象は空 |

### 使い方の例

- `tests.csv` を Excel で開き、「データ」→「フィルター」で `結果` を「失敗」に絞る。`観点` や `条件` の列で「テキスト フィルター」→「指定の値を含む」を使い、`a11y` のテストを並べる。`未分類` が `はい` の行を絞り、タグか `classification_rules` を足す先を探す。
- `cases.csv` で `状態` を「テストなし（不足の候補）」に絞り、`観点` や `対象のグループ` で並べて、足すテストの候補を探す。「対象外（理由つき）」に絞って `対象外の理由` を見直す。
- `transitions.csv` で `通過` を「未通過」に絞り、`状態` で並べる。
- `coverage.csv` で `基準未満の指標` を「(空白以外)」に絞る。`段階` を絞って `Branches` を昇順に並べる。

## `viewpoints.yaml` の構成

`viewpoints.yaml` はこの道具の定義の正本で、トップレベルのキーは次の 13 個である。形（キー・必須の項目・型）の正本は `viewpoints.schema.json`（JSON Schema draft-07）で、各キーと項目の `description` も書いてある。

- 編集のとき: YAML の先頭の `# yaml-language-server: $schema=./viewpoints.schema.json` により、VS Code の YAML の拡張（`redhat.vscode-yaml`）が補完と誤りを出す。
- 生成のとき: `report.py` は YAML を読んだ直後に、`jsonschema` の `Draft7Validator` でスキーマを当てて形を確かめる。知らないキー（項目名の打ち間違いを含む）、必須の項目の漏れ、型の誤り、空の文字列・配列を、誤りごとに `(root).stages[1]: Additional properties are not allowed ('comand' was unexpected)` のようなキーの道すじつきの 1 行にまとめた `ValueError` で止める。`files` の要素のように形を選べる項目（`oneOf`）は、値と同じ型の形での誤り（`'qualities' is a required property` など）を出す。`jsonschema` が入っていないときは、`make install` を流すように案内して止まる。中身の食い違い（存在しない対象・ファイル、知らないタグ、理由のない対象外など）は、その後の検査で止まる。
- スキーマを直すとき: draft-07 のキーワードを使える。`$ref` の横に `description` を書くと draft-07 では無視されるため、説明を付ける項目は型をその場に書く。

型の「文字列」は空でない文字列、「配列」は 1 つ以上の要素を持つ配列である。タグは `観点:条件`（どちらも英小文字と数字）。パスは `dashboard` からの相対パス。

| キー | 必須 | 役割 | 効く出力 |
| --- | --- | --- | --- |
| `version` | 必須 | 定義の形の版 | なし（形の検査だけ） |
| `viewpoints` | 必須 | 観点と条件（タグの語彙） | `dashboard/testReportTags.ts`、`frontend.md`、`tests.csv`、`cases.csv` |
| `stages` | 必須 | 段階ごとの一覧・結果のファイルとコマンド | `frontend.md`（集計・テストの状況・注記）、`tests.csv` |
| `applicability` | 必須 | 対象のグループごとに期待する条件 | `frontend.md`（確認ケース）、`cases.csv` |
| `manual_targets` | 任意 | 手で定義する対象 | `frontend.md`（注記）、`targets.csv`、`cases.csv` |
| `exclusions` | 任意 | 理由つきの対象外 | `frontend.md`（確認ケース・網羅率）、`cases.csv`、`coverage.csv` |
| `bindings` | 必須 | テストと対象の対応 | `frontend.md`（確認ケース・未分類）、`cases.csv`、`tests.csv` |
| `file_cells` | 任意 | 実装ファイルごとに期待する条件 | `frontend.md`（確認ケース）、`cases.csv` |
| `classification_rules` | 任意 | タグのないテストの分類 | `frontend.md`、`tests.csv`、`cases.csv` |
| `test_descriptions` | 任意 | ファイルごとの確かめていること・いないこと | `docs/frontend_test_note.md`、`frontend.md`（テストの構成の説明のないファイル） |
| `responsibilities` | 任意 | 段階ごとの全体の受け持ち | `frontend.md`（テストの構成）、`docs/frontend_test_note.md` |
| `qualities` | 任意 | 機能をまたぐ品質の観点 | `docs/frontend_test_note.md` |
| `features` | 任意 | 機能ごとの結論と根拠のファイル | `docs/frontend_test_note.md` |

`features` は `--write-test-note` のときだけ要る（ないとエラー）。`frontend.md` と CSV を作り直すのは `make test-report`、`testReportTags.ts` は `--write-tags`、`docs/frontend_test_note.md` は `--write-test-note` である。

### `version`

定義の形の版で、整数の `1` だけを受け付ける。キーや項目の形を変えるときに上げ、スキーマと `report.py` を合わせて直す。例: `version: 1`

### `viewpoints`

キーは観点の ID（英小文字と数字）、値は `name`（必須、文字列。レポートに出す名前）・`description`（必須、文字列）・`conditions`（必須、英小文字と数字の配列）。`観点:条件` が、テストのタグと `applicability`・`file_cells`・`exclusions`・`classification_rules` の条件になる。使い方は「タグと分類の正本」の節。

```yaml
input:
  name: 入力
  description: 値の変換、未回答と入力制約
  conditions: [normal, empty]
```

### `stages`

配列の要素は `id`（英小文字と数字。`e2e` は Playwright、ほかは Vitest の形で読む）・`name`・`projects`（文字列の配列）・`list` と `result`（`--input-dir` の中の `*.json` のファイル名）・`command`（一覧を取る引数の配列）・`run`（結果の採取のコマンド）で、すべて必須。例: `{id: unit, name: 単体, projects: [unit], list: unit.list.json, result: unit.results.json, command: [node_modules/.bin/vitest, list, --json], run: npm run test}`。段階の足し方は「出力の読み方と拡張」の節。

### `applicability`

キーは対象のグループ（`route`・`template`・`file` など）、値は期待する条件のタグの配列。抽出した対象のないグループはエラーになる。`file` は `file_cells` にない実装ファイルの既定値。例: `route: [transition:forward, a11y:keyboard]`。使い方は「対象と期待する条件の編集」の節。

### `manual_targets`

配列の要素は `id`（`グループ:名前`）・`group`（`applicability` のキー）・`source`（根拠の実装ファイル）・`reason`（手で定義する理由）で、すべて必須の文字列。例: `{id: environment:other, group: environment, source: src/hooks/calculate.ts, reason: else 分岐は…}`。

### `exclusions`

配列の要素は `target`（対象の ID。glob を使える）・`cells`（タグの配列。すべての条件なら `'*'`）・`reason`（文字列）で、すべて必須。例: `{target: result:給付, cells: [display:unit], reason: 貸付の単位は給付の責務ではない。}`。網羅率への効き方は「対象と期待する条件の編集」の節。

### `bindings`

配列の要素は `file`（必須、テストのファイル。glob を使える）・`targets`（必須、対象の ID の配列）・`name`（任意、テストの名前の正規表現。ないときはすべての名前）。例: `{file: src/state/convert.test.ts, targets: [file:src/state/convert.ts]}`。状態機械のテストの質問名と E2E の project の端末は、ここに書かなくても結ぶ（「対象と期待する条件の編集」の節）。

### `file_cells`

キーは実装ファイル（`src/` から）、値は期待する条件のタグの配列で、そのファイルの `applicability` の `file` を置き換える。例: `src/state/convert.ts: [state:conversion, state:optional]`。

### `classification_rules`

配列の要素は `file`（テストのファイル。glob を使える）・`name`（テストの名前の正規表現）・`tags`（足す条件のタグの配列）で、すべて必須。例: `{file: src/state/convert.test.ts, name: 未回答, tags: [state:optional]}`。書き方は「冒頭の構成と分類規則」の節。

### `test_descriptions`

キーはテストのファイル、値は `verifies`（確かめていること）と `does_not_verify`（確かめていないこと）で、どちらも必須の文字列。ないファイルは `frontend.md` の「テストの構成」に説明のないファイルとして出て、どれかの `features` に置かないと `--write-test-note` がエラーになる。例: `src/state/progress.test.ts: {verifies: 決まった時点で進捗の値を確かめる。, does_not_verify: 途中の全値。}`

### `responsibilities`

配列の要素は `area`（受け持ちの名前）・`stages`（`unit / ui` のような文字列）・`scope`（範囲）で、すべて必須の文字列。例: `{area: 通し, stages: e2e, scope: 5設定でホームと見積もりの固定経路。}`

### `qualities`

配列の要素は `id`（英小文字と数字。`behavior` は振る舞いのために予約）・`name`・`description`（確かめ方）で、すべて必須。`features` の `files` が `id` で参照する。例: `{id: a11y, name: a11y, description: キーボード操作・フォーカスと自動 a11y 検査。}`

### `features`

配列の要素は `name`（機能の名前）・`guarantees`（保証していること）・`risks`（テストが通っても本番で起こりうること）・`files`（根拠のファイルの配列）で、すべて必須。`files` の要素は、文字列（振る舞いを確かめるファイル）か `{file, qualities}`（`qualities` は `qualities` の `id` か `behavior` の配列）。例: `{name: 共有, guarantees: …, risks: …, files: [src/components/result/shareLink.test.ts, {file: e2e/Homepage.spec.ts, qualities: [journey]}]}`。書き方は「機能ごとの説明の文書」の節。

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

テストの行番号は、第1引数の名前の開始行（`nameLine`）、呼び出し対象の式の末尾行（`callLine`）、宣言の開始行（`line`）の順で照合する。Browser Mode が `it.each` の次の行の名前を指す場合にも、同じ宣言のタグを使う。同じ優先順位で複数の宣言が一致した場合は、構文の走査順で先の宣言を採用し、別の宣言のタグは混ぜない。行番号がない、または一致する宣言がない場合はタグを補わない。

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

`bindings` はテストファイルと任意の名前の正規表現から対象を指定する。ファイル名で責務を絞り、複数部品を扱うテストでは名前で対象を絞る。状態機械のテストは現在の質問のタイトル部分だけを質問名に対応づける。E2E の project は同名の端末に対応する。タグが示す条件と対応先の期待条件が一致した確認ケースだけを「テストあり」にする。

`exclusions` には `target`（glob 可）、`cells`（タグの一覧、全条件なら `'*'`）、`reason` を書く。説明文だけの 4 部品と起動入口、説明のみのプライバシーポリシー画面は対象外にしている。選択式の部品に IME の条件を求めないなど、責務の違いも理由付きで除外する。実装ファイルの除外は網羅率データを削除する意味ではなく、`coverage.csv` の `対象外` を `はい` にする。

## 出力の読み方と拡張

「テストなし（不足の候補）」の確認ケースはテスト追加の候補であり、必ず追加すべきという判定ではない。名前・タグ・対応定義と実際の assertion を確認し、必要がなければ対象外の理由を書く。テストにタグがあるだけでは成功を意味しない。OS ごとの IME、共有コピーの拒否など、現在の条件より細かい要件は条件と対象を追加して表現する。網羅率が高くても assertion が十分とは限らない。

`stages` は段階ごとの一覧・結果ファイル、project、採取・実行コマンドを定義する。契約テストなどの段階は、Vitest 形式の一覧・結果ならこの配列への追加で集計できる。別の runner では Python の入出力アダプターを追加する。アプリのテストはこの道具のためには追加せず、不足候補を別途レビューして補う。

## 冒頭の構成と分類規則

`frontend.md` の冒頭は「集計」の結論の文と表で、その次の「テストの構成」は結論の文、ファイル別の段階・直接のローカル import・一覧の件数・観点別件数の表（折りたたみ）と、全体の受け持ちを示す。型や補助コードの import も対象に含む。複数条件を持つ同じ観点は1テストにつき1件数える。全体の表は `responsibilities` で編集する。ファイルごとの確かめていること・いないことは `test_descriptions` で編集し、`docs/frontend_test_note.md` の機能ごとの根拠のファイルの表に出す（`frontend.md` には載せない）。新しいファイルに説明がなければ結論の文に「説明のないファイル」として並べ、一覧が取れなければ件数は「未取得」と表示する。

既存の質問状態・世帯変換・進捗・共有URLの4ファイルはテスト本体にタグを加えず、`classification_rules` のファイル名と名前の正規表現で分類する。明示タグと規則の和集合を使う。質問状態と進捗の未知の名前は未分類に残す。世帯変換は「未回答」の有無、共有URLは「旧形式」の有無という既存の規約で分ける。分類と対象の `bindings` は別であり、タグがあっても対象の期待条件に結び付かなければ未分類になる。

タグを付けずに足したテスト（端末別の入力、キー操作の入力、質問画面と状態機械、制度の候補、Appのルート、共有リンク、結果の詳細と窓口、該当する制度）も、テスト本体を変えずに `classification_rules` で分類する。`it.each` の名前の `$name`・`%s` や、テンプレート文字列・`it.fails` で宣言の名前を構文で取れないテストがあるため、規則は展開後の名前と宣言の名前のどちらにも一致する固定の語句で書く。部品の名前を英語で書いたテストは、`bindings` の名前の語（`age`・`money`・`child age`・`count` など）でテンプレートを絞る。`name` を書かない story は export 名から作られた名前で一覧に出るため、単語の間の空白の有無のどちらにも一致させる。新しい名前の型は未分類に残るので、規則を足すか宣言にタグを書く。

`e2e/visual/screens.spec.ts` は見た目の比較のため通常の E2E の設定から外し（`testIgnore`）、`playwright.visual.config.ts` でだけ実行する。この道具は通常の設定の一覧だけを読むため、「テストの構成」の表では件数 0 とし、受け持ちは `test_descriptions` に書く。

低網羅率の候補は両段階に存在するファイルの各指標について、unit/UIの大きい方が基準未満かを判定する。片方で十分な実装を他方の0%だけで候補にしないためである。両段階の数値の結合や和集合の網羅率ではない。分母0は候補に使わず、計測対象の `n/a`・欠測はその指標の判定を保留する。`exclusions` で全条件を対象外にしたファイルは不足候補から外し、`coverage.csv` には `対象外` を `はい` にして残す。

## 機能ごとの説明の文書

[docs/frontend_test_note.md](../../docs/frontend_test_note.md) の「機能ごとに保証していること」の区間は、`viewpoints.yaml` の `features`・`qualities`・`test_descriptions`・`responsibilities` から生成する。

- `features` はアプリの機能（利用者が画面で使うもの）であり、テストのファイルのまとまりではない。各機能は `name`、機能単位の結論の `guarantees`（保証していること）と `risks`（テストが通っても本番で起こりうること）、根拠の `files` を持つ。
- `qualities` は互換・a11y・見た目・通しの操作の品質の観点であり、機能ではない。`files` の要素が文字列なら、そのファイルは機能の振る舞いを確かめる。`{file, qualities}` なら、その機能について並べた観点を確かめる。振る舞いも確かめるときは `behavior` を並べる。
- ファイルごとの説明は `test_descriptions` から引き、`features` には書かない。`test_descriptions` のファイルはどれかの機能に置く（2つ以上でもよい）。

機能に置いていない説明、説明のないファイル、存在しないファイル、結論のない機能、知らない観点は生成エラーになる。

```bash
python tools/test_report/report.py --write-test-note
python -m pytest tools/test_report
```

書き換えるのは `<!-- test-report:features:begin -->` と `<!-- test-report:features:end -->` の間だけで、ほかの節は人が書く。目印のコメントはプレビューで見えないため、区間の最初と最後には引用の文も出す。最初の文は、区間がどこまでか（`features` の最後の機能の名前から作るので、機能が増えてもずれない）、正本が `viewpoints.yaml` であること、作り直すコマンド、手で直さないことを示し、最後の文は区間がここまでで、ここから下は人が書くことを示す。機械が区間を見つけるのは目印のコメントだけである。テストの一覧も実行も使わない。`test_descriptions`・`responsibilities`・`features`・`qualities` を直したら生成し直す。pytest は生成し直した結果と commit 済みの文書を比べ、差があれば失敗する。

## 状態機械の分岐と通過の記録

`machine_graph.cjs` は既存のTypeScriptコンパイラーで純粋なモデルだけを読み、`xstate/graph` の `toDirectedGraph` から各状態の宣言を取り出す。`always` も加え、同じeventのガード選択肢、回答保存の自己遷移を分けて数える。構造上の全遷移が分母となり、到達不能な宣言も自動では対象外にしない。

代表回答は質問定義の型と選択肢から作る。Booleanは両値と未回答、人数は0・1・2と未回答（なし・単数・複数）、年齢は0・17・18・64・65と未回答（未成年・成人・高齢の境界の目安）、金額は0・1万円と未回答、単一選択は全選択肢と未回答、複数選択は空・各単独・全選択、住所は東京都新宿区を使う。入力の妥当性や制度の境界値の全検証ではなく、遷移を調べる有限の代表値である。新しい型は黙って省かずエラーにする。

`getAdjacencyMap` は3モード×4続柄×6回答プロファイルについて各質問の1段の隣接を探索する。プロファイルは代表値を順に循環させ、世帯員には2人分を用意し、`back` 用にモードへの合成履歴を置く。完全なcontextと履歴を状態の識別に含め、ガードに影響する値をまとめない。代表回答の保存・next・reset・履歴があるときのbackを試す。探索数は代表値の動作確認であり、合成contextの到達可能性、全回答の組合せ、すべての人数や履歴を網羅したとは扱わない。

通過は名前から推測せず、既存の質問状態テストを実行した際の `@xstate.microstep` で選ばれた遷移を記録する。ガードの同じ到着先も分岐番号で区別する。補助の設定 `trace.config.mjs` は通常の設定に記録用のセットアップ（`dashboard/testReportTrace.mjs`）を足すだけなので、アプリのテスト・通常の設定・件数は変えない。採取は「実行結果と網羅率の追加」の手順の unit の行で行う（`viewpoints.yaml` の unit の `run` と、記録がないときに Markdown に出すコマンドも同じ）。

記録は `tmp/test-report/transitions.trace.json` に保存する（`--input-dir` を変える場合は同じディレクトリへコピーする）。モデル・質問定義・質問状態テストのSHA-256が一致するときだけ採用し、不一致や未採取は「判定不能」とする。記録にない遷移は `transitions.csv` の `通過` を「未通過」にし、Markdown にはそれぞれの数を出す。これは経路準備の `skipUntil` も含む実行の通過であり、各遷移への専用assertionや成功の保証ではない。実行結果の成否と採取した版も併せて確認する。
