"""
C型肝炎の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class C型肝炎ウイルスに感染している(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "C型肝炎ウイルスに感染している"


class 血液製剤の投与によってC型肝炎ウイルスに感染した(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "血液製剤の投与によってC型肝炎ウイルスに感染した"


# TODO: 必要であれば内容ごとに分割する
class 肝硬変や肝がんに罹患しているまたは肝移植をおこなった(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "肝硬変、肝がんに罹患している、または肝移植をおこなった"
