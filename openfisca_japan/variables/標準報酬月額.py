"""
標準報酬月額の実装
"""

import numpy as np
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 人物


class 標準報酬月額_健康保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "標準報酬月額_健康保険料"
    reference = "https://www.kyoukaikenpo.or.jp/g3/cat320/sb3160/sbb3165/1962-231/"
    documentation = """
    被保険者が事業主から受ける毎月の報酬

    基本給のほか、役付手当、勤務地手当、家族手当、通勤手当、住宅手当、残業手当等も含まれる
    賞与は年3回以下である場合含まれない。
    また、厳密には毎月の報酬額を一定区分ごとに等級付けするため実際の収入より増減する場合がある。
    (都道府県ごとに設定されている。)
    """

    def formula(対象人物, 対象期間, parameters):
        賞与以外の年収 = 対象人物("賞与以外の年収", 対象期間)

        # 等級ごとに段階的に標準報酬月額が定められているため、金額に上限が存在する
        最大額 = parameters(対象期間).標準報酬月額.標準報酬月額_健康保険料_最大等級
        最小額 = parameters(対象期間).標準報酬月額.標準報酬月額_健康保険料_最小等級

        return np.clip(賞与以外の年収 / 12, 最小額, 最大額)


class 標準報酬月額_厚生年金保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "標準報酬月額_厚生年金保険料"
    reference = "https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20150515-01.html"
    documentation = """
    被保険者が事業主から受ける毎月の報酬

    基本給のほか、役付手当、勤務地手当、家族手当、通勤手当、住宅手当、残業手当等も含まれる
    賞与は年3回以下である場合含まれない。
    また、厳密には毎月の報酬額を一定区分ごとに等級付けするため実際の収入より増減する場合がある。
    (都道府県ごとに設定されている。)
    """

    def formula(対象人物, 対象期間, parameters):
        賞与以外の年収 = 対象人物("賞与以外の年収", 対象期間)

        # 等級ごとに段階的に標準報酬月額が定められているため、金額に上限が存在する
        最大額 = parameters(対象期間).標準報酬月額.標準報酬月額_厚生年金保険料_最大等級
        最小額 = parameters(対象期間).標準報酬月額.標準報酬月額_厚生年金保険料_最小等級

        return np.clip(賞与以外の年収 / 12, 最小額, 最大額)


class 標準賞与額_月平均_健康保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "標準賞与額_月平均_健康保険料"
    reference = "https://www.kyoukaikenpo.or.jp/g3/cat320/sb3160/sbb3165/1962-231/"
    documentation = """
    被保険者が事業主から受ける賞与の月平均額(健康保険料計算用)
    """

    def formula(対象人物, 対象期間, parameters):
        年1回目の賞与 = 対象人物("年1回目の賞与", 対象期間)
        年2回目の賞与 = 対象人物("年2回目の賞与", 対象期間)
        年3回目の賞与 = 対象人物("年3回目の賞与", 対象期間)
        年4回目以降の賞与合計 = 対象人物("年4回目以降の賞与合計", 対象期間)        
        賞与が年3回以下 = 年4回目以降の賞与合計 == 0
        年間賞与 = 賞与が年3回以下 * (年1回目の賞与 + 年2回目の賞与 + 年3回目の賞与)

        最大額 = parameters(対象期間).標準報酬月額.標準賞与額_健康保険料_最大額
        年間賞与最大以下 = np.clip(年間賞与, 0, 最大額)
        return 年間賞与最大以下 / 12


class 標準賞与額_月平均_厚生年金保険料(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "標準賞与額_月平均_厚生年金保険料"
    reference = "https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20150515-01.html"
    documentation = """
    被保険者が事業主から受ける賞与の月平均額(厚生年金保険料計算用)
    """

    def formula(対象人物, 対象期間, parameters):
        # 1回あたりの賞与額の上限
        # NOTE: 同じ月に2回以上支給されたときは正確には合算するが、ここでは1回ごとにに最大額を適用
        最大額 = parameters(対象期間).標準報酬月額.標準賞与額_厚生年金保険料_最大額

        年1回目の賞与 = 対象人物("年1回目の賞与", 対象期間)
        年1回目の賞与最大以下 = np.clip(年1回目の賞与, 0, 最大額)
        年2回目の賞与 = 対象人物("年2回目の賞与", 対象期間)
        年2回目の賞与最大以下 = np.clip(年2回目の賞与, 0, 最大額)
        年3回目の賞与 = 対象人物("年3回目の賞与", 対象期間)
        年3回目の賞与最大以下 = np.clip(年3回目の賞与, 0, 最大額)
        年4回目以降の賞与合計 = 対象人物("年4回目以降の賞与合計", 対象期間)        
        賞与が年3回以下 = 年4回目以降の賞与合計 == 0
        年間賞与最大以下 = 賞与が年3回以下 * (年1回目の賞与最大以下 + 年2回目の賞与最大以下 + 年3回目の賞与最大以下)

        return 年間賞与最大以下 / 12


class 賞与以外の年収(Variable):
    value_type = float
    entity = 人物
    # 賞与以外の年間収入を指す
    # NOTE: 収入自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の賞与以外の年収"

    def formula(対象人物, 対象期間, parameters):
        収入 = 対象人物("収入", 対象期間)
        年1回目の賞与 = 対象人物("年1回目の賞与", 対象期間)
        年2回目の賞与 = 対象人物("年2回目の賞与", 対象期間)
        年3回目の賞与 = 対象人物("年3回目の賞与", 対象期間)
        年4回目以降の賞与合計 = 対象人物("年4回目以降の賞与合計", 対象期間)        
        賞与が年4回以上 = 年4回目以降の賞与合計 > 0
        賞与の合計 = 年1回目の賞与 + 年2回目の賞与 + 年3回目の賞与 + 年4回目以降の賞与合計

        # 1年の間に賞与が4回以上ある場合、収入に賞与の合計を加算し
        # 3回以内である場合、賞与の合計を収入から差し引く
        賞与以外の年収 = 収入 + 賞与が年4回以上 * 賞与の合計 - np.logical_not(賞与が年4回以上) * 賞与の合計

        return 賞与以外の年収


class 年1回目の賞与(Variable):
    value_type = float
    entity = 人物
    # 年1回目の賞与を指す
    # NOTE: 年1回目の賞与は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    label = "人物の年1回目の賞与"


class 年2回目の賞与(Variable):
    value_type = float
    entity = 人物
    # 年2回目の賞与を指す
    # NOTE: 年2回目の賞与は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の年2回目の賞与"


class 年3回目の賞与(Variable):
    value_type = float
    entity = 人物
    # 年3回目の賞与を指す
    # NOTE: 年3回目の賞与は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の年3回目の賞与"


class 年4回目以降の賞与合計(Variable):
    value_type = float
    entity = 人物
    # 年4回目以降の賞与の合計を指す。賞与が年4回以上の場合は標準賞与額ではなく標準報酬月額に含まれる。
    # NOTE: 年4回目以降の賞与は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の年4回目以降の賞与の合計"
