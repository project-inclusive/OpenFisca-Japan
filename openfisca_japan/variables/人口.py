"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

# from cProfile import label
# from xmlrpc.client import Boolean
from datetime import date

# Import from numpy the operations you need to apply on OpenFisca"s population vectors
# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
import numpy as np
from numpy import where
from openfisca_core.periods import DAY, ETERNITY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯, 人物


# This variable is a pure input: it doesn"t have a formula
class 誕生年月日(Variable):
    value_type = date
    default_value = date(1970, 1, 1)  # By default, if no value is set for a simulation, we consider the people involved in a simulation to be born on the 1st of Jan 1970.
    entity = 人物
    label = "人物の誕生年月日"
    definition_period = ETERNITY  # This variable cannot change over time.
    reference = "https://en.wiktionary.org/wiki/birthdate"


class 年齢(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "人物の年齢"

    def formula(対象人物, 対象期間, _parameters):
        誕生年月日 = 対象人物("誕生年月日", 対象期間)
        誕生年 = 誕生年月日.astype("datetime64[Y]").astype(int) + 1970
        誕生月 = 誕生年月日.astype("datetime64[M]").astype(int) % 12 + 1
        誕生日 = (誕生年月日 - 誕生年月日.astype("datetime64[M]") + 1).astype(int)

        誕生日を過ぎている = (誕生月 < 対象期間.start.month) + (誕生月 == 対象期間.start.month) * (誕生日 <= 対象期間.start.day)

        年齢 = (対象期間.start.year - 誕生年) - where(誕生日を過ぎている, 0, 1)  # If the birthday is not passed this year, subtract one year

        # NOTE: 誕生日が未来であった場合便宜上0歳として扱う(誤った情報が指定された場合でもOpenFiscaがクラッシュするのを防ぐため)
        return np.clip(年齢, 0, None)


# 小学n年生はn, 中学m年生はm+6, 高校l年生はl+9,
# 小学生未満は0以下の整数, 高校3年生より大きい学年は13以上の整数を返す
class 学年(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "人物の学年"

    def formula(対象人物, 対象期間, _parameters):
        誕生年月日 = 対象人物("誕生年月日", 対象期間)

        誕生年 = 誕生年月日.astype("datetime64[Y]").astype(int) + 1970
        誕生月 = 誕生年月日.astype("datetime64[M]").astype(int) % 12 + 1
        誕生日 = (誕生年月日 - 誕生年月日.astype("datetime64[M]") + 1).astype(int)

        # 早生まれは誕生月日が1/1~4/1
        早生まれ = (誕生月 < 4) + ((誕生月 == 4) * (誕生日 == 1))
        対象期間が四月以降 = 対象期間.start.month >= 4
        繰り上げ年数 = where(早生まれ, 1, 0) + where(対象期間が四月以降, 1, 0)

        return (対象期間.start.year - 誕生年) + 繰り上げ年数 - 7


class 世帯人数(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "世帯人数"

    def formula(対象世帯, 対象期間, parameters):
        # NOTE: OpenFiscaの以下のメソッドで直接計算可能だが、テストのinputで人数を直接指定できるようVariable化
        return 対象世帯.nb_persons()
