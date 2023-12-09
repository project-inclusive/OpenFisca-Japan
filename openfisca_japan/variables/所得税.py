"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

import csv

import numpy as np

# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY, period
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 人物, 世帯

from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン


# NOTE: 項目数が多い金額表は可読性の高いCSV形式としている。
with open('openfisca_japan/assets/所得/配偶者控除額.csv') as f:
    reader = csv.DictReader(f)
    # 配偶者控除額表[配偶者の所得区分][納税者本人の所得区分] の形で参照可能
    配偶者控除額表 = {row[""]: row for row in reader}


with open('openfisca_japan/assets/所得/配偶者特別控除額.csv') as f:
    reader = csv.DictReader(f)
    # 配偶者特別控除額表[配偶者の所得区分][納税者本人の所得区分] の形で参照可能
    配偶者特別控除額表 = {row[""]: row for row in reader}


with open('openfisca_japan/assets/所得/配偶者控除額_老人控除対象配偶者.csv') as f:
    reader = csv.DictReader(f)
    # 老人控除対象配偶者_配偶者控除額表[配偶者の所得区分][納税者本人の所得区分] の形で参照可能
    老人控除対象配偶者_配偶者控除額表 = {row[""]: row for row in reader}


class 給与所得控除額(Variable):
    value_type = float
    entity = 人物
    # NOTE: Variable自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の収入に対する給与所得控除額"

    def formula_2020_01_01(対象人物, 対象期間, _parameters):
        収入 = 対象人物("収入", 対象期間)

        return np.select([収入 <= 1625000, 収入 <= 1800000, 収入 <= 3600000, 収入 <= 6600000, 収入 <= 8500000],
                         [float(550000), 収入 * 0.4 - 100000, 収入 * 0.3 + 80000, 収入 * 0.2 + 440000, 収入 * 0.1 + 1100000],
                         float(1950000))

    # TODO: 必要であれば平成28(2016)年より前の計算式も追加
    def formula_2017_01_01(対象人物, 対象期間, _parameters):
        収入 = 対象人物("収入", 対象期間)

        return np.select([収入 <= 1625000, 収入 <= 1800000, 収入 <= 3600000, 収入 <= 6600000, 収入 <= 10000000],
                         [float(650000), 収入 * 0.4, 収入 * 0.3 + 180000, 収入 * 0.2 + 540000, 収入 * 0.1 + 1200000],
                         float(2200000))


class 障害者控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "障害者控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象世帯, 対象期間, parameters):
        同居特別障害者控除対象 = 対象世帯.members("同居特別障害者控除対象", 対象期間)
        特別障害者控除対象 = 対象世帯.members("特別障害者控除対象", 対象期間)
        障害者控除対象 = 対象世帯.members("障害者控除対象", 対象期間)

        # 障害者控除額は対象人数分が算出される
        # https://www.city.hirakata.osaka.jp/kosodate/0000000544.html
        同居特別障害者控除対象人数 = 対象世帯.sum(同居特別障害者控除対象)
        # 重複して該当しないよう、同居特別障害者控除対象の場合を除外
        特別障害者控除対象人数 = 対象世帯.sum(特別障害者控除対象 * np.logical_not(同居特別障害者控除対象))
        障害者控除対象人数 = 対象世帯.sum(障害者控除対象)

        同居特別障害者控除額 = parameters(対象期間).所得.同居特別障害者控除額
        特別障害者控除額 = parameters(対象期間).所得.特別障害者控除額
        障害者控除額 = parameters(対象期間).所得.障害者控除額
        
        return 同居特別障害者控除対象人数 * 同居特別障害者控除額 + 特別障害者控除対象人数 * 特別障害者控除額 + 障害者控除対象人数 * 障害者控除額


