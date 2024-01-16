"""
預貯金の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物


class 預貯金(Variable):
    value_type = int
    default_value = 0
    entity = 人物
    definition_period = DAY
    label = "預貯金"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"


class 子供の預貯金(Variable):
    value_type = int
    default_value = 0
    entity = 世帯
    definition_period = DAY
    label = "子供の預貯金"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"

    def formula(対象世帯, 対象期間, parameters):
        if 対象世帯.nb_persons(世帯.子) == 0:
            return 0

        子供である = 対象世帯.has_role(世帯.子)
        預貯金一覧 = 対象世帯.members("預貯金", 対象期間)
        return 対象世帯.sum(子供である * 預貯金一覧)
