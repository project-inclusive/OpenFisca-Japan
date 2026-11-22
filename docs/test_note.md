# テストの全体の状況と残っていること

リポジトリのテストを、バックエンド（制度の計算）・フロントエンド・道具・契約テストの 4 つの層に分け、層ごとに何があるか、どこまでか、どこで流れるか、残っていることをまとめる。
「残っていること」は、今のテストと設定から確かめられる空きであり、予定ではない。層ごとの詳しい中身と流し方は、各節の「詳しい文書」にある。

## 数の時点と数え方

数は **2026 年 11 月 22 日の時点**で、リポジトリのルートで各節のコマンドを流して手で書いた。自動では更新されないため、テスト・変数・設定を変えたら数え直す。

## バックエンド（制度の計算）

- **何があるか**: `openfisca_japan/tests/` の YAML（`*.yaml`・`*.yml`）の OpenFisca のテスト。1 つのケースが `period`・`input`・`output` を持ち、`input` の世帯で計算した変数の値が `output` の値と一致するかを確かめる。`generated/` の 3 ファイルは、`tools/make_tests` が CSV から作ったものである。
- **流し方と CI**: `make test`（`openfisca test --country-package openfisca_japan openfisca_japan/tests`）で `generated/` を含めて全部流れる。CI は `.github/workflows/test_backend.yml` で、push と pull request のたびに `build` ジョブの `make build` のあと、`test` ジョブで `make check-style`（flake8・ruff）・`make test`・`make check-docs`（生成した制度ドキュメントとソースの差）の順に流れる。

どこまでか:

| 項目 | 数 |
| --- | ---: |
| テストの YAML のファイル | 95（うち `generated/` が 3） |
| テストのケース | 1,829（うち `generated/` が 319） |
| 変数の定義（`openfisca_japan/variables/` の `class …(Variable)`） | 301 |
| `output` で値を確かめている変数 | 151 |
| `input` に使うだけで、`output` で確かめていない変数 | 80 |
| どのテストにも名前が出てこない変数 | 70 |

下のコマンドは、テストの YAML を PyYAML（開発の依存に入っている）で読んで数える。ファイルは `generated/` を含む `*.yaml`・`*.yml`、ケースは各ファイルの一覧の要素（一覧でないファイルは 1 ケース）である。変数の定義は `openfisca_japan/variables/` の `class …(Variable)` の名前で、各ケースの `input`・`output` の値にあるキー（世帯・世帯員の下などの入れ子を含む）のうち、定義の名前と完全に一致するものを数える。世帯・世帯員の名前や期間のキーは一致しないため数えない。一つの変数が、あるケースでは `input`、別のケースでは `output` にあれば、`output` で確かめている変数に数える。`output` で確かめていることは値を比べたケースがあることだけを示し、制度の条件や境界をどこまで確かめたかは示さない。

```bash
python - <<'EOF'
import pathlib, re, yaml

root = pathlib.Path("openfisca_japan")
variables = set()
for path in (root / "variables").rglob("*.py"):
    text = path.read_text(encoding="utf-8")
    variables |= set(re.findall(r"^class (\w+)\(Variable\)", text, re.M))

def keys(value):
    if isinstance(value, dict):
        for key, child in value.items():
            yield str(key)
            yield from keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from keys(child)

files = sorted(p for p in (root / "tests").rglob("*") if p.suffix in (".yaml", ".yml"))
counts = {"files": 0, "generated files": 0, "cases": 0, "generated cases": 0}
used = {"input": set(), "output": set()}
for path in files:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    data = data if isinstance(data, list) else [data]
    generated = "generated" in path.parts
    counts["files"] += 1
    counts["cases"] += len(data)
    counts["generated files"] += generated
    counts["generated cases"] += len(data) if generated else 0
    for case in data:
        for part in used:
            used[part] |= set(keys(case.get(part))) & variables

for name, count in counts.items():
    print(name, count)
print("variables", len(variables))
print("output", len(used["output"]))
print("input only", len(used["input"] - used["output"]))
print("not in tests", len(variables - used["input"] - used["output"]))
EOF
```

残っていること:

- **何を保証しているかの記載がない。** 開発ドキュメントにあるのは流し方だけで、フロントエンドの [フロントエンドのテストで保証していること](./frontend_test_note.md) にあたる、制度ごとに確かめていること・確かめていないことの文書がない。
- **`output` で値を確かめていない変数が 150 ある。** 301 のうち、入力に使うだけが 80、どのテストにも出てこないのが 70 である。変数ごとの一覧を出す道具はなく、上のコマンドで数える。
- **網羅率を測っていない。** `Makefile` と CI に網羅率の測定はない。

