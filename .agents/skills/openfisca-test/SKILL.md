---
name: openfisca-test
description: OpenFisca の YAML テストファイルを作成・設計するための仕様ガイド。テストケースの構造、エンティティ設定、誤差許容、複数世帯、Enum 入力など、実装に必要な知識を提供する。
---

あなたは OpenFisca の YAML テスト作成を支援するエキスパートです。
ユーザーのリクエスト: $ARGUMENTS

以下の仕様・文法リファレンスを参照して、YAML テストファイルの作成・レビュー・説明を行ってください。

---

## テストの基本構造

```yaml
- name: "テスト名"
  period: 2024-01
  input:
    salary: 2000
  output:
    income_tax: 300
```

各テストケースはリスト要素（`-`）として記述する。1ファイルに複数のテストケースを並べることができる。

---

## 必須フィールド

| フィールド | 説明 |
|---|---|
| `name` | テストの名前（一意であることが望ましい） |
| `period` | 計算対象の period（例: `2024-01`, `2024-01-01`, `2024`） |
| `input` | 入力変数の値 |
| `output` | 期待する出力変数の値（検証対象） |

---

## period の書き方

```yaml
period: 2024-01      # 月単位（MONTH変数）
period: 2024-01-01   # 日単位（DAY変数）
period: 2024         # 年単位（YEAR変数）
```

---

## エンティティを指定しない入力（シンプル形式）

単一エンティティ・単一世帯の場合はフラットに書ける。

```yaml
- name: "給与課税 - 収入あり"
  period: 2024-01
  input:
    salary: 2000
  output:
    flat_tax_on_salary: 500
```

---

## エンティティを指定する入力（エンティティ構造あり）

エンティティ（Person / Household など）を複数扱う場合は、各エンティティをネストして記述する。
**エンティティ名・ロール名はプロジェクトごとに異なる**ため、実際の `entities.py` の定義を確認すること。

以下は `openfisca_japan` を例にした記述。同プロジェクトでは `世帯員`（Person）と `世帯`（Household）を使う。

### 単一世帯の例（openfisca_japan）

```yaml
- name: テスト名
  period: 2023-06-01
  input:
    世帯:
      親一覧:
        - 親1
      子一覧:
        - 子1
    世帯員:
      親1:
        年齢: 40
        収入: 3000000
      子1:
        年齢: 10
  output:
    世帯員:
      親1:
        住民税:
          '2023-06-01': 50000
```

### openfisca_japan の世帯ロール一覧

| ロール | 意味 |
|---|---|
| `親一覧` | 親（成人・世帯主など） |
| `子一覧` | 子供 |
| `祖父母一覧` | 祖父母 |

### output のエンティティ指定（openfisca_japan の場合）

```yaml
output:
  世帯員:          # Person entity の変数を検証
    親1:
      変数名: 値

  世帯:            # Household entity の変数を検証（単一世帯）
    変数名: 値

  世帯一覧:        # Household entity の変数を検証（複数世帯）
    世帯1:
      変数名: 値
```

---

## 複数グループテスト

複数の Household（グループ）を同時にテストする場合は、個別のグループをリストアップして記述する。グループ間の値が混同されないことを確認する際に有効。

グループを束ねるキー名はプロジェクトの entities 定義によって異なる。以下は `openfisca_japan` の例（`世帯` の複数形として `世帯一覧` を使用）。

```yaml
- name: 厚生年金保険料（複数世帯）
  absolute_error_margin: 1
  period: 2023-06-01
  input:
    世帯一覧:           # openfisca_japan の例: 複数世帯を列挙するキー
      世帯1:
        親一覧:
          - 親1
      世帯2:
        親一覧:
          - 親2
    世帯員:
      親1:
        年齢: 19
        収入: 2400000
        標準報酬月額_厚生年金保険料: 200000
        個人事業主である: false
        社会保険料納付条件: true
      親2:
        年齢: 60
        収入: 2400000
        標準報酬月額_厚生年金保険料: 200000
        個人事業主である: false
        社会保険料納付条件: true
  output:
    世帯員:
      親1:
        厚生年金保険料:
          '2023-06-01': 219600
      親2:
        厚生年金保険料:
          '2023-06-01': 219600
```

