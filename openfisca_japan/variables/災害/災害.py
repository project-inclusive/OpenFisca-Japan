"""
災害関連で共通して使用するVariableを定義
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯


class 被災している(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "被災しているかどうか"
