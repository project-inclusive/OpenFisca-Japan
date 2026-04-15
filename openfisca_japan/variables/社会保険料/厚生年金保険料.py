"""
厚生年金保険料の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 厚生年金保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "厚生年金保険料"
    # 厚生年金保険料率
    reference = "https://www.nenkin.go.jp/service/kounen/hokenryo/ryogaku/ryogakuhyo/index.html"
    documentation = """
    被保険者の厚生年金保険料(年額)
    厚生年金保険用の標準報酬月額と標準賞与額(月平均)に厚生年金保険料率を掛けた金額
    以下リンクの説明も参考になる。
    https://www.freee.co.jp/kb/kb-payroll/how-to-calculate-social-insurance-premium-deduction-from-salary/
    """

    def formula(対象人物, 対象期間, parameters):
        標準報酬月額_厚生年金保険料 = 対象人物("標準報酬月額_厚生年金保険料", 対象期間)
        標準賞与額_月平均_厚生年金保険料 = 対象人物("標準賞与額_月平均_厚生年金保険料", 対象期間)
        厚生年金保険料率 = parameters(対象期間).社会保険料.厚生年金保険料率
        # 年間合計. 労使折半のため2で割る
        厚生年金保険料 = 12 * (標準報酬月額_厚生年金保険料 + 標準賞与額_月平均_厚生年金保険料) * 厚生年金保険料率 / 2

        社会保険料納付条件 = 対象人物("社会保険料納付条件", 対象期間)

        個人事業主でない = np.logical_not(対象人物("個人事業主である", 対象期間))

        対象条件 = 個人事業主でない * 社会保険料納付条件
        return 対象条件 * 厚生年金保険料
