"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯


class 福祉給付総額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯の福祉給付総額"
    reference = "https://stats.gov.example/benefits"

    def formula(対象世帯, 対象期間, _parameters):
        """Total benefits."""
        ベーシックインカム_i = 対象世帯.members("ベーシックインカム", 対象期間)  # Calculates the value of ベーシックインカム for each member of the 世帯

        return (
            + 対象世帯.sum(ベーシックインカム_i)  # Sum the 世帯 members ベーシックインカムs
            + 対象世帯("住宅手当", 対象期間)
            )


class 税金総額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯の税金総額"
    reference = "https://stats.gov.example/税金"

    def formula(対象世帯, 対象期間, _parameters):
        """Total 税金."""
        所得税_i = 対象世帯.members("所得税", 対象期間)
        社会保険料_i = 対象世帯.members("社会保険料", 対象期間)

        return (
            + 対象世帯.sum(所得税_i)
            + 対象世帯.sum(社会保険料_i)
            + 対象世帯("固定資産税", 対象期間.this_year) / 12
            )
