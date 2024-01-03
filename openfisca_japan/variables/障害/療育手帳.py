"""
療育手帳の実装

（知的障害者を対象とする手帳。東京都などでは「愛の手帳」の名称だが等級が異なる）
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 療育手帳等級パターン(Enum):
    __order__ = "無 A B"
    無 = "無"
    A = "A"
    B = "B"


class 療育手帳等級(Variable):
    value_type = Enum
    possible_values = 療育手帳等級パターン
    default_value = 療育手帳等級パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の療育手帳の等級"
