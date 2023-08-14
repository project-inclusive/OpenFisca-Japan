"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯, 人物


class ベーシックインカム(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "人物のベーシックインカム"
    reference = "https://gov.ユイセキン共和国/ベーシックインカム"

    def formula_2016_12(対象人物, 対象期間, parameters):
        # This '*' is a vectorial 'if'.
        # See https://openfisca.org/doc/coding-the-legislation/25_vectorial_computing.html#control-structures
        return parameters(対象期間).福祉.ベーシックインカム

    def formula_2015_12(対象人物, 対象期間, parameters):
        年齢条件 = 対象人物("年齢", 対象期間) >= parameters(対象期間).全般.成人年齢
        所得条件 = 対象人物("所得", 対象期間) == 0
        return 年齢条件 * 所得条件 * parameters(対象期間).福祉.ベーシックインカム


class 住宅手当(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯の住宅手当"
    # 2016年12月以降は廃止されたのでendは2016年11月30日
    # これ以降はずっと0を返す
    end = "2016-11-30"
    unit = "currency-EUR"
    documentation = """
    住宅手当制度の例。
    1980年に開始され、2016年12月に廃止された想定。
    """

    def formula_1980(対象世帯, 対象期間, parameters):
        return 対象世帯("家賃", 対象期間) * parameters(対象期間).福祉.住宅手当


class 年金(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "人物の受け取る年金"

    def formula(対象人物, 対象期間, parameters):
        年齢条件 = 対象人物("年齢", 対象期間) >= parameters(対象期間).全般.定年年齢
        return 年齢条件
