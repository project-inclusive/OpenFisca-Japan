"""
社会保険料納付条件の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 週労働時間20時間以上(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "週労働時間20時間以上"
    default_value = True
    reference = "https://www.nenkin.go.jp/oshirase/topics/2021/0219.html"
    documentation = """
    週労働時間20時間以上であるか
    """


class 社会保険料納付条件(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "社会保険料納付条件"
    reference = "https://www.nenkin.go.jp/oshirase/topics/2021/0219.html"
    documentation = """
    社会保険料納付条件を満たすか
    フルタイム->週労働時間20時間以上で基本的に月収要件も満たすため加入
    パート->週労働時間20時間以上で月収要件も満たす場合は加入
        週労働時間が20時間未満の場合は月収要件を満たしていても加入しない
    """

    def formula(対象人物, 対象期間, parameters):
        # 扶養者
        年齢 = 対象人物("年齢", 対象期間)
        扶養者収入基準_19歳以上23歳未満 = parameters(対象期間).社会保険料.扶養者収入基準_19歳以上23歳未満
        扶養者収入基準_23歳以上60歳未満 = parameters(対象期間).社会保険料.扶養者収入基準_23歳以上60歳未満
        扶養者収入基準_60歳以上 = parameters(対象期間).社会保険料.扶養者収入基準_60歳以上
        扶養者収入基準 = np.select(
            [(年齢 >= 19) * (年齢 < 23), (年齢 >= 23) * (年齢 < 60), (年齢 >= 60)],  # 条件一覧
            [扶養者収入基準_19歳以上23歳未満, 扶養者収入基準_23歳以上60歳未満, 扶養者収入基準_60歳以上],  # 条件を満たした場合の出力一覧
            0)  # 19歳未満の場合だが、後で条件から除外

        収入 = 対象人物("収入", 対象期間)
        収入順位 = 対象人物.get_rank(対象人物.世帯, -収入)
        # 収入が扶養者収入基準より高い or 世帯内で最も収入が高い
        # 反対(被扶養者)は収入が扶養者収入基準より低い and 世帯内で最も収入が高くない (世帯主でない)
        # 扶養者の収入の半分未満という条件もあるが、ここでは考慮しない
        扶養者である = (収入 > 扶養者収入基準) + (収入順位 == 0)

        月収要件 = (収入 / 12) >= 88000
        週労働時間20時間以上 = 対象人物("週労働時間20時間以上", 対象期間)
        return 扶養者である * 月収要件 * 週労働時間20時間以上 * (年齢 >= 19)
