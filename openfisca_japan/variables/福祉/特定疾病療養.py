"""
特定疾病療養の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物


class 特定疾病療養の対象者がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "特定疾病療養の対象者がいるか否か"
    reference = "https://www.kyoukaikenpo.or.jp/shibu/shizuoka/cat080/20130225001/"

    def formula(対象世帯, 対象期間, _parameters):
        特定疾病療養の対象者である = 対象世帯.members("特定疾病療養の対象者である", 対象期間)
        return 対象世帯.sum(特定疾病療養の対象者である)


class 特定疾病療養の対象者である(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "特定疾病療養の対象者であるか否か"
    reference = "https://www.kyoukaikenpo.or.jp/shibu/shizuoka/cat080/20130225001/"
    documentation = """
    自己負担限度額を定める制度であり他制度の計算結果と合計できないため、対象者であるかどうかのみ計算

    条件は以下リンクも参考になる。
    https://hyogo-kenchiku-kenpo.or.jp/wp-content/Document/特定疾病療養留意事項.pdf
    """

    def formula(対象人物, 対象期間, _parameters):
        血友病の可能性がある = 対象人物("血友病の可能性がある", 対象期間)
        血友病関連条件 = 血友病の可能性がある

        HIV感染者である = 対象人物("HIV感染者である", 対象期間)
        血液製剤の投与によってHIVに感染した = 対象人物("血液製剤の投与によってHIVに感染した", 対象期間)
        HIV関連条件 = HIV感染者である * 血液製剤の投与によってHIVに感染した

        慢性腎不全である = 対象人物("慢性腎不全である", 対象期間)
        人工透析を行っている = 対象人物("人工透析を行っている", 対象期間)
        腎不全関連条件 = 慢性腎不全である * 人工透析を行っている

        return 血友病関連条件 + HIV関連条件 + 腎不全関連条件
