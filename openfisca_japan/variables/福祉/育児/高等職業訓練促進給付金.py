"""
高等職業訓練促進給付金の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯


class 高等職業訓練促進給付金の対象訓練を受けている(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "養成機関で6月以上のカリキュラムを修業しているか否か"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"


class 高等職業訓練促進給付金の対象訓練を修了した(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "養成機関で6月以上のカリキュラムを修了したか否か"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"


class 高等職業訓練促進給付金の所得条件(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "高等職業訓練促進給付金の所得条件を満たすか否か"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"
    documentation = """
    「児童扶養手当の支給を受けているか、同等の所得水準にある方」が対象のため、
    児童扶養手当の所得条件（全部支給・一部支給のいずれか）を満たすことを条件とする。

    NOTE: 所得水準を超過した場合であっても1年に限り引き続き対象となる特例は、
    超過した時期を入力できないため対象外としている。
    """

    def formula(対象世帯, 対象期間, _parameters):
        全部支給所得条件 = 対象世帯("児童扶養手当の全部支給所得条件", 対象期間)
        一部支給所得条件 = 対象世帯("児童扶養手当の一部支給所得条件", 対象期間)

        return 全部支給所得条件 + 一部支給所得条件


class 高等職業訓練促進給付金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等職業訓練促進給付金の最小額"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"
    documentation = """
    ひとり親が就職に有利な資格の取得を目指して養成機関で修業する期間の生活費を支援する制度。

    訓練を受けている期間の最後の1年間は月額が4万円増額されるが、
    修業期間のどの時点にいるかを入力できないため、加算前の額を最小額とする。

    NOTE: 「仕事または育児と修業の両立が困難であると認められる」要件は、
    自治体の個別判断のため条件に含めていない。
    NOTE: 支給額は令和8年4月1日適用の実施要綱に基づくため、formula の適用開始日を
    2026-04-01 としている（それ以前の期間は0円を返す）。
    """

    def formula(対象世帯, 対象期間, _parameters):
        return 対象世帯("高等職業訓練促進給付金の支給条件", 対象期間) * 対象世帯("高等職業訓練促進給付金の月額", 対象期間)


class 高等職業訓練促進給付金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等職業訓練促進給付金の最大額"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"
    documentation = """
    ひとり親が就職に有利な資格の取得を目指して養成機関で修業する期間の生活費を支援する制度。

    訓練を受けている期間の最後の1年間は月額が4万円増額されるため、
    加算後の額を最大額とする。

    NOTE: 「仕事または育児と修業の両立が困難であると認められる」要件は、
    自治体の個別判断のため条件に含めていない。
    NOTE: 支給額は令和8年4月1日適用の実施要綱に基づくため、formula の適用開始日を
    2026-04-01 としている（それ以前の期間は0円を返す）。
    """

    def formula_2026_04_01(対象世帯, 対象期間, parameters):
        最終年度加算額 = parameters(対象期間).福祉.育児.高等職業訓練促進給付金.最終年度加算額

        支給条件 = 対象世帯("高等職業訓練促進給付金の支給条件", 対象期間)
        月額 = 対象世帯("高等職業訓練促進給付金の月額", 対象期間)

        return 支給条件 * (月額 + 最終年度加算額)


class 高等職業訓練促進給付金の支給条件(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "高等職業訓練促進給付金の支給条件を満たすか否か"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"

    def formula(対象世帯, 対象期間, _parameters):
        ひとり親である = 対象世帯("ひとり親", 対象期間)
        所得条件 = 対象世帯("高等職業訓練促進給付金の所得条件", 対象期間)
        対象訓練を受けている = 対象世帯("高等職業訓練促進給付金の対象訓練を受けている", 対象期間)

        return ひとり親である * 所得条件 * 対象訓練を受けている


class 高等職業訓練促進給付金の月額(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等職業訓練促進給付金の月額（最終年度加算前）"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"

    def formula_2026_04_01(対象世帯, 対象期間, parameters):
        月額 = parameters(対象期間).福祉.育児.高等職業訓練促進給付金.月額

        住民税非課税世帯である = 対象世帯("住民税非課税世帯", 対象期間)

        return np.select(
            [住民税非課税世帯である],
            [月額.住民税非課税世帯],
            月額.住民税課税世帯).astype(int)


class 高等職業訓練修了支援給付金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等職業訓練修了支援給付金"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/syokugyou-kunren"
    documentation = """
    高等職業訓練促進給付金の対象となる訓練を修了した場合に支給される一時金。

    NOTE: 「仕事または育児と修業の両立が困難であると認められる」要件は、
    自治体の個別判断のため条件に含めていない。
    NOTE: 支給額は令和8年4月1日適用の実施要綱に基づくため、formula の適用開始日を
    2026-04-01 としている（それ以前の期間は0円を返す）。
    """

    def formula_2026_04_01(対象世帯, 対象期間, parameters):
        修了支援給付金 = parameters(対象期間).福祉.育児.高等職業訓練促進給付金.修了支援給付金

        ひとり親である = 対象世帯("ひとり親", 対象期間)
        所得条件 = 対象世帯("高等職業訓練促進給付金の所得条件", 対象期間)
        対象訓練を修了した = 対象世帯("高等職業訓練促進給付金の対象訓練を修了した", 対象期間)
        住民税非課税世帯である = 対象世帯("住民税非課税世帯", 対象期間)

        支給額 = np.select(
            [住民税非課税世帯である],
            [修了支援給付金.住民税非課税世帯],
            修了支援給付金.住民税課税世帯).astype(int)

        return ひとり親である * 所得条件 * 対象訓練を修了した * 支給額
