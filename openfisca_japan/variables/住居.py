"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯


# This variable is a pure input: it doesn't have a formula
class 課税床面積(Variable):
    value_type = float
    entity = 世帯
    #definition_period = DAY
    definition_period = MONTH
    label = "世帯の住居の課税床面積"


class 家賃(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯の家賃"


# 居住状況パターンをEnumとして実装
# See more at <https://openfisca.org/doc/coding-the-legislation/20_input_variables.html#advanced-example-enumerations-enum>
class 居住状況パターン(Enum):
    __order__ = "持ち家 借家 free_lodger homeless"
    持ち家 = "持ち家"
    借家 = "借家"
    free_lodger = "Free lodger"
    homeless = "Homeless"


class 居住状況(Variable):
    value_type = Enum
    possible_values = 居住状況パターン
    default_value = 居住状況パターン.借家
    entity = 世帯
    #definition_period = DAY
    definition_period = MONTH
    label = "世帯の居住状況"


class postal_code(Variable):
    value_type = str
    max_length = 5
    entity = 世帯
    #definition_period = DAY
    definition_period = MONTH
    label = "世帯の郵便番号"
