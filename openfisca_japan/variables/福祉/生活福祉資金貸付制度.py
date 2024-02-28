"""
生活福祉資金貸付制度の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 障害者手帳を持つ世帯員がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "障害者手帳を持つ世帯員がいる"

    def formula(対象世帯, 対象期間, parameters):
        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級一覧 = 対象世帯.members("精神障害者保健福祉手帳等級", 対象期間)
        療育手帳等級一覧 = 対象世帯.members("療育手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)

        障害者手帳を持つ世帯員 = ((身体障害者手帳等級一覧 != 身体障害者手帳等級パターン.無)
                       + (精神障害者保健福祉手帳等級一覧 != 精神障害者保健福祉手帳等級パターン.無)
                       + (療育手帳等級一覧 != 療育手帳等級パターン.無)
                       + (愛の手帳等級一覧 != 愛の手帳等級パターン.無))

        return 対象世帯.any(障害者手帳を持つ世帯員)


class 六十五歳以上の世帯員がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "六十五歳以上の世帯員がいる"

    def formula(対象世帯, 対象期間, parameters):
        年齢 = 対象世帯.members("年齢", 対象期間)
        return 対象世帯.any(年齢 >= 65)


class 高校1年生以上の子供がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "高校1年生以上の子供がいる"

    def formula(対象世帯, 対象期間, parameters):
        高校1年生以上である = 対象世帯.members("学年", 対象期間) >= 10
        子供である = 対象世帯.has_role(世帯.子)
        return 対象世帯.any(高校1年生以上である * 子供である)


class 中学3年生以上の子供がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "中学3年生以上の子供がいる"

    def formula(対象世帯, 対象期間, parameters):
        中学3年生以上である = 対象世帯.members("学年", 対象期間) >= 9
        子供である = 対象世帯.has_role(世帯.子)
        return 対象世帯.any(中学3年生以上である * 子供である)


class 生活支援費(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活支援費"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    詳細な金額、条件についてはこちらを参照。

    https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/kashitsukejoken.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        障害者手帳を持つ世帯員がいる = 対象世帯("障害者手帳を持つ世帯員がいる", 対象期間)
        六十五歳以上の世帯員がいる = 対象世帯("六十五歳以上の世帯員がいる", 対象期間)

        貸付条件 = 住民税非課税世帯 + 障害者手帳を持つ世帯員がいる + 六十五歳以上の世帯員がいる

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/生活支援費_貸付上限額_単身.yaml を参照している
        生活支援費_貸付上限額_単身 = parameters(対象期間).福祉.生活福祉資金貸付制度.生活支援費_貸付上限額_単身
        生活支援費_貸付上限額_二人以上 = parameters(対象期間).福祉.生活福祉資金貸付制度.生活支援費_貸付上限額_二人以上

        世帯人数 = 対象世帯("世帯人数", 対象期間)

        生活支援費_貸付上限額 = np.select(
            [世帯人数 == 1, 世帯人数 > 1],
            [生活支援費_貸付上限額_単身, 生活支援費_貸付上限額_二人以上],
            0)

        return 貸付条件 * 生活支援費_貸付上限額


class 一時生活再建費(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "一時生活再建費"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    詳細な金額、条件についてはこちらを参照。

    https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/kashitsukejoken.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        障害者手帳を持つ世帯員がいる = 対象世帯("障害者手帳を持つ世帯員がいる", 対象期間)
        六十五歳以上の世帯員がいる = 対象世帯("六十五歳以上の世帯員がいる", 対象期間)

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/一時生活再建費_貸付上限額.yaml を参照している
        貸付条件 = 住民税非課税世帯 + 障害者手帳を持つ世帯員がいる + 六十五歳以上の世帯員がいる
        一時生活再建費_貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.一時生活再建費_貸付上限額

        return 貸付条件 * 一時生活再建費_貸付上限額


class 福祉費(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "福祉費"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"

    def formula(対象世帯, 対象期間, _parameters):
        被災している = 対象世帯("被災している", 対象期間)
        福祉費_災害 = 対象世帯("福祉費_災害", 対象期間)
        福祉費_災害以外 = 対象世帯("福祉費_災害以外", 対象期間)

        # 被災している場合は災害関連の条件を優先して計算
        return np.where(被災している, 福祉費_災害, 福祉費_災害以外)


class 福祉費_災害(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "福祉費（災害を受けたことにより臨時に必要となる経費）"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    福祉費の用途ごとの条件、金額はこちらを参照。
    https://www.mhlw.go.jp/bunya/seikatsuhogo/fukushihi.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        障害者手帳を持つ世帯員がいる = 対象世帯("障害者手帳を持つ世帯員がいる", 対象期間)
        六十五歳以上の世帯員がいる = 対象世帯("六十五歳以上の世帯員がいる", 対象期間)

        # TODO: 災害によって特例措置が適用される場合その条件にも対応
        貸付条件 = 住民税非課税世帯 + 障害者手帳を持つ世帯員がいる + 六十五歳以上の世帯員がいる

        貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.福祉費_災害_貸付上限額
        return 貸付条件 * 貸付上限額


# TODO: 用途ごとに条件と金額を細かく出し分ける
class 福祉費_災害以外(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "福祉費（災害以外の場合）"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    福祉費の用途ごとの条件、金額はこちらを参照。
    https://www.mhlw.go.jp/bunya/seikatsuhogo/fukushihi.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        障害者手帳を持つ世帯員がいる = 対象世帯("障害者手帳を持つ世帯員がいる", 対象期間)
        六十五歳以上の世帯員がいる = 対象世帯("六十五歳以上の世帯員がいる", 対象期間)

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/福祉費_貸付上限額.yaml を参照している
        貸付条件 = 住民税非課税世帯 + 障害者手帳を持つ世帯員がいる + 六十五歳以上の世帯員がいる
        福祉費_貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.福祉費_貸付上限額

        return 貸付条件 * 福祉費_貸付上限額


class 緊急小口資金(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "緊急小口資金"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    詳細な金額、条件についてはこちらを参照。

    https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/kashitsukejoken.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        障害者手帳を持つ世帯員がいる = 対象世帯("障害者手帳を持つ世帯員がいる", 対象期間)
        六十五歳以上の世帯員がいる = 対象世帯("六十五歳以上の世帯員がいる", 対象期間)

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/緊急小口資金_貸付上限額.yaml を参照している
        貸付条件 = 住民税非課税世帯 + 障害者手帳を持つ世帯員がいる + 六十五歳以上の世帯員がいる
        緊急小口資金_貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.緊急小口資金_貸付上限額

        return 貸付条件 * 緊急小口資金_貸付上限額


class 住宅入居費(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住宅入居費"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    詳細な金額、条件についてはこちらを参照。

    https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/kashitsukejoken.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        障害者手帳を持つ世帯員がいる = 対象世帯("障害者手帳を持つ世帯員がいる", 対象期間)
        六十五歳以上の世帯員がいる = 対象世帯("六十五歳以上の世帯員がいる", 対象期間)

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/住宅入居費_貸付上限額.yaml を参照している
        貸付条件 = 住民税非課税世帯 + 障害者手帳を持つ世帯員がいる + 六十五歳以上の世帯員がいる
        住宅入居費_貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.住宅入居費_貸付上限額

        return 貸付条件 * 住宅入居費_貸付上限額


class 教育支援費(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "教育支援費"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    詳細な金額、条件についてはこちらを参照。

    https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/kashitsukejoken.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        高校1年生以上の子供がいる = 対象世帯("高校1年生以上の子供がいる", 対象期間)

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/教育支援費_貸付上限額.yaml を参照している
        貸付条件 = 住民税非課税世帯 * 高校1年生以上の子供がいる
        教育支援費_貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.教育支援費_貸付上限額

        return 貸付条件 * 教育支援費_貸付上限額


class 就学支度費(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "就学支度費"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    詳細な金額、条件についてはこちらを参照。

    https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/kashitsukejoken.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        中学3年生以上の子供がいる = 対象世帯("中学3年生以上の子供がいる", 対象期間)

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/就学支度費_貸付上限額.yaml を参照している
        貸付条件 = 住民税非課税世帯 * 中学3年生以上の子供がいる
        就学支度費_貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.就学支度費_貸付上限額

        return 貸付条件 * 就学支度費_貸付上限額


class 不動産担保型生活資金(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "不動産担保型生活資金"
    reference = "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/index.html"
    documentation = """
    詳細な金額、条件についてはこちらを参照。

    https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatsu-fukushi-shikin1/kashitsukejoken.html
    """

    def formula(対象世帯, 対象期間, parameters):
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)  # openfisca_japan/variables/所得.py の「住民税非課税世帯」を参照している
        六十五歳以上の世帯員がいる = 対象世帯("六十五歳以上の世帯員がいる", 対象期間)

        # openfisca_japan/parameters/福祉/生活福祉資金貸付制度/不動産担保型生活資金_貸付上限額.yaml を参照している
        貸付条件 = 住民税非課税世帯 * 六十五歳以上の世帯員がいる
        不動産担保型生活資金_貸付上限額 = parameters(対象期間).福祉.生活福祉資金貸付制度.不動産担保型生活資金_貸付上限額

        return 貸付条件 * 不動産担保型生活資金_貸付上限額
