---
name: openfisca-variable
description: OpenFisca の Variable を作成・設計するための仕様ガイド。variable の作成、formula の実装、型・period の選択、エンティティ集約など、実装に必要な知識を提供する。
---

あなたは OpenFisca の Variable 作成を支援するエキスパートです。
ユーザーのリクエスト: $ARGUMENTS

以下の仕様・文法リファレンスを参照して、Variable の作成・レビュー・説明を行ってください。

---

## Variable の基本構造

```python
from openfisca_core.model_api import Variable, MONTH, YEAR, DAY, ETERNITY

class variable_name(Variable):
    value_type = float           # 必須: 変数の型
    entity = Person              # 必須: 対象エンティティ
    definition_period = MONTH    # 必須: 計算周期
    label = "変数の説明"         # 推奨: 人が読める説明
    reference = "https://..."    # 任意: 法的根拠URL（str または list[str]）
    documentation = """          # 任意: 詳細な説明（複数行可）
        変数の詳細な文脈と使い方。
    """

    def formula(entity, period, parameters):
        # 他の変数を参照して計算する
        some_var = entity('other_variable', period)
        return some_var * 0.25
```

---

## 必須属性

### `value_type` — 値の型

| 型 | 説明 | デフォルト値 | NumPy dtype |
|---|---|---|---|
| `bool` | 真偽値 | `False` | `numpy.bool_` |
| `int` | 整数 | `0` | `numpy.int32` |
| `float` | 浮動小数点 | `0` | `numpy.float32` |
| `str` | 文字列 | `""` | `object` |
| `datetime.date` | 日付 | `1970-01-01` | `datetime64[D]` |
| `Enum` | 列挙型 | 必須指定 | 専用dtype |

### `entity` — 対象エンティティ

各 country package で定義されたエンティティを指定する。典型例：

```python
entity = Person       # 個人
entity = Household    # 世帯
entity = Family       # 家族
```

### `definition_period` — 計算周期

| 定数 | 意味 | formula の period 引数 |
|---|---|---|
| `DAY` | 日次変数 | 1日 |
| `MONTH` | 月次変数（例: 給与） | 1ヶ月 |
| `YEAR` | 年次変数（例: 所得税） | 1年（1月〜12月） |
| `ETERNITY` | 永続変数（例: 生年月日） | 任意（使用不推奨） |

---

## オプション属性

```python
class my_variable(Variable):
    # ...必須属性...

    default_value = 0           # デフォルト値（value_typeに合った型で）
    end = '2025-12-31'          # 廃止日（YYYY-MM-DD形式、この日が最終有効日）
    unit = "currency-EUR"       # 単位（メタデータのみ）
    set_input = set_input_divide_by_period   # 周期が合わない入力の自動変換
```

### `set_input` — 入力の自動変換

```python
from openfisca_core.model_api import set_input_divide_by_period, set_input_dispatch_by_period

# 年間入力を12等分してMONTH変数に割り当て（例: 年収→月収換算）
set_input = set_input_divide_by_period

# 年間入力をそのままMONTH変数の各月に割り当て（例: フラグ値）
set_input = set_input_dispatch_by_period
```

---

## Input Variable（計算式なし）

formula を定義しない変数はシミュレーション入力として扱われる。

```python
class salary(Variable):
    value_type = float
    entity = Person
    label = "月給"
    definition_period = MONTH
    # formula なし → 入力変数
```

---

## Formula（計算式あり）

```python
class income_tax(Variable):
    value_type = float
    entity = Person
    definition_period = YEAR
    label = "所得税"

    def formula(person, period, parameters):
        # 他の変数を参照
        income = person('salary', period, options=[ADD])  # YEAR変数からMONTH変数を集計

        # パラメータを参照
        rate = parameters(period).taxes.income_tax.rate

        return income * rate
```

### Formula のシグネチャ

```python
# パラメータ不要の場合
def formula(entity, period):
    ...

# パラメータを使う場合
def formula(entity, period, parameters):
    ...
```

---

## 期間をまたぐ計算

```python
from openfisca_core.model_api import ADD, DIVIDE

class annual_tax(Variable):
    value_type = float
    entity = Person
    definition_period = YEAR

    def formula(person, period):
        # MONTH変数をYEARで集計する（12ヶ月合計）
        monthly_salary = person('salary', period, options=[ADD])

        # 特定の相対期間を指定
        last_year_income = person('income', period.last_year)
        last_3_months = person('salary', period.last_3_months, options=[ADD])

        return monthly_salary * 0.2

class monthly_tax(Variable):
    value_type = float
    entity = Person
    definition_period = MONTH

    def formula(person, period):
        # YEAR変数をMONTHで1/12にする
        annual_amount = person('annual_benefit', period, options=[DIVIDE])
        return annual_amount
```

