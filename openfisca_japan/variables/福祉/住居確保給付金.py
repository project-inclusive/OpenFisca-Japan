"""
住居確保給付金の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯


class 住居確保給付金の離職等要件を満たす(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "主たる生計維持者が離職・廃業後2年以内、または給与等を得る機会が離職・廃業と同程度まで減少しているか否か"
    reference = "https://corona-support.mhlw.go.jp/jukyokakuhokyufukin/index.html"
    documentation = """
    「個人の責任・都合によらず」給与等を得る機会が減少した場合が対象となるため、
    自己都合による減少は対象外。
    """


class 住居確保給付金の求職活動要件を満たす(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "ハローワークへの求職申込等、誠実かつ熱心な求職活動を行っているか否か"
    reference = "https://corona-support.mhlw.go.jp/jukyokakuhokyufukin/index.html"


class 住居確保給付金の資産要件を満たす(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "住居確保給付金の資産要件を満たすか否か"
    reference = "https://corona-support.mhlw.go.jp/jukyokakuhokyufukin/index.html"
    documentation = """
    本来の資産要件は「世帯の預貯金合計額が基準額（市町村民税の均等割が非課税となる額の1/12）の
    6月分（ただし100万円を超えない額）以下であること」。

    NOTE: 基準額は市区町村ごとに異なり本リポジトリで算出できないため、
    どの市区町村でも共通の上限である100万円のみを判定している。
    実際の上限はこれより低い場合があるため、この要件を満たしても対象外となることがある。
    """

    def formula(対象世帯, 対象期間, parameters):
        資産要件上限額 = parameters(対象期間).福祉.住居確保給付金.資産要件上限額

        預貯金一覧 = 対象世帯.members("預貯金", 対象期間)
        世帯預貯金 = 対象世帯.sum(預貯金一覧)

        return 世帯預貯金 <= 資産要件上限額


class 住居確保給付金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "住居確保給付金"
    reference = "https://corona-support.mhlw.go.jp/jukyokakuhokyufukin/index.html"
    documentation = """
    離職・廃業等により住居を失うおそれのある世帯に対し、家賃相当額を支給する制度。
    支給額は実際の家賃額（市区町村ごとに定める額を上限とする）で、上限額は生活保護制度の住宅扶助額。

    支給期間は原則3か月（延長は2回まで最大9か月間）だが、本 Variable では月額を算出する。

    NOTE: 収入要件（直近の月の世帯収入合計額が基準額と家賃の合計額以下であること）は、
    基準額が市区町村ごとに異なり本リポジトリで算出できないため判定していない。
    """

    def formula(対象世帯, 対象期間, _parameters):
        離職等要件を満たす = 対象世帯("住居確保給付金の離職等要件を満たす", 対象期間)
        資産要件を満たす = 対象世帯("住居確保給付金の資産要件を満たす", 対象期間)
        求職活動要件を満たす = 対象世帯("住居確保給付金の求職活動要件を満たす", 対象期間)

        家賃 = 対象世帯("家賃", 対象期間)
        住宅扶助基準 = 対象世帯("住宅扶助基準", 対象期間)

        # 支給額は実際の家賃額だが、住宅扶助基準額を上限とする
        # NOTE: 家賃に負の値が入力された場合に負の支給額とならないよう、下限を0円とする
        支給額 = np.clip(np.min([家賃, 住宅扶助基準], axis=0), 0, None)  # noqa: TID251

        return 離職等要件を満たす * 資産要件を満たす * 求職活動要件を満たす * 支給額
