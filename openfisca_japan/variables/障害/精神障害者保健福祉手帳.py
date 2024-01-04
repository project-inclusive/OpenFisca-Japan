"""
精神障害者保健福祉手帳の実装
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 精神障害者保健福祉手帳等級パターン(Enum):
    __order__ = "無 一級 二級 三級"
    無 = "無"
    一級 = "一級"
    二級 = "二級"
    三級 = "三級"


class 精神障害者保健福祉手帳等級(Variable):
    value_type = Enum
    possible_values = 精神障害者保健福祉手帳等級パターン
    default_value = 精神障害者保健福祉手帳等級パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の精神障害者保健福祉手帳の等級"
