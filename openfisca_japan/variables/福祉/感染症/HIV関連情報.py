"""
HIV関連情報の実装
"""


from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class HIV感染者である(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "HIV感染者である"


class 血液製剤の投与によってHIVに感染した(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液凝固因子製剤の投与によってHIVに感染した"


class 家族に血液製剤によるHIV感染者がいる(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "家族に血液凝固因子製剤によるHIV感染者がいる"


class エイズを発症している(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "エイズを発症している"
