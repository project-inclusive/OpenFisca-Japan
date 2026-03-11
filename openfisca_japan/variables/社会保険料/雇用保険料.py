"""
雇用保険料の実装
"""

import numpy as np
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 雇用保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "雇用保険料"
    # 協会けんぽの健康保険料率(事業所による健康保険組合の健康保険料率とは異なる)
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000108634.html"
    documentation = """
    被保険者の雇用保険料(月額)
    「一般の事業」の労働者負担分を計算する。
    個人事業主は加入しない。

    以下リンクの説明も参考になる。
    https://www.freee.co.jp/kb/kb-payroll/how-to-calculate-employment-insurance/
    """

    def formula(対象人物, 対象期間, parameters):
        収入 = 対象人物("収入", 対象期間)
        雇用保険料率 = parameters(対象期間).社会保険料.雇用保険料率
        雇用保険料 = 収入 / 12 * 雇用保険料率 # 標準報酬月額ではない
        
        # NOTE: 個人事業主は加入しない
        個人事業主でない = np.logical_not(対象人物("個人事業主である", 対象期間))
        return 個人事業主でない * 雇用保険料