from datetime import date

from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable

from openfisca_japan.entities import 人物


class 最終出産年月日(Variable):
    value_type = date
    entity = 人物
    definition_period = DAY # 毎月出産する人はいないはず
    label = "人物の最終出産年月日"


class 健康保険出産付加給付(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    set_input = set_input_divide_by_period
    label = "健康保険出産付加給付"


class ハッピーマザー出産助成金(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    set_input = set_input_divide_by_period
    label = "ハッピーマザー出産助成金"
    documentation = "出産時の経済的負担の軽減を図り、安心して出産ができるよう、出産した人にハッピーマザー出産助成金を支給します。"
    reference = "https://www.city.shibuya.tokyo.jp/kodomo/ninshin/teate/happy_josei.html"

    def formula(対象人物, 対象期間, parameters):
        return parameters(対象期間).福祉.出産.ハッピーマザー出産助成金.金額 - 対象人物("健康保険出産付加給付", 対象期間)