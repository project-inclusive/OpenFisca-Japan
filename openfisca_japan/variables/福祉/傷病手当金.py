"""
傷病手当金の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.全般 import 就労形態パターン


class 傷病手当金_最大(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "傷病手当金"
    reference = "https://www.kyoukaikenpo.or.jp/g7/cat710/sb3160/sb3170/sbb31710/1950-271/"
    documentation = """
    休んだ日単位で支給されるため、算出額も一日当たりの金額とする。地方公務員の場合は一月当たりの日数が異なる。
    https://www.chikyosai.or.jp/division/short/scene/works/01.html

    算出方法は以下リンクも参考になる。
    https://www.asahi.com/relife/article/15231364
    """

    def formula(対象世帯, 対象期間, parameters):
        # 傷病手当金は連続3日間の休業のあと4日目から支給される（ただし労災による休業の場合を除く）
        けがによって連続三日以上休業している = 対象世帯.members("けがによって連続三日以上休業している", 対象期間)
        病気によって連続三日以上休業している = 対象世帯.members("病気によって連続三日以上休業している", 対象期間)

        業務によってけがをした = 対象世帯.members("業務によってけがをした", 対象期間)
        業務によって病気になった = 対象世帯.members("業務によって病気になった", 対象期間)

        休業条件 = (けがによって連続三日以上休業している * np.logical_not(業務によってけがをした)) +\
            (病気によって連続三日以上休業している * np.logical_not(業務によって病気になった))

        # 給与の支払いが無い場合対象
        休業中に給与の支払いがない = 対象世帯.members("休業中に給与の支払いがない", 対象期間)
        給与条件 = 休業中に給与の支払いがない

        # 傷病手当金は健康保険の加入者が対象
        # 75歳以上の場合後期高齢者医療制度の対象のため対象外
        # 参考: https://www.freee.co.jp/kb/kb-kaigyou/national_health_insurance/
        年齢 = 対象世帯.members("年齢", 対象期間)
        年齢条件 = 年齢 < 75

        一月当たりの日数_会社員 = parameters(対象期間).福祉.傷病手当金.日数_会社員
        一月当たりの日数_公務員 = parameters(対象期間).福祉.傷病手当金.日数_公務員

        # 自営業の場合国民健康保険に加入しているため対象外
        # 最大額のため、その他の場合も会社員とみなして計算
        就労形態 = 対象世帯.members("就労形態", 対象期間)
        就労形態ごとの倍率 = np.select(
            [就労形態 == 就労形態パターン.会社員,
             就労形態 == 就労形態パターン.公務員,
             就労形態 == 就労形態パターン.その他],
            [1 / 一月当たりの日数_会社員 * (2 / 3),
             1 / 一月当たりの日数_公務員 * (2 / 3),
             1 / 一月当たりの日数_会社員 * (2 / 3)],
            0)

        標準報酬月額 = 対象世帯.members("標準報酬月額", 対象期間)
        傷病手当金日額 = 標準報酬月額 * 就労形態ごとの倍率

        return 対象世帯.sum(休業条件 * 給与条件 * 年齢条件 * 傷病手当金日額)


class 傷病手当金_最小(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "傷病手当金"
    reference = "https://www.kyoukaikenpo.or.jp/g7/cat710/sb3160/sb3170/sbb31710/1950-271/"
    documentation = """
    休んだ日単位で支給されるため、算出額も一日当たりの金額とする。

    算出方法は以下リンクも参考になる。
    https://www.asahi.com/relife/article/15231364
    """

    def formula(対象世帯, 対象期間, _parameters):
        # NOTE: 以下を考慮し、最小額は0円とする
        # 任意継続被保険者である場合、傷病手当金の対象外
        # 労災保険から休業補償給付を受けている場合、傷病手当金の対象外
        # 会社の出産手当金、退職年金等を受け取っている場合、傷病手当金の対象外
        # 賞与は実際の標準報酬月額には含まれない（年2回以下の場合）ため、傷病手当金の最大額が実際よりも高く産出されてしまう
        return 0


class 休業中に給与の支払いがない(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "休業中に給与の支払いがない"
    documentation = """
    フロントエンドのフォームや制度にあわせて、支払いが「ない」方をTrueとする。
    """


class 業務によってけがをした(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "業務によってけがをしたか否か"


class 業務によって病気になった(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "業務によって病気になったか否か"


class 病気によって連続三日以上休業している(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "病気によって連続三日以上休業しているか否か"
    documentation = """
    TODO: 休業日数による判別が増えたら「休業日数」という変数にする
    """


class けがによって連続三日以上休業している(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "けがによって連続三日以上休業しているか否か"
    documentation = """
    TODO: 休業日数による判別が増えたら「休業日数」という変数にする
    """
