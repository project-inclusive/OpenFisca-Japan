"""
愛の手帳の実装

（知的障害者を対象とする手帳。東京都など以外では「療育手帳」の名称だが等級が異なる）
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 愛の手帳等級パターン(Enum):
    __order__ = "無 一度 二度 三度 四度"
    無 = "無"
    一度 = "一度"
    二度 = "二度"
    三度 = "三度"
    四度 = "四度"


class 愛の手帳等級(Variable):
    value_type = Enum
    possible_values = 愛の手帳等級パターン
    default_value = 愛の手帳等級パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の愛の手帳の等級"
