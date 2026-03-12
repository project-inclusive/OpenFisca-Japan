"""
厚生年金基金掛金の実装
"""

import numpy as np
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物

class 厚生年金基金掛金(Variable):
    value_type = float
    entity = 人物
    # 厚生年金基金掛金の月額
    definition_period = DAY
    label = "厚生年金基金掛金"
