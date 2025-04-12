"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

from functools import cache

import numpy as np
# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY, period
from openfisca_core.variables import Variable
from openfisca_japan import COUNTRY_DIR
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


# NOTE: 項目数が多い金額表は可読性の高いCSV形式としている。


@cache
def 配偶者控除額表():
    """
    csvファイルから値を読み込み

    配偶者控除額表()[配偶者の所得区分, 納税者本人の所得区分] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/所得/配偶者控除額.csv",
                  delimiter=",", skip_header=1, dtype="int64")[np.newaxis, 1:]


@cache
def 配偶者特別控除額表():
    """
    csvファイルから値を読み込み

    配偶者特別控除額表()[配偶者の所得区分, 納税者本人の所得区分] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/所得/配偶者特別控除額.csv",
                  delimiter=",", skip_header=1, dtype="int64")[:, 1:]


@cache
def 老人控除対象配偶者_配偶者控除額表():
    """
    csvファイルから値を読み込み

    老人控除対象配偶者_配偶者控除額表()[配偶者の所得区分, 納税者本人の所得区分] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/所得/配偶者控除額_老人控除対象配偶者.csv",
                         delimiter=",", skip_header=1, dtype="int64")[np.newaxis, 1:]


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
    entity = 人物
    definition_period = DAY
    label = "障害者控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象人物, 対象期間, _parameters):
        # 自身が扶養に入っている、または同一生計配偶者である場合、納税者（世帯主）が控除を受ける
        扶養親族である = 対象人物("扶養親族である", 対象期間)
        同一生計配偶者である = 対象人物("同一生計配偶者である", 対象期間)
        被扶養者である = 扶養親族である + 同一生計配偶者である

        所得 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, -所得)
        # NOTE: 便宜上、被扶養者は所得が最も高い世帯員の扶養に入るとする
        所得が最も高い世帯員である = 所得降順 == 0

        控除対象額 = 対象人物("障害者控除対象額", 対象期間)
        # NOTE: 異なる人物に対する値であるため、人物ではなく世帯ごとに集計（でないと「扶養者である」と要素がずれてしまい計算できない)
        被扶養者の合計控除額 = 対象人物.世帯.sum(被扶養者である * 控除対象額)

        # 最も所得が高い世帯員ではないが、一定以上の所得がある場合
        扶養に入っていない納税者である = np.logical_not(所得が最も高い世帯員である) * np.logical_not(被扶養者である)
        # 被扶養者は控除を受けない（扶養者が代わりに控除を受けるため）
        return 所得が最も高い世帯員である * (被扶養者の合計控除額 + 控除対象額) + 扶養に入っていない納税者である * 控除対象額


class 障害者控除対象額(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "障害者控除額の対象額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"
    documentation = """
    実際の控除額は同一生計配偶者、扶養親族が該当する場合にも加算される
    """

    def formula(対象人物, 対象期間, parameters):
        # 障害者控除額は対象人物ごとに算出される
        # https://www.city.hirakata.osaka.jp/kosodate/0000000544.html
        同居特別障害者控除対象 = 対象人物("同居特別障害者控除対象", 対象期間)
        # 重複して該当しないよう、同居特別障害者控除対象の場合を除外
        特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間) * np.logical_not(同居特別障害者控除対象)
        障害者控除対象 = 対象人物("障害者控除対象", 対象期間)

        同居特別障害者控除額 = parameters(対象期間).所得.同居特別障害者控除額
        特別障害者控除額 = parameters(対象期間).所得.特別障害者控除額
        障害者控除額 = parameters(対象期間).所得.障害者控除額

        return 同居特別障害者控除対象 * 同居特別障害者控除額 + 特別障害者控除対象 * 特別障害者控除額 + 障害者控除対象 * 障害者控除額


class 障害者控除対象(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "障害者控除の対象になるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象人物, 対象期間, _parameters):
        身体障害者手帳等級 = 対象人物("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級 = 対象人物("精神障害者保健福祉手帳等級", 対象期間)
        療育手帳等級 = 対象人物("療育手帳等級", 対象期間)
        愛の手帳等級 = 対象人物("愛の手帳等級", 対象期間)

        特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間)

        障害者控除対象 = \
            ~特別障害者控除対象 *  \
            ((身体障害者手帳等級 != 身体障害者手帳等級パターン.無)
             + (精神障害者保健福祉手帳等級 != 精神障害者保健福祉手帳等級パターン.無)
         + (療育手帳等級 != 療育手帳等級パターン.無)
                + (愛の手帳等級 != 愛の手帳等級パターン.無))

        return 障害者控除対象


class 特別障害者控除対象(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "特別障害者控除の対象になるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象人物, 対象期間, _parameters):
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

    def formula(対象人物, 対象期間, _parameters):
        特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間)
        同一生計配偶者である = 対象人物("同一生計配偶者である", 対象期間)
        扶養親族である = 対象人物("扶養親族である", 対象期間)

        # TODO: 「同居していない親族」も世帯内で扱うようになったら以下の判定追加（現状フロントエンドでは同居している親族しか扱っていない）
        # 「納税者自身、配偶者、その納税者と生計を一にする親族のいずれかとの同居を常況としている」
        return 特別障害者控除対象 * (同一生計配偶者である | 扶養親族である)


class ひとり親控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "ひとり親控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1171.htm"

    def formula_2020_01_01(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        # 児童扶養手当の対象と異なり、父母の遺棄・DV等は考慮しない
        # (参考：児童扶養手当 https://www.city.hirakata.osaka.jp/0000026828.html)
        親である = 対象人物.has_role(世帯.親)
        子である = 対象人物.has_role(世帯.子)
        対象ひとり親 = (対象人物.世帯.sum(親である) == 1) * (対象人物.世帯.sum(子である) >= 1)
        ひとり親控除額 = parameters(対象期間).所得.ひとり親控除額
        ひとり親控除_所得制限額 = parameters(対象期間).所得.ひとり親控除_所得制限額

        return 親である * ひとり親控除額 * 対象ひとり親 * (所得 < ひとり親控除_所得制限額)


class 寡婦控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "寡婦控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1170.htm"

    def formula_2020_01_01(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        寡婦 = 対象人物("寡婦", 対象期間)
        寡婦控除額 = parameters(対象期間).所得.寡婦控除額
        寡婦控除_所得制限額 = parameters(対象期間).所得.寡婦控除_所得制限額

        return 寡婦控除額 * 寡婦 * (所得 <= 寡婦控除_所得制限額)


class 学生(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "小・中・高校、大学、専門学校、職業訓練学校等の学生"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1175.htm"


class 勤労学生控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "勤労学生控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1175.htm"

    def formula(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        学生である = 対象人物("学生", 対象期間)
        勤労学生控除額 = parameters(対象期間).所得.勤労学生控除額
        勤労学生_所得制限額 = parameters(対象期間).所得.勤労学生_所得制限額
        所得条件 = (所得 > 0) * (所得 <= 勤労学生_所得制限額)

        return 所得条件 * 学生である * 勤労学生控除額


class 同一生計配偶者である(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "同一生計配偶者であるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2022/03/order3/yogo/3-3_y15.htm"

    def formula(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        # 所得が高いほうが控除を受ける対象となる
        所得順位 = 対象人物.get_rank(対象人物.世帯, -所得, condition=対象人物.has_role(世帯.親))
        配偶者である = (所得順位 == 1)  # 親のうち所得順位が低い方が配偶者

        同一生計配偶者_所得制限額 = parameters(対象期間).所得.同一生計配偶者_所得制限額
        return 配偶者である * (所得 <= 同一生計配偶者_所得制限額)


class 配偶者控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "配偶者控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1191.htm"
    documentation = """
    配偶者特別控除とは異なる。
    配偶者の所得が配偶者控除の所得制限を超えた場合でも、配偶者特別控除が適用される可能性がある。
    """

    def formula(対象人物, 対象期間, parameters):
        # 所得が高いほうが控除を受ける対象となる
        所得一覧 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, - 所得一覧, condition=対象人物.has_role(世帯.親))
        控除対象者である = (所得降順 == 0) * 対象人物.has_role(世帯.親)
        控除対象者の配偶者である = (所得降順 == 1) * 対象人物.has_role(世帯.親)
        控除対象者の所得 = 所得一覧 * 控除対象者である
        # NOTE: 異なる人物に対する値であるため、人物ではなく世帯ごとに集計（でないと「控除対象者の所得」と要素がずれてしまい計算できない)
        控除対象者の配偶者の所得 = 対象人物.世帯.sum(所得一覧 * 控除対象者の配偶者である)

        # 複数世帯の前世帯員のうち、自分または配偶者のroleをもつ世帯員がTrueのarray
        所得一覧 = 対象人物("所得", 対象期間)  # (全世帯員数)の長さのarray

        同一生計配偶者_所得制限額 = parameters(対象期間).所得.同一生計配偶者_所得制限額
        控除対象者の配偶者の所得区分 = np.select(
            [控除対象者の配偶者の所得 <= 同一生計配偶者_所得制限額],
            [0],
            -1).astype(int)  # intにできるようデフォルトをNoneではなく-1

        控除対象者の所得区分 = np.select(
            [控除対象者の所得 <= 9000000,
             (控除対象者の所得 > 9000000) * (控除対象者の所得 <= 9500000),
             (控除対象者の所得 > 9500000) * (控除対象者の所得 <= 10000000)],  # 複数世帯のarrayのためand, orの代わりに *. +
            list(range(3)),
            -1).astype(int)  # intにできるようデフォルトをNoneではなく-1

        対象所得区分に該当する = (控除対象者の所得区分 != -1) * (控除対象者の配偶者の所得区分 != -1)  # 控除条件

        # NOTE: その年の12/31時点の年齢を参照
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word5
        該当年12月31日 = period(f"{対象期間.start.year}-12-31")
        該当年12月31日の年齢一覧 = 対象人物("年齢", 該当年12月31日)
        控除対象者の配偶者の年齢 = 該当年12月31日の年齢一覧 * 控除対象者の配偶者である
        # NOTE: 自分ではない人物についての計算のため、世帯で計算（でないと要素がずれてしまい計算できない）
        配偶者が老人控除対象である = 対象人物.世帯.sum(控除対象者の配偶者の年齢 >= 70)
        老人控除対象配偶者控除額 = 老人控除対象配偶者_配偶者控除額表()[控除対象者の配偶者の所得区分, 控除対象者の所得区分]

        通常配偶者控除額 = 配偶者控除額表()[控除対象者の配偶者の所得区分, 控除対象者の所得区分]

        配偶者控除額 = np.logical_not(配偶者が老人控除対象である) * 通常配偶者控除額 + 配偶者が老人控除対象である * 老人控除対象配偶者控除額

        配偶者がいる = 対象人物.世帯.sum(対象人物.has_role(世帯.親)) == 2  # 控除条件

        return 控除対象者である * 配偶者がいる * 対象所得区分に該当する * 配偶者控除額


class 配偶者特別控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "配偶者特別控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1195.htm"

    def formula(対象人物, 対象期間, _parameters):
        # 所得が高いほうが控除を受ける対象となる
        所得一覧 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, - 所得一覧, condition=対象人物.has_role(世帯.親))
        控除対象者である = (所得降順 == 0) * 対象人物.has_role(世帯.親)
        控除対象者の配偶者である = (所得降順 == 1) * 対象人物.has_role(世帯.親)
        控除対象者の所得 = 所得一覧 * 控除対象者である
        # NOTE: 異なる人物に対する値であるため、人物ではなく世帯ごとに集計（でないと「控除対象者の所得」と要素がずれてしまい計算できない)
        控除対象者の配偶者の所得 = 対象人物.世帯.sum(所得一覧 * 控除対象者の配偶者である)

        控除対象者の所得区分 = np.select(
            [控除対象者の所得 <= 9000000,
             (控除対象者の所得 > 9000000) * (控除対象者の所得 <= 9500000),
             (控除対象者の所得 > 9500000) * (控除対象者の所得 <= 10000000)],
            list(range(3)),
            -1).astype(int)

        控除対象者の配偶者の所得区分 = np.select(
            [(控除対象者の配偶者の所得 > 480000) * (控除対象者の配偶者の所得 <= 950000),
             (控除対象者の配偶者の所得 > 950000) * (控除対象者の配偶者の所得 <= 1000000),
             (控除対象者の配偶者の所得 > 1000000) * (控除対象者の配偶者の所得 <= 1050000),
             (控除対象者の配偶者の所得 > 1050000) * (控除対象者の配偶者の所得 <= 1100000),
             (控除対象者の配偶者の所得 > 1100000) * (控除対象者の配偶者の所得 <= 1150000),
             (控除対象者の配偶者の所得 > 1150000) * (控除対象者の配偶者の所得 <= 1200000),
             (控除対象者の配偶者の所得 > 1200000) * (控除対象者の配偶者の所得 <= 1250000),
             (控除対象者の配偶者の所得 > 1250000) * (控除対象者の配偶者の所得 <= 1300000),
             (控除対象者の配偶者の所得 > 1300000) * (控除対象者の配偶者の所得 <= 1330000)],
            list(range(9)),
            -1).astype(int)

        対象所得区分に該当する = (控除対象者の所得区分 != -1) * (控除対象者の配偶者の所得区分 != -1)  # 控除条件

        配偶者がいる = 対象人物.世帯.sum(対象人物.has_role(世帯.親)) == 2  # 控除条件

        return 控除対象者である * 配偶者がいる * 対象所得区分に該当する * 配偶者特別控除額表()[控除対象者の配偶者の所得区分, 控除対象者の所得区分]


class 扶養控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "扶養控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1180.htm"

    def formula(対象人物, 対象期間, parameters):
        扶養親族である = 対象人物("扶養親族である", 対象期間)

        # NOTE: その年の12/31時点の年齢を参照
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word5
        該当年12月31日 = period(f"{対象期間.start.year}-12-31")
        年齢 = 対象人物("年齢", 該当年12月31日)

        控除対象扶養親族である = 扶養親族である * (年齢 >= 16)

        特定扶養親族である = 控除対象扶養親族である * (年齢 >= 19) * (年齢 < 23)
        老人扶養親族である = 控除対象扶養親族である * (年齢 >= 70)

        # NOTE: 入院中の親族は同居扱いだが老人ホーム等への入居は除く
        # TODO: 「同居していない親族」も世帯内で扱うようになったら同居老親かどうかの判定追加
        介護施設入所中 = 対象人物("介護施設入所中", 対象期間)
        同居している老人扶養親族である = 老人扶養親族である * np.logical_not(介護施設入所中)
        同居していない老人扶養親族である = 老人扶養親族である * 介護施設入所中

        # NOTE: np.selectのcondlistは最初に該当した条件で計算される
        扶養控除額 = np.select(
            [特定扶養親族である,
             同居している老人扶養親族である,
             同居していない老人扶養親族である,
             控除対象扶養親族である],
            [parameters(対象期間).所得.扶養控除_特定扶養親族,
             parameters(対象期間).所得.扶養控除_老人扶養親族_同居老親等,
             parameters(対象期間).所得.扶養控除_老人扶養親族_同居老親等以外の者,
             parameters(対象期間).所得.扶養控除_一般],
            0)

        所得 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, -所得)
        # NOTE: 便宜上所得が最も多い世帯員が扶養者であるとする
        扶養者である = 所得降順 == 0

        return 扶養者である * 対象人物.世帯.sum(扶養控除額)


class 扶養親族である(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "扶養親族であるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm"

    def formula(対象人物, 対象期間, parameters):
        扶養親族所得金額 = parameters(対象期間).所得.扶養親族所得金額
        所得 = 対象人物("所得", 対象期間)
        親である = 対象人物.has_role(世帯.親)

        # 扶養親族に配偶者は含まれない。(親等の児童以外を扶養する場合はそれらも含む必要あり)
        # 扶養親族の定義(参考): https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1180.htm
        return np.logical_not(親である) * (所得 <= 扶養親族所得金額)


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

    def formula(対象世帯, 対象期間, _parameters):
        所得 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, -所得)
        # 最も所得が大きい世帯員を対象とすることで、世帯高所得を算出している
        対象者である = 所得降順 == 0

        控除後所得 = 対象世帯.members("控除後所得", 対象期間)
        return 対象世帯.sum(対象者である * 控除後所得)


class 控除後所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "各種控除が適用された後の所得額"
    reference = "https://www.city.himeji.lg.jp/waku2child/0000013409.html"

    def formula(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象人物("障害者控除", 対象期間)
        ひとり親控除 = 対象人物("ひとり親控除", 対象期間)
        寡婦控除 = 対象人物("寡婦控除", 対象期間)
        勤労学生控除 = 対象人物("勤労学生控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する
        総控除額 = 社会保険料 + 給与所得及び雑所得からの控除額 + 障害者控除 + ひとり親控除 + 寡婦控除 + 勤労学生控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(所得 - 総控除額, 0.0, None)


class 児童手当の控除後世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "各種控除が適用された後の児童手当における世帯高所得額"
    reference = "https://www.city.himeji.lg.jp/waku2child/0000013409.html"
    documentation = """
    所得税等の控除額とは異なる。
    https://www.nta.go.jp/publication/pamph/koho/kurashi/html/01_1.htm
    """

    def formula(対象世帯, 対象期間, _parameters):
        所得 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, -所得)
        # 最も所得が大きい世帯員を対象とすることで、世帯高所得を算出している
        対象者である = 所得降順 == 0

        控除後所得 = 対象世帯.members("児童手当の控除後所得", 対象期間)
        return 対象世帯.sum(対象者である * 控除後所得)


class 児童手当の控除後所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "各種控除が適用された後の児童手当における所得額"
    reference = "https://www.city.himeji.lg.jp/waku2child/0000013409.html"
    documentation = """
    所得税等の控除額とは異なる。
    https://www.nta.go.jp/publication/pamph/koho/kurashi/html/01_1.htm
    """

    def formula(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象人物("障害者控除", 対象期間)
        ひとり親控除 = 対象人物("ひとり親控除", 対象期間)
        寡婦控除 = 対象人物("寡婦控除", 対象期間)
        勤労学生控除 = 対象人物("勤労学生控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する

        総控除額 = 社会保険料 + 給与所得及び雑所得からの控除額 + 障害者控除 + ひとり親控除 + 寡婦控除 + 勤労学生控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(所得 - 総控除額, 0.0, None)


class 児童扶養手当の控除後世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "各種控除が適用された後の児童扶養手当の世帯高所得額"
    reference = "https://www.city.otsu.lg.jp/soshiki/015/1406/g/jidofuyoteate/1389538447829.html"

    def formula(対象世帯, 対象期間, _parameters):
        所得 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, -所得)
        # 最も所得が大きい世帯員を対象とすることで、世帯高所得を算出している
        対象者である = 所得降順 == 0

        控除後所得 = 対象世帯.members("児童扶養手当の控除後所得", 対象期間)
        return 対象世帯.sum(対象者である * 控除後所得)


class 児童扶養手当の控除後所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "各種控除が適用された後の児童扶養手当の世帯高所得額"
    reference = "https://www.city.otsu.lg.jp/soshiki/015/1406/g/jidofuyoteate/1389538447829.html"

    def formula(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象人物("障害者控除", 対象期間)
        勤労学生控除 = 対象人物("勤労学生控除", 対象期間)
        配偶者特別控除 = 対象人物("配偶者特別控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する
        # 養育者が児童の父母の場合は寡婦控除・ひとり親控除は加えられない
        総控除額 = 社会保険料 + 給与所得及び雑所得からの控除額 + 障害者控除 + 勤労学生控除 + 配偶者特別控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(所得 - 総控除額, 0.0, None)


class 特別児童扶養手当の控除後世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "各種控除が適用された後の特別児童扶養手当における世帯高所得額"
    reference = "https://www.city.otsu.lg.jp/soshiki/015/1406/g/jidofuyoteate/1389538447829.html"

    def formula(対象世帯, 対象期間, parameters):
        所得 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, -所得)
        # 最も所得が大きい世帯員を対象とすることで、世帯高所得を算出している
        対象者である = 所得降順 == 0

        控除後所得 = 対象世帯.members("特別児童扶養手当の控除後所得", 対象期間)

        return 対象世帯.sum(対象者である * 控除後所得)


class 特別児童扶養手当の控除後所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "各種控除が適用された後の特別児童扶養手当における所得額"
    reference = "https://www.city.otsu.lg.jp/soshiki/015/1406/g/jidofuyoteate/1389538447829.html"

    def formula(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象人物("障害者控除", 対象期間)
        勤労学生控除 = 対象人物("勤労学生控除", 対象期間)
        ひとり親控除 = 対象人物("ひとり親控除", 対象期間)
        寡婦控除 = 対象人物("寡婦控除", 対象期間)
        配偶者特別控除 = 対象人物("配偶者特別控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する
        総控除額 = 社会保険料 + 給与所得及び雑所得からの控除額 + 障害者控除 + 勤労学生控除 + ひとり親控除 + 寡婦控除 + 配偶者特別控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(所得 - 総控除額, 0.0, None)
