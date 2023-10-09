from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物

class 預貯金(Variable):
    value_type = int
    default_value = 0
    entity = 人物
    definition_period = DAY
    label = "預貯金"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"