> **重要（openfisca_japan の場合）:** `世帯` と `世帯一覧` は**同時に使えない**。複数世帯のテストでは必ず `世帯一覧` を使う。他のプロジェクトでは該当するキー名を entities 定義で確認すること。

---

## 期間付き入力・出力

変数の値を特定の期間に紐付けて指定できる。YEAR変数の特定月を指定したい場合や、複数期間の入力が必要な場合に使う。

```yaml
input:
  世帯員:
    親1:
      所得:
        '2023-06-01': 1000000   # 特定期間の値を指定

output:
  世帯員:
    親1:
      住民税:
        '2023-06-01': 50000     # 特定期間の期待値を検証
```

---

## Enum 値の指定

Enum 型変数はメンバー名（ラベルではなく Python の属性名）をそのまま文字列で指定する。

```yaml
input:
  世帯員:
    子1:
      身体障害者手帳等級: 三級    # Enum のメンバー名を直接記述
```

```yaml
input:
  世帯員:
    親1:
      housing_occupancy_status:
        2024-01: free_lodger    # 英語 Enum も同様
```

---

## 誤差許容（error margin）

### `absolute_error_margin` — 絶対誤差

浮動小数点計算の誤差を許容する。数値（全変数共通）またはマップ（変数ごとに個別設定）で指定。

```yaml
# 全変数に同じ許容誤差を設定
- name: テスト
  absolute_error_margin: 1
  period: 2023-06-01
  input:
    ...
  output:
    ...

# 変数ごとに個別設定
- name: テスト
  absolute_error_margin:
    default: 100        # 指定なし変数のデフォルト
    income_tax: 50      # income_tax のみ ±50 を許容
  period: 2023-06-01
  input:
    ...
  output:
    ...
```

### `relative_error_margin` — 相対誤差

期待値に対するパーセンテージ誤差を許容する（例: `0.05` = ±5%）。

```yaml
- name: テスト
  relative_error_margin: 0.05
  period: 2023-06-01
  input:
    salary: 2000
  output:
    income_tax: 300  # 285〜315 の範囲であれば合格

# 変数ごとに個別設定
- name: テスト
  relative_error_margin:
    default: 0.001
    income_tax: 0.05
  period: 2023-06-01
  ...
```

> `absolute_error_margin` と `relative_error_margin` は**同時には使えない**。どちらか一方のみ指定する。

---

## 計算式での検証値

output の期待値には算術式を書ける（可読性向上のため）。

```yaml
output:
  income_tax: 0.15 * 2000     # 300 と同じ
  flat_tax_on_salary: 500 * 2 # 1000 と同じ
  厚生年金保険料:
    '2023-06-01': 200000 * 0.183 / 2 * 12  # コメントに計算根拠を示す
```

---

## keywords（名前フィルタ）

テスト実行時に `-n` フィルタで絞り込むためのキーワードを付与できる。

```yaml
- name: "給与課税テスト"
  keywords:
    - 給与
    - 基本ケース
  period: 2024-01
  input:
    salary: 2000
  output:
    income_tax: 300
```

---

## YAMLアンカー（入力の再利用）

同じ入力を複数テストで使いたい場合は YAML アンカーで共有できる。

```yaml
- name: "基本ケース"
  period: 2024-01
  input:
    世帯:
      親一覧: &default_parents
        - 親1
    世帯員: &default_members
      親1:
        収入: 3000000
        年齢: 40
  output:
    世帯員:
      親1:
        住民税:
          '2024-01': 50000

- name: "高収入ケース"
  period: 2024-01
  input:
    世帯:
      親一覧:
        <<: *default_parents
    世帯員:
      <<: *default_members
      親1:
        収入: 10000000  # 上書き
  output:
    世帯員:
      親1:
        住民税:
          '2024-01': 800000
```

---

## テスト実行コマンド

`<country_package>` には自プロジェクトのパッケージ名（例: `openfisca_japan`）を指定する。

```bash
# 全テストを実行
openfisca test --country-package <country_package> <country_package>/tests

# make コマンドを用意しているプロジェクトでは
make test

# 特定ファイルのみ実行
openfisca test --country-package <country_package> <country_package>/tests/path/to/test.yaml

# 特定ディレクトリのみ実行
openfisca test --country-package <country_package> <country_package>/tests/some_category
```

openfisca_japan での例：

```bash
openfisca test --country-package openfisca_japan openfisca_japan/tests
openfisca test --country-package openfisca_japan openfisca_japan/tests/社会保険料/厚生年金保険料.yaml
```

