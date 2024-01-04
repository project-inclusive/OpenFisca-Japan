"""
身体障害者手帳の実装
"""
from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 身体障害者手帳等級パターン(Enum):
    __order__ = "無 一級 二級 三級 四級 五級 六級 七級"
    無 = "無"
    一級 = "一級"
    二級 = "二級"
    三級 = "三級"
    四級 = "四級"
    五級 = "五級"
    六級 = "六級"
    七級 = "七級"


class 身体障害者手帳等級(Variable):
    value_type = Enum
    possible_values = 身体障害者手帳等級パターン
    default_value = 身体障害者手帳等級パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の身体障害者手帳等級"

    # NOTE: 交付年月日・有効期間は考慮しない
