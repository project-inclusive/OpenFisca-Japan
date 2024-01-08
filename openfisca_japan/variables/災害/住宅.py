"""
被災者の住宅に関するVariableを定義
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯


class 住宅被害パターン(Enum):
    __order__ = "無 中規模半壊 大規模半壊 長期避難 解体 全壊 滅失または流失"
    無 = "無"
    中規模半壊 = "中規模半壊"
    大規模半壊 = "大規模半壊"
    長期避難 = "長期避難"
    解体 = "解体"
    全壊 = "全壊"
    滅失または流失 = "滅失または流失"


class 住宅被害(Variable):
    value_type = Enum
    possible_values = 住宅被害パターン
    default_value = 住宅被害パターン.無
    entity = 世帯
    definition_period = DAY
    label = "被災者の住宅被害"


class 住宅再建方法パターン(Enum):
    __order__ = "未定 建設または購入 補修 賃借"
    未定 = "未定"
    建設または購入 = "建設または購入"
    補修 = "補修"
    賃借 = "賃借"


class 住宅再建方法(Variable):
    value_type = Enum
    possible_values = 住宅再建方法パターン
    default_value = 住宅再建方法パターン.未定
    entity = 世帯
    definition_period = DAY
    label = "被災者の住宅再建方法"
