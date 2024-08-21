"""
健康管理支援事業の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物


class 健康管理支援事業_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "健康管理支援事業の最大額"
    reference = "https://www.pmda.go.jp/relief-services/hiv-positives/0002.html"
    documentation = """
    """

    def formula(対象世帯, 対象期間, parameters):
        対象者である = 対象世帯.members("健康管理支援事業の対象である", 対象期間)
        支給額 = parameters(対象期間).福祉.感染症.健康管理支援事業.支給額
        return 対象世帯.sum(対象者である) * 支給額


class 健康管理支援事業_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "健康管理支援事業の最小額"
    reference = "https://www.pmda.go.jp/relief-services/hiv-positives/0002.html"
    documentation = """
    """

    def formula(_対象世帯, _対象期間, _parameters):
        # NOTE: 支給には裁判上の和解が成立している必要があるが、この情報はフォームから得られないため一律最小額0円とする
        return 0


class 健康管理支援事業の対象である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "健康管理支援事業の対象であるか否か"
    reference = "https://www.pmda.go.jp/relief-services/hiv-positives/0002.html"
    documentation = """
    """

    def formula(対象人物, 対象期間, _parameters):
        HIV感染者である = 対象人物("HIV感染者である", 対象期間)
        血液製剤の投与によってHIVに感染した = 対象人物("血液製剤の投与によってHIVに感染した", 対象期間)
        家族に血液製剤によるHIV感染者がいる = 対象人物("家族に血液製剤によるHIV感染者がいる", 対象期間)
        エイズを発症している = 対象人物("エイズを発症している", 対象期間)
        対象者である = HIV感染者である * (血液製剤の投与によってHIVに感染した + 家族に血液製剤によるHIV感染者がいる) \
            * エイズを発症している
        return 対象者である
