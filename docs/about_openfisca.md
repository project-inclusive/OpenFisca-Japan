# OpenFiscaについて

## OpenFiscaとは

### 概要
- OpenFiscaは、社会制度などをソフトウェアコードとして記述できる(Rule as Code)、フランス発のOSSです
  - [公式HP](https://openfisca.org/en)
  - [Githubリポジトリ](https://github.com/openfisca)
  - [OpenFiscaのドキュメント](https://openfisca.org/doc/)
  - ライセンスはAGPLです
- フランスには[Mes Aides](https://www.mesdroitssociaux.gouv.fr/accueil/)という、福祉制度が機械可読に実装され、自分のプロフィールを入力すると自分が受けられる福祉制度が確認できるWebサイトがあります
  - その裏側がOpenFiscaです

#### Rule as Codeとは
- Rule as Codeとは、法や条例、社会制度などを、ソフトウェアコードとして記述しようという概念です

### 特徴
- NumPyによるベクトル演算で社会制度を記述します
  - それにより、複数の世帯や個人に対し、if分岐なしで一括でロジックを適用できます
- （例）
  - if 文の場合：
    ```
    200 if their salary is less than 500;
    100 if their salary is strictly more than 500, but less than 1000;
    50 if their salary is strictly more than 1000, but less than 1500;
    0 otherwise.
    ```
  - OpenFiscaの場合：
    ```
    def formula(person, period):
       salary = person('salary', period)
       return select(
       ## 以下の二行がベクトル
           [salary <= 500, salary <= 1000, salary <= 1500, salary > 1500],
           [200, 100, 50, 0],
           )
    ```

- 社会制度のソフトウェアテストができます
  - 静的な制度の情報はPythonではなくYAMLによって簡単に記述、メンテナンスできるように工夫されています
  - たとえば児童手当の額が変わったとして、YAMLを数行書き換えるだけで反映できます


### 利点
- OpenFiscaは、期間によって制度が変化すること前提にしており、成人年齢、税率などが変わっても簡単に対応できます
- Pythonなので英語以外の文字列で記述できます
  - そのため、各国の法律用語や福祉用語を翻訳する必要がありません
    - （例）`児童手当 = parameters(対象期間).福祉.児童手当`

### 欠点
- NumPyをベースにしているので、数値以外の処理が難しいです

### 主要概念
- **parameters**
  - 使い回され変化しうるような、様々な制度に共通する、ある時点で静的な値
- **reforms**
  - 制度のロジックの上書き表現
- **situation_examples**
  - 制度のテスト
- **tests**
  - 制度のテスト
- **variables**
  - 制度のロジック
  - 個人、世帯、法人の持つ属性情報
- **entities**
  - 制度計算の単位
  - 世帯、人物（＝世帯員）

## Tips
- OpenFiscaフレームワークは高機能ですが、それゆえ想定と異なる挙動を示すこともあります
- 公式のマニュアルに載っていない内容もあるため、それらを以下に記載します

### テスト
- テスト実行
  - 全てのテストを実行 **(2023/2/14時点では失敗するため、下の「一部のテストを実行」でテストしてください)**
    - `make test` 
  - 一部のテストを実行
    - `openfisca test --country-package openfisca_japan openfisca_japan/tests/<実行したいテストファイル或いはディレクトリパス>`
      - 上記コマンド実行時にテストファイル（~.yaml）を読み込みます
      - そのため、テストファイルのみ修正する場合はそれ自身を修正してコマンド実行すれば良いです
- 内部計算方法の修正
  - openfisca_japan/variables/~.py等の計算方法を規定するファイルを修正する
  - 以下のコマンドでビルドを行わないとテスト時に修正が反映されない
    - `make build`
  - その後、上述のテストを行う
- `openfisca_japan/tests`以下のテストファイルでテストするとき、テストに成功した場合は`openfisca_japan/variables`以下のpythonファイル内で記載した標準出力(print関数の出力)はコンソールに表示されません
  - テストに失敗した場合、標準出力は表示されます
  - そのため、デバッグのためにわざと失敗するテストファイルでテストするというやり方があります
  - また、variablesのpythonファイル内でエラーが発生した場合はそのファイル内で宣言した変数の値も表示されます
  - variablesのpythonファイル内でエラーが発生せず、出力された結果がtestsのテストファイルと一致しない場合は、print関数で明示的に出力した内容しか表示されません
- テストファイルに記載された小数の値を`対象世帯.members`等で読み出す際、classのvalue_typeをfloatにしていても、0.5単位で丸められて読み出されます
  - 丸めの範囲は、以下の通りです
    - 閉区間[-0.25, 0.25] -> 0
    - 開区間(0.25, 0.75) -> 0.5
- yamlのテストファイル上での入力情報は、本来は途中で算出される値を手入力してもエラーになりません
  - 例えば、`所得`は本来は`収入`から`給与所得控除`を差し引いて算出されますが、yamlファイルの`input`に`所得`の値を手入力しても、正しく`output`が算出されます
  - これにより、各種手当等の算出方法をテストする際、所得制限額から所得ベースのテストを作成することができます
  - ただし、**openfiscaのAPIにjsonをポストする際は、途中で算出される値を入力するとエラーになるため、大元の情報を入力する必要があります**
  - フロントエンドを実装する際はこの点に注意してください
- 複数世帯テストの場合、単数世帯の場合とテストの構造が異なります

```yaml
# 単数世帯の場合
- name: 配偶者控除1
  period: 2023-06-01
  input:
    世帯:
      親一覧:
        - 親1
        - 配偶者1
    世帯員:
      親1:
        所得:
          '2023-06-01': 9000000
      配偶者1:
        所得:
          '2023-06-01': 480000
  output:
    世帯:
      配偶者控除:
        '2023-06-01': 380000
```

```yaml
# 複数世帯の場合（input.世帯一覧.世帯N, output.世帯一覧.世帯Nの配下に記述）
- name: 配偶者所得(複数世帯)
  period: 2023-06-01
  input:
    世帯一覧:
      世帯1:
        親一覧:
          - 親1
          - 配偶者1
      世帯2:
        親一覧:
          - 親2
          - 配偶者2
    世帯員:
      親1:
        所得:
          '2023-06-01': 9500000
      配偶者1:
        所得:
          '2023-06-01': 480000
      親2:
        所得:
          '2023-06-01': 9000000
        誕生年月日: '1953-05-01'
      配偶者2:
        誕生年月日: '1953-05-01'
        所得:
          '2023-06-01': 480000
  output:
    世帯一覧:
      世帯1:
        配偶者控除:
          '2023-06-01': 260000
      世帯2:
        配偶者控除:
          '2023-06-01': 480000
```

### 計算ロジック

#### Variables
- メソッド名 formula の代わりに forluma\_{年} や formula\_{年\}\_{月}\_{日} を使うと、指定した時刻以降のperiodの場合にのみ呼び出されます
- つまり、periodの場合分けでif文を使わずに済むようになります
  - [参考実装](https://github.com/openfisca/openfisca-core/blob/fad5f69a91435c767cb6bca73de6a7d1b666c082/openfisca_core/variables/variable.py#L246)
- `対象世帯(変数名, 対象期間)` `対象人物(変数名, 対象期間)` 等で別のVariableの値を参照できます
  - `対象人物`のvariableを取得した場合は世帯人数分のndarrayが返されるが、`対象世帯.members`で参照するときや最終的な結果やテスト時は世帯員ごとに処理される。
  - 対象世帯の各世帯員のVariableを参照する場合は `対象世帯.members(変数名, 対象期間)`
  - 対象人物の世帯のVariableを参照する場合は `対象人物.世帯(変数名, 対象期間)`
  - 特定の役割の世帯員の値のみ抽出する場合は `対象世帯.親(変数名, 対象期間)` (`親` 以外も同様)
  - 取得した値を式に用いる場合 **複合演算子 (`+=`, `-=` 等)を使用すると参照元の変数そのものが書き変わり計算に不整合が生じてしまいます**
    - NG: `a += b` (`a` で参照しているvariableの計算結果自体を書き換えてしまう)
    - OK: `a = a + b` (variableを変えずに、(Pythonのローカル変数) `a` のみを上書き)
  - Variableの変数名はプログラム全体で一意です
    - 別ファイルのVariableと名前の衝突に気を付ける必要があります
- 実装する際は後述「複数世帯対応」の実装方法に従ってください

#### Period
- 別の期間に変換することが可能です
  - `対象期間.offset(n, 'year')` n年前
  - 決め打ちで期間を取得することも可能 (例: 対象期間の年の12/31 `period(f'{対象期間.start.year}-12-31')`)
- Variableから定義される期間が異なる別Variale (`definition_period`) を参照する場合、期間の換算が必要
  - `person('月給', period, options = [ADD])` (年額のvariableから月額のvarable `月給` を呼び出す)

#### Enum
- 各要素の属性
  - `name`: 名前（属性名そのものが文字列で得られる）
  - `value`：値（定義するときに代入した値）

#### Entities

- 計算対象の単位を表わす
  - `entities.py` で定義
    - `人物`
    - `世帯`
- 名称を変更した場合、`openfisca_japan/situation_examples` 配下のJSONファイルも修正が必要
  - 修正が漏れた場合 `SituationParsingError` でサーバーが起動しなくなる

#### 複数世帯に対応した実装方法

- OpenFiscaでは複数世帯の入力があった場合、入力された全世帯に対してまとめて計算を行います
  - 政策シミュレータ等、多数の世帯に対して計算を行う必要がある場合に使用
- 複数世帯入力に対するメソッドの返り値  
`世帯1`が`太郎`(所得: 10000円), `花子`(所得: 20000円), `世帯2`が`Tom`(所得: 1000円)の例で考えます
  - `所得一覧 = 対象世帯.members("所得", 対象期間)`のように世帯員ごとの変数を取得するメソッドの返り値は、`ndarray([10000, 20000, 1000])`と全世帯員の値が格納された1次元のndarrayになります
  - `対象世帯.max(所得一覧, 対象期間)`のように世帯ごとの変数を取得するメソッドの返り値は、`ndarray([20000, 1000])`と世帯ごとの値が格納された1次元のndarrayになります
- 複数世帯対応の計算を行うため、一部**一般的なPythonプログラミングとは異なる実装を行う必要があります**

##### if文を使用しない

- 複数世帯入力の場合、if文の条件式で実行時エラーが発生します
  - `ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()`
  - `世帯1` は条件を満たすが `世帯2` は条件を満たさない場合 `True` か `False` か判断できないため
- 対処法1: 早期リターンの代わりに、条件を変数に代入し最後に金額に掛け算する形式にする
  - ndarrayが世帯ごとに条件を計算するため正しい値となる

```python
# before
if 居住都道府県 != "東京都":
    return 0
# ...
```

```python
# after
居住地条件 =  居住都道府県 == "東京都"
# ...
return 居住地条件 * 金額
```

- 対処法2: if文による分岐の代わりに `np.select` を使用する
  - `np.select(条件一覧, 条件を満たした場合の出力一覧, いずれも満たさない場合のデフォルト値)` の形式

```python
本人の控除 = np.select(
    [障害者控除対象, 特別障害者控除対象], # 条件一覧
    [parameters(対象期間).所得.障害者控除額, parameters(対象期間).所得.特別障害者控除額], # 条件を満たした場合の出力一覧
    0) # デフォルト値
```

##### 値の集計、加工には `numpy` 関数ではなくOpenFiscaのメソッドを使う
- 複数世帯を対象とする際、世帯ごとに正しく集計されません
- 対象メソッドと置き換え先
  - `np.max` -> `対象世帯.max`
  - `np.sum` -> `対象世帯.sum`

##### `or` の代わりに `+` 、 `and` の代わりに `*` を使用する
- 複数世帯入力の場合、`or`, `and`の使用箇所で実行時エラーが発生します
  - `世帯1` は条件を満たすが `世帯2` は条件を満たさない場合 `True` か `False` か判断できないため
- 対処法: `+`, `*` を使用し、世帯or世帯員ごとに真偽値を計算する
  - `+`, `*` は `np.ndarray` に対しても使用可能です
  - `True` は `1`, `False` は `0` なので、`+` で `or`, `*` で `and` の代用ができます
    - 例:
      - `[True, True] * [True, False] = [True, False]`
      - `[True, False] + [False, True] = [True, True]`
  - `or`, `and` と `+`, `*` では演算子の優先順位が異なるため、明示的にかっこでくくる必要がある場合があります
    - 例： `A > B and C < D` (`(A > B) and (C < D)`)
      - `(A > B) * (C < D)` に書き換える必要がある (かっこが無いと `A > (B * C) < D` になってしまうため)
    - Pythonの演算子の優先順位: https://docs.python.org/3/reference/expressions.html#operator-precedence

##### csvファイルの読み込みには `np.genfromtxt` を使用する

- 標準ライブラリの`csv`を使用するとリスト形式で結果が取得され、variableの`np.ndarray`との形式の違いから計算に使用できない
- 対処法: `np.genfromtxt` で読み込む
  - 列名の文字列が使用できなくなるため、列名に対応するインデックスを生成して要素参照する

```csv
,公立,国立,私立
全日制課程,9900,9600,9900
定時制課程,2700,9600,9900
通信制課程,520,9600,9900
```

```python
# csvファイル読み込み
@cache
def 支給限度額_学年制表():
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校等就学支援金/支給額/支給限度額_学年制.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:] # ヘッダーを読み込まないようインデックスは1始まり
```

```python
# variable内での参照

# 行名をインデックスに変換(0始まりなので注意)
高校履修種別インデックス = np.select(
    [高校履修種別 == 高校履修種別パターン.全日制課程,
     高校履修種別 == 高校履修種別パターン.定時制課程,
     高校履修種別 == 高校履修種別パターン.通信制課程],
    list(range(3)),
    # NOTE: デフォルト値を-1にすることでindex out of boundエラー防止（条件に当てはまらない入力が来ても必ず最後の要素が取得される）
    -1).astype(int)

# 列名をインデックスに変換(0始まりなので注意)
高校運営種別インデックス = np.select(
    [高校運営種別 == 高校運営種別パターン.公立,
     高校運営種別 == 高校運営種別パターン.国立,
     高校運営種別 == 高校運営種別パターン.私立],
    list(range(3)),
    -1).astype(int)

支給金額 = 支給限度額_学年制表()[高校履修種別インデックス, 高校運営種別インデックス]

# NOTE: out of bound対策として条件外の場合も支給金額が取得できてしまう（誤った値）ため、改めて条件を満たすかどうか確認
支給対象者である = 高校生である * (高校履修種別 != 高校履修種別パターン.無) * (高校運営種別 != 高校運営種別パターン.無)
return 支給対象者である * 支給金額
```

##### 世帯員をソートしたい場合（「第一子の○○」、「最も所得が多い世帯員」） `get_rank` を使用する
- `対象人物.get_rank` or `対象世帯.get_rank` によって、各世帯員をソートした際の順序（何番目にあたるか）を取得可能
  - 順序は世帯の中、かつ指定した条件を満たす範囲で付けられる

```python
子供である = 対象人物.has_role(世帯.子)
# condition「子供である」を満たす範囲内で、各世帯員を `-年齢` でソートすると何番目にあたるかを取得 (年齢が高い順に0, 1, 2,...)
# 条件を満たさない場合 `-1` となる
子供の年齢降順インデックス = 対象人物.get_rank(対象人物.世帯, -年齢, condition=子供である)

# 第一子は「子供である」かつ「子供の年齢降順インデックス」のソート順の最初(0始まりのため0番目)となるため、以下で取得可能
第一子である = 子供の年齢降順インデックス == 0
# 以下この条件を金額や他の条件と掛け合わせることで、第一子に関する計算が可能
```

### API
- (APIのURL)/spec から仕様のjsonをgetできる
  - `definitions.世帯.properties` : 世帯に関する変数
  - `definitions.人物.properties` : 人物に関する変数
  - `paths` : APIのエンドポイント
- テスト用APIでは日付の月と日は0埋めの2桁でなくても正しく計算されるが、web APIでは月と日は0埋めの2桁でないと正しく計算されずエラーも出ない
  - 即ち、日付は「YYYY-MM-DD」のフォーマットで入力する必要がある

- API POST specification
  - Strings enclosed in " " cannot be changed.
  - \<period\> means the period during which an attribute has its value.   
  So attributes that do not change permanently (only `誕生年月日` (birthday) as of 2023/9/2) are `ETERNITY`, and other attributes set the input date (YYYY-MM-DD).
  - Please set the value of \<allowance to be calculated\> to `null` when POST. The value calculated by the backend API is set there and returned.  
  Only attributes that are set when POST is calculated by the backend API. Therefore, any allowances that may be displayed on the frontend need to be set to `null` in the json when POSTed.

  ```
  {
    "世帯員": {
      <parent1>: {
        <personal attribute>: {
          <period>: value
        },
        <personal attribute>: {
          <period>: value
        },
      },
      <parent2>: {
        <personal attribute>: {
          <period>: value
        },
        <personal attribute>: {
          <period>: value
        },
      },
      <child1>: {
        <personal attribute>: {
          <period>: value
        },
      },
      <child2>: {
        <personal attribute>: {
          <period>: value
        },
      },
      <grandparent1>: {
        <personal attribute>: {
          <period>: value
        },
      }
    },
    "世帯": {
      "世帯1": {
        "親一覧": [<parent1>, <parent2>],
        "子一覧": [<child1>, <child2>],
        "祖父母一覧": [<grandparent1>]
        <household attribute>: {
          <period>: value
        },
        <household attribute>: {
          <period>: value
        },
        <allowance to be calculated>: {
          <period>: null
        },
        <allowance to be calculated>: {
          <period>: null
        },
      }
    }
  }

  ```
