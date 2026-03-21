"""
国民年金保険料の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 国民年金保険に加入している(Variable):
    value_type = bool
    entity = 人物
    # 国民年金保険に加入しているか否か
    # NOTE: 厚生年金保険加入者とその扶養者は国民年金保険に加入しない
    definition_period = DAY
    label = "国民年金保険に加入している"
    # NOTE: 国民年金加入は義務のためdefault値はTrueとしているが実際の納付率は2021年度は74%
    # https://www.smbc.co.jp/kojin/money-viva/nenkin/0006/
    default_value = True


class 国民年金保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "国民年金保険料"
    reference = "https://www.nenkin.go.jp/service/kokunen/hokenryo/hokenryo.html"
    documentation = """
    国民年金保険加入者の年間の保険料
    """

    def formula(対象人物, 対象期間, parameters):
        国民年金保険に加入している = 対象人物("国民年金保険に加入している", 対象期間)
        # 年間合計
        保険料 = 12 * parameters(対象期間).社会保険料.国民年金保険料
        return 国民年金保険に加入している * 保険料
