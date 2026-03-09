"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

import numpy as np
# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯, 人物


class 所得(Variable):
    # NOTE: 手当によって障害者控除や寡婦控除等の額を差し引く必要があるが、世帯情報が必要なため未実装
    value_type = float
    entity = 人物
    # NOTE: 所得自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare a 所得 for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の所得"

    def formula(対象人物, 対象期間, _parameters):
        # NOTE: 収入660万円未満の場合給与所得控除額ではなく「所得税法別表第五」から算出するため、実際の所得と最大1000円程度誤差が発生する
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
        収入 = 対象人物("収入", 対象期間)
        給与所得控除額 = 対象人物("給与所得控除額", 対象期間)
        個人事業主である = 対象人物("個人事業主である", 対象期間)
        個人事業主の必要経費 = 対象人物("個人事業主の必要経費", 対象期間)
        控除額 = 個人事業主である * 個人事業主の必要経費 + \
            np.logical_not(個人事業主である) * 給与所得控除額

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(収入 - 控除額, 0.0, None)


class 収入(Variable):
    value_type = float
    entity = 人物
    # 年間収入を指す
    # NOTE: 収入自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の収入"


class 個人事業主の必要経費(Variable):
    value_type = float
    entity = 人物
    # 年間必要経費を指す。多岐に渡るがまとめた金額をユーザーに入力してもらう
    # NOTE: 必要経費自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "個人事業主の必要経費"
    reference = "https://biz.moneyforward.com/tax_return/basic/12079/"


class 個人事業主である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "個人事業主であるか否か"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"
    # NOTE: 個人事業主であるか否かは個人事業主の必要経費が0円未満か否かで判断する

    def formula(対象人物, 対象期間, _parameters):
        個人事業主の必要経費 = 対象人物("個人事業主の必要経費", 対象期間)
        個人事業主である = 個人事業主の必要経費 > 0
        return 個人事業主である


class 世帯所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯全員の収入の合計"

    def formula(対象世帯, 対象期間, _parameters):
        各収入 = 対象世帯.members("所得", 対象期間)
        return 対象世帯.sum(各収入)


class 世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯で最も所得が高い人物の所得"

    def formula(対象世帯, 対象期間, _parameters):
        所得一覧 = 対象世帯.members("所得", 対象期間)
        return 対象世帯.max(所得一覧)
