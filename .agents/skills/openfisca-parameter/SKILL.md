---
name: openfisca-parameter
description: OpenFisca の Parameter を作成・設計するための仕様ガイド。parameter の YAML 定義、ParameterNode（ノード）、Scale（累進税率表）の実装、formula からの参照方法など、実装に必要な知識を提供する。
---

あなたは OpenFisca の Parameter 作成を支援するエキスパートです。
ユーザーのリクエスト: $ARGUMENTS

以下の仕様・文法リファレンスを参照して、Parameter の作成・レビュー・説明を行ってください。

---

## Parameter とは

Parameter は**時間とともに変化する法令上の数値**であり、特定のエンティティ（Person/Household など）に紐付かない。

- 最低賃金の金額
- 所得税率
- 児童手当の支給額
- 控除の上限年齢 など

Parameter は `parameters/` ディレクトリ以下に **YAML ファイル**として定義し、Variable の `formula` 内で `parameters(period).path.to.param` の形で参照する。

---

## ディレクトリ構造とツリー

```
parameters/
  税金/
    index.yaml           # ノードのメタデータ（任意）
    所得税率.yaml        # Parameter: 税金.所得税率
    累進税率表.yaml      # Scale:     税金.累進税率表
  福祉/
    育児/
      児童手当/
        金額.yaml        # Parameter: 福祉.育児.児童手当.金額
```

- **ディレクトリ** → `ParameterNode`（ノード）
- **YAML ファイル** → `Parameter`（単一値）または `ParameterScale`（累進表）
- `index.yaml` という名前はノードのメタデータ専用（通常のパラメータ名として使えない）

---

## Parameter（単一値）の YAML 構造

### シンプル形式（値のみ）

```yaml
values:
  1993-01-01:
    value: 1000
  2010-01-01:
    value: 1500
```

### 完全形式（説明・メタデータあり）

```yaml
description: 普通児童扶養手当の支給額
metadata:
  reference: https://example.go.jp/law/reference
  unit: currency-JPY
values:
  2010-04-01:
    value: 44140
    metadata:
      reference: https://example.go.jp/law/2010
  2024-11-01:
    value: 46690
    metadata:
      reference: https://example.go.jp/law/2024
```

### YAML キー一覧

| キー | 必須 | 説明 |
|---|---|---|
| `description` | 任意 | 人が読める説明文 |
| `documentation` | 任意 | 詳細な複数行説明 |
| `metadata` | 任意 | ルートレベルのメタデータ |
| `metadata.reference` | 任意 | 法的根拠URL |
| `metadata.unit` | 任意 | 単位（後述） |
| `values` | 必須 | 日付→値のマッピング |
| `values.<date>.value` | 必須 | その日付以降の値 |
| `values.<date>.metadata` | 任意 | その値固有のメタデータ |

### `unit` の値

| unit | 意味 |
|---|---|
| `currency-JPY` | 日本円（金額） |
| `currency-EUR` | ユーロ |
| `currency` | 国の通貨単位（汎用） |
| `/1` | 割合（1.0 = 100%） |
| `year` | 年数 |

### 日付の解釈

- 指定した日付からその値が有効になる（**左辺を含む・右辺を除く** の区間）
- 指定日より前は `null`（未定義）
- 降順・昇順どちらで書いても動作するが、**昇順（古い順）推奨**

```yaml
values:
  1876-01-01:
    value: 20.0    # 1876年以降は20歳
  2022-04-01:
    value: 18.0    # 2022年4月1日以降は18歳
```

### 値を廃止する（null）

```yaml
values:
  2020-01-01:
    value: 500
  2025-01-01:
    value: null    # 2025年以降は廃止（未定義）
```

---

## 配列値（インデックス参照パターン）

扶養人数ごとに異なる所得制限額など、整数インデックスで引く用途に使える汎用パターン。
以下は `openfisca_japan` を例にした記述だが、パラメータ名・パス・変数名は各プロジェクトに合わせて変える。

