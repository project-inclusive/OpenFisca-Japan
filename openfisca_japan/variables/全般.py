from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable

from openfisca_japan.entities import 人物


class 中学生学年(Enum):
    __order__ = "一年生 二年生 三年生"
    一年生 = 7
    二年生 = 8
    三年生 = 9

class 高校生学年(Enum):
    __order__ = "一年生 二年生 三年生"
    一年生 = 10
    二年生 = 11
    三年生 = 12


class 性別パターン(Enum):
    __order__ = "女性 男性 その他"
    女性 = "女性"
    男性 = "男性"
    その他 = "その他"


class 性別(Variable):
    value_type = Enum
    possible_values = 性別パターン
    default_value = 性別パターン.その他
    entity = 人物
    definition_period = DAY
    label = "人物の性別"
