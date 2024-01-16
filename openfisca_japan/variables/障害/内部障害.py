"""
内部障害の実装
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 内部障害パターン(Enum):
    __order__ = "無 有"
    無 = "無"
    有 = "有"


class 内部障害(Variable):
    value_type = Enum
    possible_values = 内部障害パターン
    default_value = 内部障害パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の内部障害パターン"
