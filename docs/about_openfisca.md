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

### 計算ロジック (variables)
- メソッド名 formula の代わりに forluma\_{年} や formula\_{年\}\_{月}\_{日} を使うと、指定した時刻以降のperiodの場合にのみ呼び出されます
- つまり、periodの場合分けでif文を使わずに済むようになります
  - [参考実装](https://github.com/openfisca/openfisca-core/blob/fad5f69a91435c767cb6bca73de6a7d1b666c082/openfisca_core/variables/variable.py#L246)
- `対象世帯(変数名, 対象期間)` `対象人物(変数名, 対象期間)` 等で別のVariableの値を参照できます
  - `対象人物`のvariableを取得した場合は世帯人数分のndarrayが返されるが、`対象世帯.members`で参照するときや最終的な結果やテスト時は世帯員ごとに処理される。
  - 対象世帯の各世帯員のVariableを参照する場合は `対象世帯.members(変数名, 対象期間)`
  - 対象人物の世帯のVariableを参照する場合は `対象人物.世帯(変数名, 対象期間)`
  - ただし、取得した値を式に用いる場合 **複合演算子 (`+=`, `-=` 等)を使用すると参照元の変数そのものが書き変わり計算に不整合が生じてしまいます**
    - NG: `a += b` (`a` で参照しているvariableの計算結果自体を書き換えてしまう)
    - OK: `a = a + b` (variableを変えずに、(Pythonのローカル変数) `a` のみを上書き)

### API
- (APIのURL)/spec から仕様のjsonをgetできる
  - `definitions.世帯.properties` : 世帯に関する変数
  - `definitions.人物.properties` : 人物に関する変数
  - `paths` : APIのエンドポイント
- テスト用APIでは日付の月と日は0埋めの2桁でなくても正しく計算されるが、web APIでは月と日は0埋めの2桁でないと正しく計算されずエラーも出ない
  - 即ち、日付は「YYYY-MM-DD」のフォーマットで入力する必要がある

- API POST specification
  - Strings enclosed in " " cannot be changed.
  - A `parent` means a parent of `you` and a grandparent of a `child`.
  - \<period\> means the period during which an attribute has its value.   
  So attributes that do not change permanently (only `誕生年月日` (birthday) as of 2023/9/2) are `ETERNITY`, and other attributes set the input date (YYYY-MM-DD).
  - Please set the value of \<allowance to be calculated\> to `null` when POST. The value calculated by the backend API is set there and returned.  
  Only attributes that are set when POST is calculated by the backend API. Therefore, any allowances that may be displayed on the frontend need to be set to `null` in the json when POSTed.

  ```
  {
    "世帯員": {
      <you>: {
        <personal attribute>: {
          <period>: value
        },
        <personal attribute>: {
          <period>: value
        },
      },
      <spouse>: {
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
      <parent1>: {
        <personal attribute>: {
          <period>: value
        },
      }
    },
    "世帯": {
      "世帯1": {
        "自分一覧": [<you>],
        "配偶者一覧": [<spouse>],
        "子一覧": [<child1>, <child2>],
        "親一覧": [<parent1>]
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