### Period のユーティリティ

| 表現 | 意味 |
|---|---|
| `period.first_month` | period 開始を含む最初の月 |
| `period.last_month` | first_month の1ヶ月前 |
| `period.this_year` | period 開始を含む年 |
| `period.last_year` | this_year の前年 |
| `period.n_2` | this_year の2年前 |
| `period.last_3_months` | 直前3ヶ月 |
| `period.offset(n, 'month')` | nヶ月ずらす（負=過去） |
| `period.offset(n, 'year')` | n年ずらす（負=過去） |

---

## 日付付き Formula（法改正対応）

```python
class flat_tax_on_salary(Variable):
    value_type = float
    entity = Person
    definition_period = MONTH
    label = "給与への一律課税"

    # 2017年1月1日以降に有効な formula
    def formula_2017(person, period, parameters):
        salary = person('salary', period)
        salary_above_1000 = min_(salary - 1000, 0)
        return salary_above_1000 * parameters(period).taxes.salary.rate

    # 2005年6月1日以降に有効な formula（上のが優先）
    def formula_2005_06(person, period, parameters):
        salary = person('salary', period)
        return salary * parameters(period).taxes.salary.rate

    # 上記どれにも該当しない期間は default_value が返る
```

**Formula 命名規則:**
- `formula` → 0001-01-01 から有効（全期間）
- `formula_YYYY` → YYYY-01-01 から有効
- `formula_YYYY_MM` → YYYY-MM-01 から有効
- `formula_YYYY_MM_DD` → YYYY-MM-DD から有効

---

## Enum 型変数

```python
from openfisca_core.model_api import Enum, Variable, MONTH

class HousingOccupancyStatus(Enum):
    __order__ = "tenant owner free_lodger homeless"  # 定義順を明示・検証
    tenant = "テナント（賃借人）"
    owner = "所有者"
    free_lodger = "無償居住者"
    homeless = "住所不定"

class housing_occupancy_status(Variable):
    value_type = Enum
    possible_values = HousingOccupancyStatus
    default_value = HousingOccupancyStatus.tenant  # Enum型はdefault_value必須
    entity = Household
    definition_period = MONTH
    label = "世帯の住居形態"

class housing_tax(Variable):
    value_type = float
    entity = Household
    definition_period = MONTH

    def formula(household, period):
        status = household('housing_occupancy_status', period)
        # 同一ファイル内のEnumは直接使用可
        is_tenant_or_owner = (
            (status == HousingOccupancyStatus.tenant) +
            (status == HousingOccupancyStatus.owner)
        )
        size = household('accommodation_size', period)
        return is_tenant_or_owner * size * 10

# 別ファイルのEnumを使う場合
class another_variable(Variable):
    def formula(household, period):
        status = household('housing_occupancy_status', period)
        HousingOccupancyStatus = status.possible_values  # ← importの代わりに取得
        is_owner = (status == HousingOccupancyStatus.owner)
        return is_owner
```

### `__order__` — メンバーの定義順を明示する

`__order__` はスペース区切りで全メンバー名を列挙した文字列で、**openfisca_japan では全 Enum 定義に書くのが慣例**。

```python
class 身体障害者手帳等級パターン(Enum):
    __order__ = "無 一級 二級 三級 四級 五級 六級 七級"
    無   = "無"
    一級 = "一級"
    二級 = "二級"
    三級 = "三級"
    四級 = "四級"
    五級 = "五級"
    六級 = "六級"
    七級 = "七級"
```

**動作:**
- 各メンバーは定義順（= `__order__` の順）に **0 始まりの `.index`** が割り当てられる
- openfisca-core 内部では NumPy 配列のインデックスとしてこの値を使用する
- Python の `enum` メタクラスが `__order__` の列挙と実際の定義順が一致するか検証し、**不一致なら `TypeError`** を投げる

```python
# 各メンバーの .index 値（定義順の 0 始まり整数）
身体障害者手帳等級パターン.無.index    # => 0
身体障害者手帳等級パターン.一級.index  # => 1
身体障害者手帳等級パターン.七級.index  # => 7
```

> **由来:** `enum34`（Python 2 互換ライブラリ）では dict の順序が保証されないため `__order__` でメンバー順を明示する必要があった。Python 3 では定義順が自動保持されるが、openfisca_japan では定義順の文書化・バリデーション慣例として引き続き記述する。

---

## ベクトル演算（重要！）

OpenFisca の計算は常にベクトル（NumPy配列）。スカラー用の関数は使えない。

