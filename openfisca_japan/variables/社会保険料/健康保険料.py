"""
健康保険料の実装
"""

import numpy as np
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 健康保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "健康保険料"
    # 協会けんぽの健康保険料率(事業所による健康保険組合の健康保険料率とは異なる)
    reference = "https://www.kyoukaikenpo.or.jp/g7/cat330/"
    documentation = """
    被保険者の健康保険料(月額)
    健康保険用の標準報酬月額と標準賞与額(月平均)に健康保険料率を掛けた金額
    健康保険料率は協会けんぽと各事業所による健康保険組合でそれぞれ異なるため
    一律で10%とする。

    個人事業主が加入する国民健康保険の保険料は市区町村によって異なるため計算しない。

    以下リンクの説明も参考になる。
    https://www.freee.co.jp/kb/kb-payroll/how-to-calculate-social-insurance-premium-deduction-from-salary/
    """

    def formula(対象人物, 対象期間, parameters):
        標準報酬月額_健康保険料 = 対象人物("標準報酬月額_健康保険料", 対象期間)
        標準賞与額_月平均_健康保険料 = 対象人物("標準賞与額_月平均_健康保険料", 対象期間)
        健康保険料率 = parameters(対象期間).社会保険料.健康保険料率
        # 労使折半のため2で割る
        健康保険料 = (標準報酬月額_健康保険料 + 標準賞与額_月平均_健康保険料) * 健康保険料率 / 2
        
        # NOTE: 個人事業主が加入する国民健康保険の保険料は市区町村によって異なるため計算しない
        個人事業主でない = np.logical_not(対象人物("個人事業主である", 対象期間))
        return 個人事業主でない * 健康保険料