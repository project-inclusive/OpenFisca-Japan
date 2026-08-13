"""
職業訓練受講給付金の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯


class 職業訓練受講給付金の資産要件を満たす(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "職業訓練受講給付金の資産要件を満たすか否か"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyushokusha_shien/index.html"
    documentation = """
    本来の資産要件は「本人および同居している又は生計を一にする別居の配偶者・子・父母が
    所有する金融資産の合計額が300万円以下であること」。

    NOTE: 金融資産には有価証券等も含まれるが、本リポジトリの入力項目は預貯金のみのため、
    世帯員の預貯金の合計額で判定している。このため、この要件を満たしても対象外となることがある。

    NOTE: 生計を一にする別居の配偶者等は世帯に含まれないため判定に含めていない。
    """

    def formula_2017_04_01(対象世帯, 対象期間, parameters):
        資産要件上限額 = parameters(対象期間).福祉.職業訓練受講給付金.資産要件上限額

        預貯金一覧 = 対象世帯.members("預貯金", 対象期間)
        世帯預貯金 = 対象世帯.sum(預貯金一覧)

        return 世帯預貯金 <= 資産要件上限額


class 職業訓練受講給付金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "職業訓練受講給付金"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyushokusha_shien/index.html"
    documentation = """
    雇用保険を受給できない求職者が、ハローワークの支援指示を受けて無料の職業訓練を
    受講する間の生活を支援する制度（求職者支援制度）。
    ひとり親を対象とする高等職業訓練促進給付金とは別の制度。

    職業訓練受講給付金は職業訓練受講手当・通所手当・寄宿手当からなり、
    本 Variable では1か月あたりの合計額を算出する。
    通所手当は通所経路により決まるため、算出には上限額を用いている。
    寄宿手当は訓練を受けるため同居の配偶者等と別居して寄宿する場合にのみ支給されるため、
    寄宿しない場合の最大額は職業訓練受講手当と通所手当の上限額の合計となる。

    NOTE: 以下は入力項目としていないため、すべて満たす場合の額を最大額として算出している。
    満たさない要件がある場合は支給されないため、最小額は0円（職業訓練受講給付金_最小）となる。

    - 特定求職者であること（ハローワークに求職の申込みをしており、雇用保険の被保険者・
      受給資格者のいずれでもなく、職業訓練その他の支援措置を行う必要があると
      公共職業安定所長が認めた者であること）
    - 本人の収入が月8万円以下であり、かつ本人と配偶者等の収入の合計が月30万円以下であること
      （通所手当のみを受ける場合は、それぞれ月12万円以下・月34万円以下に緩和される）
    - 現に居住している土地・建物以外に土地・建物を所有していないこと
    - 訓練のすべての実施日に受講していること（やむを得ない理由がある場合は8割以上）
    - 配偶者等が同時に職業訓練受講手当の支給を受けた訓練を受講していないこと
    - 過去3年以内に不正行為により失業等給付等を受けていないこと

    NOTE: 収入要件は月額で定められているが、本リポジトリの「収入」は年間収入のため判定に
    用いていない。求職者支援制度が主に対象とする離職直後の人は前年の年間収入と現在の月収が
    大きく異なり、年間収入から判定すると対象者を誤って除外してしまう。
    """

    def formula_2017_04_01(対象世帯, 対象期間, parameters):
        資産要件を満たす = 対象世帯("職業訓練受講給付金の資産要件を満たす", 対象期間)

        職業訓練受講給付金 = parameters(対象期間).福祉.職業訓練受講給付金

        # 寄宿手当は同居の配偶者等と別居して寄宿する場合に支給されるため、単身世帯では支給されない
        配偶者等がいる = 対象世帯.nb_persons() >= 2

        支給額 = (
            職業訓練受講給付金.職業訓練受講手当.月額
            + 職業訓練受講給付金.通所手当.月額上限
            + 配偶者等がいる * 職業訓練受講給付金.寄宿手当.月額)

        return 資産要件を満たす * 支給額


class 職業訓練受講給付金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "職業訓練受講給付金"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyushokusha_shien/index.html"
    documentation = """
    NOTE: 特定求職者であることをはじめとする支給要件は、回答の負荷が高いため入力項目とせず、
    満たさない場合を想定して最小額は0円とする。
    要件の一覧は 職業訓練受講給付金_最大 の documentation に記載している。
    """

    def formula(対象世帯, 対象期間, _parameters):
        return 0
