"""
社会保険料控除の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 社会保険料控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "社会保険料控除"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1130.htm"
    documentation = """
    被保険者の社会保険料控除額(年額)
    対象者・金額が多い、健康保険料・雇用保険料・介護保険料・国民年金保険料・
    厚生年金保険料・国民年金基金掛金・厚生年金基金掛金のみを計算対象とする。

    以下リンクも参考になる
    https://biz.moneyforward.com/tax_return/basic/41316/
    """

    def formula(対象人物, 対象期間, parameters):
        # 以下の保険料は年間額で計算されている
        健康保険料 = 対象人物("健康保険料", 対象期間)
        厚生年金保険料 = 対象人物("厚生年金保険料", 対象期間)
        雇用保険料 = 対象人物("雇用保険料", 対象期間)
        # 健康保険料は年齢によらず一律としており、別途介護保険料を加算
        介護保険料 = 対象人物("介護保険料", 対象期間)

        # 以下は社会保険料には含まれないが、社会保険料控除の対象となる
        国民年金保険料 = 対象人物("国民年金保険料", 対象期間)
        国民年金基金掛金 = 対象人物("国民年金基金掛金", 対象期間)
        厚生年金基金掛金 = 対象人物("厚生年金基金掛金", 対象期間)

        # NOTE: 個人事業主は計算しない
        個人事業主でない = np.logical_not(対象人物("個人事業主である", 対象期間))
        return 個人事業主でない * (健康保険料 + 厚生年金保険料 + 雇用保険料 + 介護保険料 + 国民年金保険料 + 国民年金基金掛金 + 厚生年金基金掛金)