```yaml
description: 児童育成手当の所得制限限度額（扶養人数0人からの配列）
metadata:
  threshold_unit: person
  rate_unit: 1
  reference: https://example.go.jp/
values:
  2000-05-01:
    value:
      - 3604000
      - 3984000
      - 4364000
      - 4744000
      - 5124000
      - 5504000
```

formula での使い方（openfisca_japan の例）：

```python
def formula(person, period, parameters):
    扶養人数 = person('扶養人数', period)
    制限額一覧 = np.array(parameters(period).福祉.育児.所得制限額)
    # 扶養人数をインデックスとして制限額を取得
    制限額 = 制限額一覧[扶養人数]
    return 制限額
```

---

## ParameterScale（累進税率表）

`brackets:` キーを持つ YAML ファイルが自動的に Scale として解釈される。

### MarginalRateTaxScale（限界税率 — デフォルト）

所得を区間に分割し、各区間に対応する税率を掛け合わせて合計する（日本の所得税など）。

```yaml
description: 給与課税の累進税率表
brackets:
  - threshold:
      1950-01-01:
        value: 0
    rate:
      1950-01-01:
        value: 0.0
      2010-01-01:
        value: 0.02
  - threshold:
      1950-01-01:
        value: 2000
    rate:
      1950-01-01:
        value: 0.2
metadata:
  type: marginal_rate    # 省略しても rate があれば自動判定
  threshold_unit: currency-JPY
  rate_unit: /1
```

formula での使い方：

```python
def formula(person, period, parameters):
    salary = person('salary', period)
    scale = parameters(period).税金.給与累進税率表
    return scale.calc(salary)          # デフォルト: 左辺を含む区間
    # return scale.calc(salary, right=True)  # 右辺を含む区間
```

### MarginalAmountTaxScale（累積金額）

`amount` フィールドを使い、`metadata.type: marginal_amount` を指定する。
各区間の金額を下から合算して返す。

```yaml
description: 累積金額スケール例
metadata:
  type: marginal_amount
brackets:
  - threshold:
      2020-01-01:
        value: 0
    amount:
      2020-01-01:
        value: 0
  - threshold:
      2020-01-01:
        value: 100000
    amount:
      2020-01-01:
        value: 5000
```

### SingleAmountTaxScale（単一金額）

`amount` フィールドを使い、`metadata.type: single_amount` を指定する。
入力値が属する区間の金額を**そのまま**返す（累積しない）。

```yaml
description: 単一金額スケール例
metadata:
  type: single_amount
brackets:
  - threshold:
      2020-01-01:
        value: 0
    amount:
      2020-01-01:
        value: 10000
  - threshold:
      2020-01-01:
        value: 500000
    amount:
      2020-01-01:
        value: 15000
  - threshold:
      2020-01-01:
        value: 1000000
    amount:
      2020-01-01:
        value: 20000
```

### LinearAverageRateTaxScale（平均税率）

`average_rate` フィールドを使う。`metadata.type` の指定は不要（`average_rate` が存在すれば自動判定）。

```yaml
description: 平均税率スケール例
brackets:
  - threshold:
      2020-01-01:
        value: 0
    average_rate:
      2020-01-01:
        value: 0.0
  - threshold:
      2020-01-01:
        value: 1000000
    average_rate:
      2020-01-01:
        value: 0.1
```

### Scale のタイプ判定ロジック

| 条件 | 使われる Scale クラス |
|---|---|
| `metadata.type == "single_amount"` | `SingleAmountTaxScale` |
| `amount` フィールドが存在する（`type` 未指定） | `MarginalAmountTaxScale` |
| `average_rate` フィールドが存在する | `LinearAverageRateTaxScale` |
| それ以外（`rate` フィールド） | `MarginalRateTaxScale` |

---

## formula からの参照方法

### 単純な値の参照

```python
def formula(person, period, parameters):
    成人年齢 = parameters(period).全般.成人年齢
    is_adult = person('年齢', period) >= 成人年齢
    return is_adult
```

### ParameterNode ごと参照して複数パラメータを使う

```python
def formula(対象世帯, 対象期間, parameters):
    児童手当 = parameters(対象期間).福祉.育児.児童手当  # ノードを取得

    # ノード内の各パラメータへアクセス
    三歳未満額 = 児童手当.金額.三歳未満かつ第二子以前
    三歳以上額 = 児童手当.金額.三歳以上かつ高校生以下かつ第二子以前
```

