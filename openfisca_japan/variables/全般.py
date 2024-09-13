"""
全制度で汎用的に使用するVariableを定義
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 小学生学年(Enum):
    __order__ = "一年生 二年生 三年生 四年生 五年生 六年生"
    一年生 = 1
    二年生 = 2
    三年生 = 3
    四年生 = 4
    五年生 = 5
    六年生 = 6


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


class 就労形態パターン(Enum):
    __order__ = "無 会社員 公務員 自営業 その他"
    無 = "無"
    会社員 = "会社員"
    公務員 = "公務員"
    自営業 = "自営業"
    その他 = "その他"


class 就労形態(Variable):
    value_type = Enum
    possible_values = 就労形態パターン
    default_value = 就労形態パターン.無
    entity = 人物
    definition_period = DAY
    label = "人物の就労形態"
