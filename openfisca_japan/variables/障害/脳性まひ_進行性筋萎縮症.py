"""
脳性まひ_進行性筋萎縮症の実装
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 脳性まひ_進行性筋萎縮症パターン(Enum):
    __order__ = "無 有"
    無 = "無"
    有 = "有"


class 脳性まひ_進行性筋萎縮症(Variable):
    value_type = Enum
    possible_values = 脳性まひ_進行性筋萎縮症パターン
    default_value = 脳性まひ_進行性筋萎縮症パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の脳性まひ・進行性筋萎縮症パターン"
