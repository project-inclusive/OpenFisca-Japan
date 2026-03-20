"""
国民年金掛金の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 国民年金基金掛金(Variable):
    value_type = float
    entity = 人物
    # 国民年金基金掛金の年額
    definition_period = DAY
    label = "国民年金基金掛金"
