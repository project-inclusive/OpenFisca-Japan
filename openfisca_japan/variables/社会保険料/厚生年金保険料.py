"""
厚生年金保険料の実装
"""

import numpy as np
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物, 世帯


class 厚生年金保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "厚生年金保険料"
    # 厚生年金保険料率
    reference = "https://www.nenkin.go.jp/service/kounen/hokenryo/ryogaku/ryogakuhyo/index.html"
    documentation = """
    被保険者の厚生年金保険料(月額)
    厚生年金保険用の標準報酬月額と標準賞与額(月平均)に厚生年金保険料率を掛けた金額
    以下リンクの説明も参考になる。
    https://www.freee.co.jp/kb/kb-payroll/how-to-calculate-social-insurance-premium-deduction-from-salary/
    """

    def formula(対象人物, 対象期間, parameters):
        標準報酬月額_厚生年金保険料 = 対象人物("標準報酬月額_厚生年金保険料", 対象期間)
        標準賞与額_月平均_厚生年金保険料 = 対象人物("標準賞与額_月平均_厚生年金保険料", 対象期間)
        厚生年金保険料率 = parameters(対象期間).社会保険料.厚生年金保険料率
        # 労使折半のため2で割る
        厚生年金保険料 = (標準報酬月額_厚生年金保険料 + 標準賞与額_月平均_厚生年金保険料) * 厚生年金保険料率 / 2
        
        # 扶養者
        年齢 = 対象人物("年齢", 対象期間)
        扶養者収入基準_19歳以上23歳未満 = parameters(対象期間).社会保険料.扶養者収入基準_19歳以上23歳未満
        扶養者収入基準_23歳以上60歳未満 = parameters(対象期間).社会保険料.扶養者収入基準_23歳以上60歳未満
        扶養者収入基準_60歳以上 = parameters(対象期間).社会保険料.扶養者収入基準_60歳以上
        扶養者収入基準 = np.select(
            [(年齢 >= 19) * (年齢 < 23), (年齢 >= 23) * (年齢 < 60), (年齢 >= 60)], # 条件一覧
            [扶養者収入基準_19歳以上23歳未満, 扶養者収入基準_23歳以上60歳未満, 扶養者収入基準_60歳以上], # 条件を満たした場合の出力一覧
            0) # 19歳未満の場合だが、後で条件から除外

        収入 = 対象人物("収入", 対象期間)
        収入順位 = 対象人物.get_rank(対象人物.世帯, -収入)
        # 収入が扶養者収入基準より高い or 世帯内で最も収入が高い
        # 反対(被扶養者)は収入が扶養者収入基準より低い and 世帯内で最も収入が高くない (世帯主でない)
        扶養者である = (収入 > 扶養者収入基準) + (収入順位 == 0) 

        個人事業主でない = np.logical_not(対象人物("個人事業主である", 対象期間))
        
        # 扶養者かつ、会社員・公務員(個人事業主でない)かつ、19歳以上の場合にのみ厚生年金保険料が発生
        対象条件 = 扶養者である * 個人事業主でない * (年齢 >= 19)
        return 対象条件 * 厚生年金保険料