### ファンシーインデックス（変数でパラメータを切り替える）

Variable の値（Enum やゾーン番号など）に応じてパラメータを動的に選択できる。
**条件：対象ノードの直接の子がすべて同じ構造（homogeneous）であること**

```python
def formula(household, period, parameters):
    zone = household('zone', period)   # 例: "zone_1", "zone_2", "zone_3"
    nb_children = household('nb_children', period)

    # zone の値に対応するノードを取得（ベクトル対応）
    P = parameters(period).housing_benefit.amount_by_zone[zone]

    return P.per_child * nb_children
```

**注意:** 対象ノードに異なる型の子（ノードと単一パラメータが混在）があるとエラーになる。
その場合は中間ノードを設けて同構造にする。

---

## パターン別テンプレート

### パターン1: 金額パラメータ（法改正あり）

```yaml
description: 基礎控除額
metadata:
  reference: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
  unit: currency-JPY
values:
  2000-01-01:
    value: 380000
  2020-01-01:
    value: 480000
    metadata:
      reference: https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
```

### パターン2: 割合パラメータ（保険料率）

```yaml
description: 介護保険料率
metadata:
  reference: https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/
  unit: /1
values:
  2015-01-01:
    value: 0.016
```

### パターン3: 年齢パラメータ

```yaml
description: 成人年齢
metadata:
  reference: https://www.moj.go.jp/MINJI/minji07_00238.html
  unit: year
values:
  1876-01-01:
    value: 20.0
  2022-04-01:
    value: 18.0
```

### パターン4: 配列パラメータ（扶養人数スライス）

```yaml
description: 所得制限限度額（扶養人数0人から始まる配列）
metadata:
  threshold_unit: person
  unit: currency-JPY
  reference: https://example.go.jp/
values:
  2000-05-01:
    value:
      - 3604000
      - 3984000
      - 4364000
      - 4744000
      - 5124000
      - 5504000
```

### パターン5: 累進税率表（Scale）

```yaml
description: 所得税累進税率
brackets:
  - threshold:
      2020-01-01:
        value: 0
    rate:
      2020-01-01:
        value: 0.05
  - threshold:
      2020-01-01:
        value: 1950000
    rate:
      2020-01-01:
        value: 0.10
  - threshold:
      2020-01-01:
        value: 3300000
    rate:
      2020-01-01:
        value: 0.20
metadata:
  type: marginal_rate
  threshold_unit: currency-JPY
  rate_unit: /1
```

### パターン6: ノードの index.yaml

```yaml
description: 社会保険料に関するパラメーター
documentation: |
  各種社会保険料率の定義。
```

---

## よくある落とし穴

1. **`index.yaml` という名前のパラメータは作れない** → ノードのメタデータ専用の予約名
2. **`description`, `reference`, `values`, `brackets` はパラメータ名に使えない** → 予約キー
3. **日付は `YYYY-MM-DD` 形式** → `2022-4-1` は非対応（ゼロ埋め必須）
4. **Scale に `values:` は書かない** → `brackets:` を使う（両方書くとエラー）
5. **Scale のタイプを明示したい場合は `metadata.type`** → `marginal_rate`（デフォルト）/`marginal_amount`/`single_amount`
6. **ファンシーインデックス使用時は子ノードを同構造にする** → 同じノードに Parameter と ParameterNode が混在するとエラー
7. **formula では必ず `parameters(period)` と呼ぶ** → `parameters.param` だけでは期間が固定されずエラー
8. **配列値のインデックスは 0 始まり** → 扶養人数が 0 人 → インデックス 0
9. **null 値は廃止を意味する** → null 以降の期間は `ParameterNotFound` になる

---

ユーザーの要求に応じて、上記の仕様・テンプレートをもとに Parameter の YAML 作成・説明・レビューを行ってください。
慣例として `metadata.reference` には法的根拠の URL を記載し、改正のたびに日付エントリを追記していくスタイルが推奨されます（上記の openfisca_japan の例を参照）。