### 制御構造の代替

```python
from openfisca_core.model_api import where, select, min_, max_, not_

def formula(person, period):
    salary = person('salary', period)
    age = person('age', period)

    # ❌ NG: if/else は使えない
    # if salary < 1000: return 200

    # ✅ 条件 × 値
    result = (salary < 1000) * 200

    # ✅ where（三項演算子相当）
    result = where(salary < 1000, 200, 100)

    # ✅ select（複数条件）
    result = select(
        [salary <= 500, salary <= 1000, salary <= 1500],
        [200,           100,            50],
        default=0
    )

    # ✅ and → *、or → +、not → not_()
    condition = (age >= 25) * (salary < 1000) + person('is_disabled', period)

    return result
```

### 算術関数の代替

| スカラー（NG） | ベクトル代替 |
|---|---|
| `min(a, b)` | `min_(a, b)` |
| `max(a, b)` | `max_(a, b)` |
| `round(x)` | `round_(x)` |
| `not x` | `not_(x)` |
| `a and b` | `a * b` |
| `a or b` | `a + b` |
| `a + b` (文字列) | `concat(a, b)` |

### 複数世帯対応の注意点

OpenFisca では複数世帯を同時に計算するため、以下の制約に注意する。

**複合演算子（`+=`, `-=`）は使わない**

Variable の参照そのものを書き換えてしまい、計算に不整合が生じる。

```python
# ❌ NG: a で参照しているVariableの計算結果自体を書き換えてしまう
a += b

# ✅ OK: Pythonのローカル変数のみを上書きする
a = a + b
```

**`np.sum` / `np.max` ではなく `household.sum` / `household.max` を使う**

`np.sum` 等の numpy 集計関数は全世帯の値を混同してしまう。

| 使ってはいけない | 使うべきメソッド |
|---|---|
| `np.sum(household.members(...))` | `household.sum(household.members(...))` |
| `np.max(household.members(...))` | `household.max(household.members(...))` |

**Enum の OR 比較には `|` 演算子が使える**

```python
# Enum同士のOR比較（+ でも動作するが | がより意図明確）
is_first_or_second = (grade == Grade.first) | (grade == Grade.second)
```

---

## エンティティ間の集約・参照

```python
class basic_income(Variable):
    value_type = float
    entity = Household
    definition_period = MONTH

    def formula(household, period):
        # 世帯内の人数カウント
        nb_adults = household.nb_persons(Household.ADULT)
        nb_children = household.nb_persons(Household.CHILD)

        # 世帯メンバー全員の変数を取得して集計
        salaries = household.members('salary', period)
        total_salary = household.sum(salaries)
        max_salary = household.max(salaries)
        any_student = household.any(household.members('is_student', period))

        return nb_adults * 500 + nb_children * 200 - total_salary

class college_scholarship(Variable):
    value_type = float
    entity = Person
    definition_period = MONTH

    def formula(person, period):
        # 個人→世帯の値を参照（プロジェクション）
        household_income = person.household('basic_income', period)

        # ロール確認
        is_adult = person.has_role(Household.ADULT)

        return person('is_student', period) * (household_income > 0) * 100
```

### `get_rank` — 世帯員の順序付け

世帯内で「第一子」「最も所得が高い世帯員」等を求める場合は `get_rank` を使う。条件を満たす範囲で順序（0始まり）を付け、条件を満たさない場合は `-1` を返す。

```python
def formula(person, period):
    # 所得降順で順位付け（降順なので -income）
    income = person('income', period)
    income_rank = person.get_rank(person.household, -income)
    is_highest_earner = income_rank == 0

    # 子供の中で年齢が高い順（第一子判定）
    is_child = person('is_child', period)
    age = person('age', period)
    child_age_rank = person.get_rank(person.household, -age, condition=is_child)
    is_first_child = child_age_rank == 0
```

### 異なる Entity を組み合わせる際の注意

`entity=Household` の Variable と `entity=Person` の Variable を直接乗算すると型が合わない場合がある。Person レベルの結果を先に集計してから、Household 条件を乗算する。

```python
# ❌ NG: 型が合わず計算できない
result = person_condition * household_condition

# ✅ OK: 人物ごとに集計してから世帯条件を乗算
per_person = household.sum(household.members('person_variable', period))
result = per_person * household_condition
```

---

## model_api からのインポート一覧

