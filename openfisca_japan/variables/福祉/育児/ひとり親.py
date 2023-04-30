"""
ひとり親の実装
"""

from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable

from openfisca_japan.entities import 世帯


class 配偶者がいるがひとり親に該当(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "配偶者がいるがひとり親に該当"


class ひとり親(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "ひとり親に該当するか否か"
    reference = "https://www.city.shibuya.tokyo.jp/kodomo/teate/hitorioya/hitorioya_teate.html"
    documentation = """
    渋谷区の児童扶養手当制度

    - 〒150-8010 東京都渋谷区宇田川町1-1
    - 渋谷区子ども青少年課子育て給付係
    - 03-3463-2558
    """

    def formula(対象世帯, 対象期間, parameters):
        保護者が一人 = 対象世帯.nb_persons(世帯.保護者) == 1

        return 保護者が一人 + 対象世帯("配偶者がいるがひとり親に該当", 対象期間)