---

## よくある落とし穴

1. **単一グループと複数グループのキーを混在させない** → 複数グループのテストでは複数形のキー（例: openfisca_japan なら `世帯一覧`）のみ使う
2. **期間付き出力の引用符** → `'2023-06-01': 値` のように**シングルクォートが必要**
3. **`absolute_error_margin` と `relative_error_margin` の併用は不可** → どちらか一方のみ
4. **Enum 値はメンバー名（Python 属性名）で指定** → `三級` であって `"第三級"` ではない
5. **出力の期間を period と合わせる** → `period: 2023-06-01` のテストでは output も `'2023-06-01':` で指定する
6. **期間付き入力はシングルクォート** → `'2023-06-01': 1000000`（数値でも引用符が必要）

---

## パターン別テンプレート

以下のテンプレートはすべて `openfisca_japan` のエンティティ構造（`世帯員` / `世帯` / `世帯一覧`）を例として使用している。
他のプロジェクトでは `entities.py` に合わせてエンティティ名・ロール名を読み替えること。

### パターン1: Person 変数の基本テスト

```yaml
- name: 厚生年金保険料（会社員）
  absolute_error_margin: 1
  period: 2023-06-01
  input:
    世帯:
      親一覧:
        - 親1
    世帯員:
      親1:
        標準報酬月額_厚生年金保険料: 200000
        個人事業主である: false
        社会保険料納付条件: true
  output:
    世帯員:
      親1:
        厚生年金保険料:
          '2023-06-01': 219600 # 200,000 * 0.183 / 2 * 12
```

### パターン2: Household 変数のテスト

```yaml
- name: 住民税扶養控除（一般扶養親族）
  period: 2023-06-01
  input:
    世帯:
      親一覧:
        - 自分
      子一覧:
        - 子1
    世帯員:
      自分:
        誕生年月日: '1983-05-01'
        所得:
          '2023-06-01': 1000000
      子1:
        誕生年月日: '2007-12-31'
        所得:
          '2023-06-01': 0
  output:
    世帯:
      住民税扶養控除:
        '2023-06-01': 330000
```

### パターン3: Enum 入力のテスト

```yaml
- name: 特別児童扶養手当（身体障害者手帳三級）
  period: 2023-06-01
  input:
    世帯:
      親一覧:
        - 親1
      子一覧:
        - 子1
    世帯員:
      親1:
        誕生年月日: '1993-05-01'
      子1:
        誕生年月日: '2010-01-01'
        身体障害者手帳等級: 三級
  output:
    世帯:
      特別児童扶養手当:
        '2023-06-01': 53700
```

### パターン4: 複数世帯テスト

```yaml
- name: 住民税（複数世帯）
  absolute_error_margin: 1
  period: 2024-06-01
  input:
    世帯一覧:
      世帯1:
        親一覧:
          - 親1
      世帯2:
        親一覧:
          - 親2
    世帯員:
      親1:
        住民税所得割: 50000
        住民税均等割: 5000
      親2:
        住民税所得割: 150000
        住民税均等割: 5000
  output:
    世帯員:
      親1:
        住民税:
          '2024-06-01': 55000
      親2:
        住民税:
          '2024-06-01': 155000
```

### パターン5: 世帯変数を複数世帯で検証

```yaml
- name: 特別児童扶養手当（複数世帯）
  period: '2023-06-01'
  input:
    世帯一覧:
      世帯1:
        親一覧:
          - 親1
        子一覧:
          - 子1_1
      世帯2:
        親一覧:
          - 親2
        子一覧:
          - 子2_1
    世帯員:
      親1:
        誕生年月日: '1993-05-01'
      子1_1:
        誕生年月日: '2010-01-01'
        身体障害者手帳等級: 三級
      親2:
        誕生年月日: '1993-05-01'
      子2_1:
        誕生年月日: '2010-01-01'
        身体障害者手帳等級: 三級
  output:
    世帯一覧:
      世帯1:
        特別児童扶養手当:
          '2023-06-01': 53700
      世帯2:
        特別児童扶養手当:
          '2023-06-01': 53700
```

---

ユーザーの要求に応じて、上記の仕様・テンプレートをもとに YAML テストファイルの作成・説明・レビューを行ってください。
