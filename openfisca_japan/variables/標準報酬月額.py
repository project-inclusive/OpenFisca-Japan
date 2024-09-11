"""
標準報酬月額の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 標準報酬月額(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "標準報酬月額"
    reference = "https://www.kyoukaikenpo.or.jp/g3/cat320/sb3160/sbb3165/1962-231/"
    documentation = """
    被保険者が事業主から受ける毎月の報酬

    基本給のほか、役付手当、勤務地手当、家族手当、通勤手当、住宅手当、残業手当等も含まれる
    賞与は年3回以下である場合含まれない。
    また、厳密には毎月の報酬額を一定区分ごとに等級付けするため実際の収入より増減する場合がある。
    """

    def formula(対象人物, 対象期間, parameters):
        収入 = 対象人物("収入", 対象期間)

        # TODO: 賞与を除いて計算する（賞与を別フォームで入力するようになったら対応）
        # 現状では標準報酬月額が高めに算出される

        # 等級ごとに段階的に標準報酬月額が定められているため、金額に上限が存在する
        最大額 = parameters(対象期間).標準報酬月額.標準報酬月額_最大等級

        return np.clip(収入 / 12, None, 最大額)
