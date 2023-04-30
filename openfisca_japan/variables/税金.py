"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

# Import from numpy the operations you need to apply on OpenFisca's population vectors
# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from numpy import maximum as max_
from openfisca_core.periods import MONTH, YEAR, DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯, 人物


class 所得税(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "人物の所得税"

    def formula(対象人物, 対象期間, parameters):
        return 対象人物("所得", 対象期間) * parameters(対象期間).税金.所得税率


class 住民税(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "渋谷区に住む人物の住民税"
    reference = "https://www.city.shibuya.tokyo.jp/kurashi/zeikin/juminzei/juminzei_fuka.html"

    def formula(対象人物, 対象期間, parameters):
        都民税 = (対象人物("所得", 対象期間) * parameters(対象期間).税金.住民税.都民税.所得割額税率) \
            + parameters(対象期間).税金.住民税.都民税.均等割額
        特別区民税 = (対象人物("所得", 対象期間) * parameters(対象期間).税金.住民税.特別区民税.所得割額税率) \
            + parameters(対象期間).税金.住民税.特別区民税.均等割額
        return 都民税 + 特別区民税


class 社会保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "人物の社会保険料"

    def formula(対象人物, 対象期間, parameters):
        """
        The 社会保険料 is computed according to a marginal scale.
        """
        所得 = 対象人物("所得", 対象期間)
        scale = parameters(対象期間).税金.社会保険料

        return scale.calc(所得)


class 固定資産税(Variable):
    value_type = float
    entity = 世帯
    definition_period = YEAR  # 固定資産税は年ごとに決まる
    label = "世帯の固定資産税"

    def formula(対象世帯, 対象期間, parameters):
        january = 対象期間.first_month
        課税床面積 = 対象世帯("課税床面積", january)

        固定資産税 = parameters(対象期間).税金.固定資産税
        固定資産税額 = max_(課税床面積 * 固定資産税.rate, 固定資産税.minimal_金額)

        # 居住状況はEnum
        居住状況 = 対象世帯("居住状況", january)
        居住状況パターン = 居住状況.possible_values
        借家に居住している = (居住状況 == 居住状況パターン.借家)
        持ち家に居住している = (居住状況 == 居住状況パターン.持ち家)

        return (持ち家に居住している + 借家に居住している) * 固定資産税額
