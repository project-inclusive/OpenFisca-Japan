"""
先天性血液凝固因子障害等治療研究事業の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物


class 先天性血液凝固因子障害等治療研究事業の対象者がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "先天性血液凝固因子障害等治療研究事業の対象者の対象者がいるか否か"
    reference = "https://www.mhlw.go.jp/web/t_doc?dataId=00tb3840&dataType=1&pageNo=1"

    def formula(対象世帯, 対象期間, _parameters):
        先天性血液凝固因子障害等治療研究事業の対象者である = 対象世帯.members("先天性血液凝固因子障害等治療研究事業の対象者である", 対象期間)
        return 対象世帯.sum(先天性血液凝固因子障害等治療研究事業の対象者である)


class 先天性血液凝固因子障害等治療研究事業の対象者である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "先天性血液凝固因子障害等治療研究事業の対象者である"
    reference = "https://www.mhlw.go.jp/web/t_doc?dataId=00tb3840&dataType=1&pageNo=1"
    documentation = """
    医療費負担を軽減する制度であり他制度の計算結果と合計できないため、対象者であるかどうかのみ計算

    条件は以下リンクも参考になる。
    https://www.pref.aichi.jp/soshiki/kenkotaisaku/senketsu.html
    """

    def formula(対象人物, 対象期間, _parameters):
        先天性の血液凝固因子異常症である可能性がある = 対象人物("先天性の血液凝固因子異常症である可能性がある", 対象期間)
        年齢 = 対象人物("年齢", 対象期間)
        血液凝固因子異常症関連条件 = (年齢 >= 20) * 先天性の血液凝固因子異常症である可能性がある

        HIV感染者である = 対象人物("HIV感染者である", 対象期間)
        血液製剤の投与によってHIVに感染した = 対象人物("血液製剤の投与によってHIVに感染した", 対象期間)
        HIV関連条件 = HIV感染者である * 血液製剤の投与によってHIVに感染した

        return 血液凝固因子異常症関連条件 + HIV関連条件