class 障害者控除対象(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "障害者控除の対象になるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象人物, 対象期間, parameters):
        身体障害者手帳等級 = 対象人物("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級 = 対象人物("精神障害者保健福祉手帳等級", 対象期間)
        療育手帳等級 = 対象人物("療育手帳等級", 対象期間)
        愛の手帳等級 = 対象人物("愛の手帳等級", 対象期間)

        特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間)

        障害者控除対象 = \
            ~特別障害者控除対象 *  \
                ((身体障害者手帳等級 != 身体障害者手帳等級パターン.無) + \
                    (精神障害者保健福祉手帳等級 != 精神障害者保健福祉手帳等級パターン.無) + \
                        (療育手帳等級 != 療育手帳等級パターン.無) + \
                            (愛の手帳等級 != 愛の手帳等級パターン.無))

        return 障害者控除対象


class 特別障害者控除対象(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "特別障害者控除の対象になるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象人物, 対象期間, parameters):
        身体障害者手帳等級 = 対象人物("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級 = 対象人物("精神障害者保健福祉手帳等級", 対象期間)
        療育手帳等級 = 対象人物("療育手帳等級", 対象期間)
        愛の手帳等級 = 対象人物("愛の手帳等級", 対象期間)

        特別障害者控除対象 = \
            (身体障害者手帳等級 == 身体障害者手帳等級パターン.一級) + \
                (身体障害者手帳等級 == 身体障害者手帳等級パターン.二級) + \
                    (精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.一級) + \
                        (療育手帳等級 == 療育手帳等級パターン.A) + \
                            (愛の手帳等級 == 愛の手帳等級パターン.一度) + \
                                (愛の手帳等級 == 愛の手帳等級パターン.二度)
        
        return 特別障害者控除対象


class 同居特別障害者控除対象(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "同居特別障害者控除の対象になるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象人物, 対象期間, parameters):
        特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間)
        同一生計配偶者である = 対象人物("同一生計配偶者である", 対象期間)
        扶養親族である = 対象人物("扶養親族である", 対象期間)

        # TODO: 「同居していない親族」も世帯内で扱うようになったら以下の判定追加（現状フロントエンドでは同居している親族しか扱っていない）
        # 「納税者自身、配偶者、その納税者と生計を一にする親族のいずれかとの同居を常況としている」        
        return 特別障害者控除対象 * (同一生計配偶者である | 扶養親族である)


class ひとり親控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "ひとり親控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1171.htm"

    def formula_2020_01_01(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        # 児童扶養手当の対象と異なり、父母の遺棄・DV等は考慮しない
        # (参考：児童扶養手当 https://www.city.hirakata.osaka.jp/0000026828.html)
        対象ひとり親 = (対象世帯.nb_persons(世帯.配偶者) == 0) * (対象世帯.nb_persons(世帯.子) >= 1) 
        ひとり親控除額 = parameters(対象期間).所得.ひとり親控除額
        ひとり親控除_所得制限額 = parameters(対象期間).所得.ひとり親控除_所得制限額

        return ひとり親控除額 * 対象ひとり親 * (世帯高所得 < ひとり親控除_所得制限額)


class 寡婦控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "寡婦控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1170.htm"

    def formula_2020_01_01(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        寡婦 = 対象世帯("寡婦", 対象期間)
        寡婦控除額 = parameters(対象期間).所得.寡婦控除額
        寡婦控除_所得制限額 = parameters(対象期間).所得.寡婦控除_所得制限額

        return 寡婦控除額 * 寡婦 * (世帯高所得 <= 寡婦控除_所得制限額)


class 学生(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "小・中・高校、大学、専門学校、職業訓練学校等の学生"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1175.htm"


class 勤労学生控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "勤労学生控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1175.htm"

    def formula(対象世帯, 対象期間, parameters):
        # 勤労学生控除額は対象人数によらず定額そう
        # https://www.city.hirakata.osaka.jp/kosodate/0000000544.html

        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        学生 = np.any(対象世帯.members("学生", 対象期間))
        勤労学生控除額 = parameters(対象期間).所得.勤労学生控除額
        勤労学生_所得制限額 = parameters(対象期間).所得.勤労学生_所得制限額
        所得条件 = (世帯高所得 > 0) * (世帯高所得 <= 勤労学生_所得制限額)

        return 所得条件 * 学生 * 勤労学生控除額


class 同一生計配偶者である(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "同一生計配偶者であるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2022/03/order3/yogo/3-3_y15.htm"


    def formula(対象人物, 対象期間, parameters):
        if 対象人物.世帯.nb_persons(世帯.配偶者)[0] == 0:
            return False

        所得 = 対象人物("所得", 対象期間)
        同一生計配偶者_所得制限額 = parameters(対象期間).所得.同一生計配偶者_所得制限額

        自分の所得 = 対象人物.世帯.自分("所得", 対象期間)
        配偶者の所得 = 対象人物.世帯.配偶者("所得", 対象期間)

        if 自分の所得[0] > 配偶者の所得[0]:
            return 対象人物.has_role(世帯.配偶者) * (所得 <= 同一生計配偶者_所得制限額)
        else:
            return 対象人物.has_role(世帯.自分) * (所得 <= 同一生計配偶者_所得制限額)


class 配偶者控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "配偶者控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1191.htm"
    documentation = """
    配偶者特別控除とは異なる。
    配偶者の所得が配偶者控除の所得制限を超えた場合でも、配偶者特別控除が適用される可能性がある。
    """

    def formula(対象世帯, 対象期間, parameters):
        if 対象世帯.nb_persons(世帯.配偶者) == 0:
            return 0

        自分の所得 = 対象世帯.自分("所得", 対象期間)
        配偶者の所得 = 対象世帯.配偶者("所得", 対象期間)

        # 所得が高いほうが控除を受ける対象となる
        納税者の所得 = np.max([自分の所得[0], 配偶者の所得[0]])
        納税者の配偶者の所得 = np.min([自分の所得[0], 配偶者の所得[0]])

        納税者の所得区分 = np.select(
            [納税者の所得 <= 9000000, 納税者の所得 > 9000000 and 納税者の所得 <= 9500000, 納税者の所得 > 9500000 and 納税者の所得 <= 10000000],
            ["~9000000", "~9500000", "~10000000"],
            None)
        
        同一生計配偶者_所得制限額 = parameters(対象期間).所得.同一生計配偶者_所得制限額
        納税者の配偶者の所得区分 = np.select(
            [納税者の配偶者の所得 <= 同一生計配偶者_所得制限額],
            ["~480000"],
            None)

        if 納税者の所得区分 == None or 納税者の配偶者の所得区分 == None:
            # 該当しない場合
            return 0

        # NOTE: その年の12/31時点の年齢を参照
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word5
        該当年12月31日 = period(f'{対象期間.start.year}-12-31')
        納税者の配偶者の年齢 = np.select(
            [納税者の配偶者の所得 == 自分の所得, 納税者の配偶者の所得 == 配偶者の所得],
            [対象世帯.自分("年齢", 該当年12月31日), 対象世帯.配偶者("年齢", 該当年12月31日)],
            None)

        # この分岐には入らない想定
        if 納税者の配偶者の年齢 == None:
            return 0

        if 納税者の配偶者の年齢[0] >= 70:
            return 老人控除対象配偶者_配偶者控除額表[str(納税者の配偶者の所得区分)][str(納税者の所得区分)]

        return 配偶者控除額表[str(納税者の配偶者の所得区分)][str(納税者の所得区分)]


class 配偶者特別控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "配偶者特別控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1195.htm"

    def formula(対象世帯, 対象期間, parameters):
        if 対象世帯.nb_persons(世帯.配偶者) == 0:
            return 0

        自分の所得 = 対象世帯.自分("所得", 対象期間)
        配偶者の所得 = 対象世帯.配偶者("所得", 対象期間)

        # 所得が高いほうが控除を受ける対象となる
        納税者の所得 = np.max([自分の所得[0], 配偶者の所得[0]])
        納税者の配偶者の所得 = np.min([自分の所得[0], 配偶者の所得[0]])

        納税者の所得区分 = np.select(
            [納税者の所得 <= 9000000, 納税者の所得 > 9000000 and 納税者の所得 <= 9500000, 納税者の所得 > 9500000 and 納税者の所得 <= 10000000],
            ["~9000000", "~9500000", "~10000000"],
            None)
        
        納税者の配偶者の所得区分 = np.select(
            [納税者の配偶者の所得 > 480000 and 納税者の配偶者の所得 <= 950000,
             納税者の配偶者の所得 > 950000 and 納税者の配偶者の所得 <= 1000000,
             納税者の配偶者の所得 > 1000000 and 納税者の配偶者の所得 <= 1050000,
             納税者の配偶者の所得 > 1050000 and 納税者の配偶者の所得 <= 1100000,
             納税者の配偶者の所得 > 1100000 and 納税者の配偶者の所得 <= 1150000,
             納税者の配偶者の所得 > 1150000 and 納税者の配偶者の所得 <= 1200000,
             納税者の配偶者の所得 > 1200000 and 納税者の配偶者の所得 <= 1250000,
             納税者の配偶者の所得 > 1250000 and 納税者の配偶者の所得 <= 1300000,
             納税者の配偶者の所得 > 1300000 and 納税者の配偶者の所得 <= 1330000],
            ["~950000",
             "~1000000",
             "~1050000",
             "~1100000",
             "~1150000",
             "~1200000",
             "~1250000",
             "~1300000",
             "~1330000"],
            None)

        if 納税者の所得区分 == None or 納税者の配偶者の所得区分 == None:
            # 該当しない場合
            return 0

        return 配偶者特別控除額表[str(納税者の配偶者の所得区分)][str(納税者の所得区分)]


class 扶養控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "扶養控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1180.htm"
    

    def formula(対象世帯, 対象期間, parameters):
        扶養親族である = 対象世帯.members("扶養親族である", 対象期間)

        # NOTE: その年の12/31時点の年齢を参照
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word5
        該当年12月31日 = period(f'{対象期間.start.year}-12-31')
        年齢 = 対象世帯.members("年齢", 該当年12月31日)

        控除対象扶養親族である = 扶養親族である * (年齢 >= 16)

        特定扶養親族である = 控除対象扶養親族である * (年齢 >= 19) * (年齢 < 23)
        老人扶養親族である = 控除対象扶養親族である * (年齢 >= 70)

        # NOTE: 入院中の親族は同居扱いだが老人ホーム等への入居は除く
        # TODO: 「同居していない親族」も世帯内で扱うようになったら同居老親かどうかの判定追加
        介護施設入所中 = 対象世帯.members("介護施設入所中", 対象期間)
        同居している老人扶養親族である = 老人扶養親族である * np.logical_not(介護施設入所中)
        同居していない老人扶養親族である = 老人扶養親族である * 介護施設入所中
        
        # NOTE: np.selectのcondlistは最初に該当した条件で計算される
        扶養控除一覧 = np.select(
            [特定扶養親族である,
             同居している老人扶養親族である,
             同居していない老人扶養親族である,
             控除対象扶養親族である],
             [parameters(対象期間).所得.扶養控除_特定扶養親族,
              parameters(対象期間).所得.扶養控除_老人扶養親族_同居老親等,
              parameters(対象期間).所得.扶養控除_老人扶養親族_同居老親等以外の者,
              parameters(対象期間).所得.扶養控除_一般],
            0)
        
        return 対象世帯.sum(扶養控除一覧)


class 扶養親族である(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "扶養親族であるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm"


    def formula(対象人物, 対象期間, parameters):
        扶養親族所得金額 = parameters(対象期間).所得.扶養親族所得金額

        # 扶養人数が1人ではない場合を考慮する
        世帯所得一覧 = 対象人物("所得", 対象期間)
        自分である = 対象人物.has_role(世帯.自分)
        配偶者である = 対象人物.has_role(世帯.配偶者)
        # 扶養親族に配偶者は含まれない。(親等の児童以外を扶養する場合はそれらも含む必要あり)
        # 扶養親族の定義(参考): https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1180.htm
        return np.logical_not(自分である) * np.logical_not(配偶者である) * (世帯所得一覧 <= 扶養親族所得金額)


class 扶養人数(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "扶養人数"

    def formula(対象世帯, 対象期間, parameters):
        扶養親族である = 対象世帯.members("扶養親族である", 対象期間)
        # この時点でndarrayからスカラーに変換しても、他から扶養人数を取得する際はndarrayに変換されて返されてしまう
        return 対象世帯.sum(扶養親族である)


class 控除後世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "各種控除が適用された後の世帯高所得額"
    reference = "https://www.city.himeji.lg.jp/waku2child/0000013409.html"

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 所得税等の計算にも使用する場合、配偶者控除等も考慮する(現在の実装は児童手当の世帯高所得額)
        # https://www.nta.go.jp/publication/pamph/koho/kurashi/html/01_1.htm

        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象世帯("障害者控除", 対象期間)
        ひとり親控除 = 対象世帯("ひとり親控除", 対象期間)
        寡婦控除 = 対象世帯("寡婦控除", 対象期間)
        勤労学生控除 = 対象世帯("勤労学生控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する    

        総控除額 = 社会保険料 + 給与所得及び雑所得からの控除額 + 障害者控除 + ひとり親控除 + 寡婦控除 + 勤労学生控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(世帯高所得 - 総控除額, 0.0, None)


class 児童扶養手当の控除後世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "各種控除が適用された後の児童扶養手当の世帯高所得額"
    reference = "https://www.city.otsu.lg.jp/soshiki/015/1406/g/jidofuyoteate/1389538447829.html"

    def formula(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象世帯("障害者控除", 対象期間)
        勤労学生控除 = 対象世帯("勤労学生控除", 対象期間)
        配偶者特別控除 = 対象世帯("配偶者特別控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する    
        # 養育者が児童の父母の場合は寡婦控除・ひとり親控除は加えられない

        総控除額 = 社会保険料 + 給与所得及び雑所得からの控除額 + 障害者控除 + 勤労学生控除 + 配偶者特別控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(世帯高所得 - 総控除額, 0.0, None)
    

class 特別児童扶養手当の控除後世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "各種控除が適用された後の特別児童扶養手当の世帯高所得額"
    reference = "https://www.city.otsu.lg.jp/soshiki/015/1406/g/jidofuyoteate/1389538447829.html"

    def formula(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象世帯("障害者控除", 対象期間)
        勤労学生控除 = 対象世帯("勤労学生控除", 対象期間)
        ひとり親控除 = 対象世帯("ひとり親控除", 対象期間)
        寡婦控除 = 対象世帯("寡婦控除", 対象期間)
        配偶者特別控除 = 対象世帯("配偶者特別控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する   

        総控除額 = 社会保険料 + 給与所得及び雑所得からの控除額 + 障害者控除 + 勤労学生控除 + ひとり親控除 + 寡婦控除 + 配偶者特別控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(世帯高所得 - 総控除額, 0.0, None)
