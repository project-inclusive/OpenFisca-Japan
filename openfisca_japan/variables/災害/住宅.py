"""
被災者の住宅に関するVariableを定義
"""

from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物


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
    __order__ = "無 建設または購入 補修 賃借"
    無 = "無"
    建設または購入 = "建設または購入"
    補修 = "補修"
    賃借 = "賃借"


class 住宅再建方法(Variable):
    value_type = Enum
    possible_values = 住宅再建方法パターン
    default_value = 住宅再建方法パターン.無
    entity = 世帯
    definition_period = DAY
    label = "被災者の住宅再建方法"


class 家財の損害パターン(Enum):
    # TODO: 他制度でより細かい分類が必要になったら追加
    __order__ = "無 三分の一未満 三分の一以上"
    無 = "無"
    三分の一未満 = "三分の一未満"
    三分の一以上 = "三分の一以上"


class 家財の損害(Variable):
    value_type = Enum
    possible_values = 家財の損害パターン
    default_value = 家財の損害パターン.無
    entity = 世帯
    definition_period = DAY
    label = "被災者の住宅の家財の損害"


class 災害による負傷の療養期間パターン(Enum):
    # TODO: 他制度でより細かい分類が必要になったら追加
    __order__ = "無 一か月未満 一か月以上"
    無 = "無"
    一か月未満 = "一か月未満"
    一か月以上 = "一か月以上"


class 災害による負傷の療養期間(Variable):
    value_type = Enum
    possible_values = 災害による負傷の療養期間パターン
    default_value = 災害による負傷の療養期間パターン.無
    entity = 人物
    definition_period = DAY
    label = "災害により負傷した被災者の療養期間"