詳しい文書: 流し方とテストのファイルの自動生成は [開発ドキュメントの「バックエンド」](./dev_note.md#バックエンド) にある。

## フロントエンド

- **何があるか**: `dashboard` の単体（Vitest の node・jsdom）、コンポーネント（Storybook の story と Browser Mode）、E2E（Playwright のモック応答の smoke）、見た目の比較（画像・ARIA スナップショット）。どの層も本物のバックエンドにはつながない。
- **どこまでか**: 1,248 件（単体 8 ファイル 1,087 件・コンポーネント 13 ファイル 136 件・E2E 3 ファイル 25 件（5 件 × 5 つの project））。見た目の比較は通常の E2E とは別の設定で 26 件（13 画面 × 2 幅）ある。テストのない確認ケース（不足の候補）は 123 か所である。
- **流し方と CI**: `.github/workflows/test_frontend.yml` の `test` ジョブで、push と pull request のたびに ESLint・Prettier・`npm run test`（単体）・`npm run test:ui`（story と Browser Mode）・Storybook のビルド・ビルド・`npm run test:e2e` の順に流れる。見た目の比較は同じ workflow の `visual` ジョブで、固定した Docker のイメージの中で流れる。網羅率（`--coverage`）と `make test-report` は CI で流れない。

```bash
# 集計の節に、段階ごとのファイル数・件数と、テストのない確認ケースの数が出る（テストの本体は流さない）
make test-report
# 見た目の比較の件数
cd dashboard && npx playwright test --config playwright.visual.config.ts --list
```

残っていること: テストが通っても本番で起こりうること（金額と判定の誤り、本物の API との形の食い違い、地震被災者支援のモードの通しの操作、実機の IME、a11y の違反、既知の不具合 1 件）と、テストの作り方による制約は、[保証していないこと・既知の制約](./frontend_test_note.md#保証していないこと既知の制約) にある。テストのない確認ケースは、`make test-report` の `cases.csv` で確かめる。

詳しい文書: 機能ごとに保証していることは [フロントエンドのテストで保証していること](./frontend_test_note.md)、流し方は [開発ドキュメントの「フロントエンド」](./dev_note.md#フロントエンド)、レポートの出し方は [`tools/test_report/README.md`](https://github.com/project-inclusive/OpenFisca-Japan/blob/main/tools/test_report/README.md) にある。

## 道具

- **何があるか**: `tools/make_docs/test_make_docs.py`（制度ドキュメントの生成の、数の書式とパラメータの単位の警告）と、`tools/test_report/test_report.py`（フロントエンドのテストレポートの一覧・集計・CSV と、[フロントエンドのテストで保証していること](./frontend_test_note.md) の生成した区間）の pytest。
- **どこまでか**: 62 件（`test_make_docs.py` 6 件・`test_report.py` 56 件）。`tools/make_tests`・`tools/dependency_graph`・`tools/municipalities_order` にテストはない。
- **流し方と CI**: `python -m pytest tools/make_docs tools/test_report` で流す。`Makefile` と CI に pytest はなく、CI では流れない（CI の `make check-docs` は生成物とソースの差を確かめるもので、この pytest ではない）。

```bash
python -m pytest tools/make_docs tools/test_report --collect-only -q
```

残っていること:

- **CI で流れない。** 道具を変えてテストが失敗しても、pull request では気づけない。
- **テストのない道具がある。** `tools/make_tests`（バックエンドのテストの YAML の生成）・`tools/dependency_graph`・`tools/municipalities_order`。

詳しい文書: フロントエンドのテストレポートの道具は [`tools/test_report/README.md`](https://github.com/project-inclusive/OpenFisca-Japan/blob/main/tools/test_report/README.md) にある。

## 契約テスト（フロントエンドとバックエンドの突き合わせ）

- **何があるか**: ない。フロントエンドのテストは MSW の handler と `page.route` の固定の JSON で応答し、バックエンドのテストは YAML の世帯で計算するだけで、フロントエンドが送る世帯の JSON を使わない。どちらも相手の形を確かめない。
- **どこまでか**: 0 件。`dashboard/src`・`dashboard/e2e`・`tools`・`.github` に、`/spec` やその `SituationInput`・`SituationOutput` を読むコードはない。
- **流し方と CI**: ない。固定の応答と本物の API の差は、[開発ドキュメントの「計算 API の固定データと再記録」](./dev_note.md#計算-api-の固定データと再記録) の手順で人が確かめる。

```bash
# 何も出なければ、/spec と突き合わせるコードはない
grep -rlE '/spec([^A-Za-z0-9_]|$)|SituationInput|SituationOutput' dashboard/src dashboard/e2e tools .github
```

残っていること（まだない突き合わせ）:

1. **フロントエンドが送る世帯の JSON と API。** `dashboard/src/state/convert.ts` が作る世帯の JSON（固定データは `dashboard/src/mocks/calculate/*.request.json`）を、本物の API の `/calculate` が受け付けるか。
2. **モックの応答の形と `/spec`。** `dashboard/src/mocks/calculate/*.response.json` と `dashboard/src/mocks/handlers.ts` の応答の形が、`/spec` の `SituationInput`・`SituationOutput` と合うか。
3. **フロントエンドが使う変数の名前と制度の定義。** フロントエンドが送る・読む変数の名前が、`openfisca_japan/variables/` の制度の定義にあるか。

詳しい文書: フロントエンドから見た影響は [保証していないこと・既知の制約](./frontend_test_note.md#保証していないこと既知の制約) の「API の形」にある。
