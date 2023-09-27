"""
高等学校等就学支援金の実装
"""

import numpy as np

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯

class 高等学校等就学支援金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校等就学支援金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1342674.htm"
    documentation = """
    算出方法は以下リンクも参考になる。
    (条件) https://www.mext.go.jp/a_menu/shotou/mushouka/20220329-mxt_kouhou02-3.pdf
    (金額) https://www.mext.go.jp/a_menu/shotou/mushouka/__icsFiles/afieldfile/2020/04/30/100014428_4.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 実際の計算式を実装
        return 0


class 高等学校等就学支援金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校等就学支援金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1342674.htm"
    documentation = """
    算出方法は以下リンクも参考になる。
    (条件) https://www.mext.go.jp/a_menu/shotou/mushouka/20220329-mxt_kouhou02-3.pdf
    (金額) https://www.mext.go.jp/a_menu/shotou/mushouka/__icsFiles/afieldfile/2020/04/30/100014428_4.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 実際の計算式を実装
        return 9900