```python
from openfisca_core.model_api import (
    # 変数の基底クラス
    Variable,
    Enum,

    # 計算周期定数
    DAY, MONTH, YEAR, ETERNITY,

    # 集計オプション
    ADD, DIVIDE,

    # set_input
    set_input_divide_by_period,
    set_input_dispatch_by_period,

    # ベクトル演算関数
    where, select,
    min_, max_, round_, not_,
    concat, switch, apply_thresholds,

    # パラメータ関連
    Parameter, ParameterNode, Scale, Bracket,

    # その他
    date, period, Reform,
)
```

---

## 命名規則

- **snake_case** を使う（例: `income_tax`, `housing_allowance`）
- **略語は広く知られているもののみ** 使用（VAT, RSA はOK、TLA系はNG）
- **スコープが必要な場合は先頭にドメインを付ける**（例: `housing_tax_nb_adults`）
- **エンティティを区別する場合はサフィックス**（例: `taxable_income_household`, `taxable_income_individual`）
- 技術的な内部変数名（`vat_sub1` など）は避ける

---

## YAML テスト

```yaml
- name: "給与課税 - 収入なし"
  period: 2024-01
  input:
    salary: 0
  output:
    flat_tax_on_salary: 0

- name: "給与課税 - 収入あり"
  period: 2024-01
  input:
    salary: 2000
  output:
    flat_tax_on_salary: 500

# Enum 入力
- name: "住宅税 - 無償居住者"
  period: 2024-01
  input:
    accommodation_size:
      2024-01: 100
    housing_occupancy_status:
      2024-01: free_lodger
  output:
    housing_tax: 0

# 複数期間の入力
- name: "期間をまたぐ給与"
  period: 2024-01
  input:
    salary:
      year:2022:3: 60000   # 2022〜2024の3年間
  output:
    income_tax:
      2022-01: 416.6667
```

---

## よくある落とし穴

1. **`if/else` を formula 内で使ってはいけない** → `where` / `select` / 条件 × 値を使う
2. **`Enum` 型は `default_value` が必須**
3. **別ファイルの Enum を Python import してはいけない** → `status.possible_values` で取得
4. **Enum には `__order__` を必ず書く** → メンバーの `.index`（0始まり整数）が定義順に割り当てられる。`__order__` の列挙順と定義順が異なると `TypeError`
5. **`min/max` ではなく `min_/max_`** を使う
6. **`formula` の命名**: 必ず `formula` で始めること（`formula_YYYY` 形式）
7. **`end` は最終有効日（inclusive）**: `end = '2025-12-31'` は2025年12月31日まで有効
8. **`set_input` は除算 or 転送の2択**: `divide_by_period`（等分）か `dispatch_by_period`（複製）
9. **複合演算子（`+=`, `-=`）は使わない**: `a = a + b` と書く（Variable の参照を書き換えてしまう）
10. **`np.sum` / `np.max` は世帯集計に使わない**: `household.sum` / `household.max` を使う（複数世帯入力時に全世帯を混同する）

---

## パターン別テンプレート

### パターン1: シンプルな入力変数

```python
class age(Variable):
    value_type = int
    entity = Person
    definition_period = ETERNITY
    label = "年齢"
```

### パターン2: パラメータ参照ありの計算変数

```python
class income_tax(Variable):
    value_type = float
    entity = Person
    definition_period = YEAR
    label = "所得税"

    def formula(person, period, parameters):
        income = person('salary', period, options=[ADD])
        rate = parameters(period).taxes.income.rate
        return income * rate
```

### パターン3: 法改正対応（dated formula）

```python
class benefit_amount(Variable):
    value_type = float
    entity = Person
    definition_period = MONTH
    label = "給付金額"
    end = '2030-03-31'

    def formula_2020(person, period, parameters):
        # 2020年以降の計算式
        ...

    def formula_2015_04(person, period, parameters):
        # 2015年4月以降の計算式
        ...
```

### パターン4: 世帯→個人への投影

```python
class household_benefit_per_member(Variable):
    value_type = float
    entity = Person
    definition_period = MONTH

    def formula(person, period):
        total = person.household('household_total_benefit', period)
        nb = person.household.nb_persons()
        return total / nb
```

### パターン5: Enum を使う変数

```python
class OccupationType(Enum):
    __order__ = "employee freelancer student retired"
    employee  = "雇用者"
    freelancer = "フリーランス"
    student   = "学生"
    retired   = "退職者"

class occupation(Variable):
    value_type = Enum
    possible_values = OccupationType
    default_value = OccupationType.employee
    entity = Person
    definition_period = MONTH
    label = "就業形態"
```

---

ユーザーの要求に応じて、上記の仕様・テンプレートをもとに Variable コードの作成・説明・レビューを行ってください。
コードを生成する場合は、country package のエンティティ定義（Person/Household 等）が存在することを前提としてください。
