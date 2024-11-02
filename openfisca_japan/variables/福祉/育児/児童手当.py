"""
児童手当の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.全般 import 高校生学年


class 児童手当(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "保護者への児童手当"
    reference = "https://www.cfa.go.jp/policies/kokoseido/jidouteate/annai/"
    documentation = """
    児童手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        児童手当 = parameters(対象期間).福祉.育児.児童手当

        年齢 = 対象世帯.members("年齢", 対象期間)
        学年 = 対象世帯.members("学年", 対象期間)

        # 児童手当金額
        二十二歳以下である = 対象世帯.has_role(世帯.子) * (年齢 <= 22)
        高校生以下である = (学年 <= 高校生学年.三年生.value) * (年齢 <= 18)
        # 二十二歳以下でない場合は -1 が入る
        二十二歳以下の出生順 = 対象世帯.get_rank(対象世帯, - 年齢, condition=二十二歳以下である)

        第二子以前である = (二十二歳以下の出生順 >= 0) * (二十二歳以下の出生順 < 2)
        高校生以下かつ第三子以降である = (二十二歳以下の出生順 >= 2) * 高校生以下である

        三歳未満かつ第二子以前である = (年齢 < 3) * 第二子以前である
        三歳以上かつ高校生以下かつ第二子以前である = (年齢 >= 3) * 高校生以下である * 第二子以前である
        児童手当金額 = 対象世帯.sum(高校生以下かつ第三子以降である * 児童手当.金額.高校生以下かつ第三子以降
                          + 三歳未満かつ第二子以前である * 児童手当.金額.三歳未満かつ第二子以前
                          + 三歳以上かつ高校生以下かつ第二子以前である * 児童手当.金額.三歳以上かつ高校生以下かつ第二子以前)

        return 児童手当金額
