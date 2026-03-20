"""
介護保険料の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 介護保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "介護保険料"
    # 協会けんぽの介護保険料率(各事業所の健康保険組合の介護保険料率とは異なる)
    reference = "https://www.kyoukaikenpo.or.jp/g7/cat330/1995-298/"
    documentation = """
    40歳から64歳までの介護保険第2号被保険者の介護保険料
    介護保険用の標準報酬月額と標準賞与額(月平均)に介護保険料率を掛けた金額の年間合計

    NOTE: 65歳以上の第1号被保険者の介護保険料は市区町村ごとに異なるため計算しない。
    個人事業主が加入する介護保険の保険料は市区町村によって異なるため計算しない。

    以下リンクの説明も参考になる。
    https://www.freee.co.jp/kb/kb-payroll/how-to-calculate-social-insurance-premium-deduction-from-salary/
    """

    def formula(対象人物, 対象期間, parameters):
        標準報酬月額_健康保険料 = 対象人物("標準報酬月額_健康保険料", 対象期間)
        標準賞与額_月平均_健康保険料 = 対象人物("標準賞与額_月平均_健康保険料", 対象期間)
        介護保険料率 = parameters(対象期間).社会保険料.介護保険料率
        # 年間合計. 労使折半のため2で割る
        介護保険料 = 12 * (標準報酬月額_健康保険料 + 標準賞与額_月平均_健康保険料) * 介護保険料率 / 2
        年齢 = 対象人物("年齢", 対象期間)
        第2号被保険者 = (年齢 >= 40) * (年齢 <= 64)
        # NOTE: 65歳以上の第1号被保険者の介護保険料は市区町村ごとに異なるため計算しない
        # NOTE: 個人事業主が加入する介護保険の保険料は市区町村によって異なるため計算しない
        個人事業主でない = np.logical_not(対象人物("個人事業主である", 対象期間))
        return 第2号被保険者 * 個人事業主でない * 介護保険料
