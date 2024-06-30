"""
腎不全の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 慢性腎不全である(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "慢性腎不全である"


class 人工透析を行っている(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "人工透析を行っている"
