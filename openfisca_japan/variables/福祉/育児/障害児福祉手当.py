"""
障害児福祉手当の実装
"""
import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 障害児福祉手当(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "障害児童福祉手当"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/hukushi.html"
    documentation = """
    手帳について要件は無いが、目安となる等級をもとに算出
    https://h-navi.jp/column/article/35029230
    """

    # TODO: 重度心身障害者手当所得制限と同じ控除を適用する
    # https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/jidou.html

    def formula(対象世帯, 対象期間, parameters):
        障害児福祉手当 = parameters(対象期間).福祉.育児.障害児福祉手当

        所得一覧 = 対象世帯.members("所得", 対象期間)
        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        療育手帳等級一覧 = 対象世帯.members("療育手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)
        年齢 = 対象世帯.members("年齢", 対象期間)
        上限年齢未満 = 年齢 < 障害児福祉手当.上限年齢

        対象障害者手帳等級 = \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.一級) + \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.二級) + \
            (療育手帳等級一覧 == 療育手帳等級パターン.A) + \
            (療育手帳等級一覧 == 療育手帳等級パターン.B) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.一度) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.二度)

        対象障害者である = 上限年齢未満 * 対象障害者手帳等級
        # 障害児はほとんど控除が該当しないと考える
        対象障害者の所得 = 対象障害者である * 所得一覧

        受給者の所得制限限度額 = 対象世帯.members("障害児福祉手当_受給者の所得制限限度額", 対象期間)
        受給者の所得条件 = 対象障害者の所得 < 受給者の所得制限限度額

        # 世帯高所得は保護者によるものだと想定する
        世帯高所得 = 対象世帯("控除後世帯高所得", 対象期間)
        扶養義務者の所得制限限度額 = 対象世帯("障害児福祉手当_扶養義務者の所得制限限度額", 対象期間)
        扶養義務者の所得条件 = 世帯高所得 < 扶養義務者の所得制限限度額

        # 障害児福祉手当は対象障害者が受給者のため、世帯では対象障害者の人数分支給される。
        # NOTE: 受給者の所得条件は人物、扶養義務者の所得条件は世帯ごとに計算しているため式中の登場個所が異なる
        手当金額 = 対象世帯.sum(受給者の所得条件 * 対象障害者である * 障害児福祉手当.金額)

        return 扶養義務者の所得条件 * 手当金額


class 障害児福祉手当_受給者の所得制限限度額(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "障害児童福祉手当における、受給者の所得制限限度額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/hukushi.html"

    def formula(対象人物, 対象期間, parameters):
        扶養人数 = 対象人物.世帯("扶養人数", 対象期間)

        # NOTE: 直接 `受給者[扶養人数]` のように要素参照すると型が合わず複数世帯の場合に計算できないためnp.selectを使用
        障害児福祉手当 = parameters(対象期間).福祉.育児.障害児福祉手当
        受給者の所得制限限度額 = np.select(
            [扶養人数 == i for i in range(10)],
            [障害児福祉手当.所得制限限度額.受給者[i] for i in range(10)],
            -1).astype(int)

        return 受給者の所得制限限度額


class 障害児福祉手当_扶養義務者の所得制限限度額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "障害児童福祉手当における、扶養義務者の所得制限限度額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/hukushi.html"
    documentation = """
    便宜上最も所得が多い世帯員を扶養義務者としているため、この値は世帯ごとに計算される
    """

    def formula(対象世帯, 対象期間, parameters):
        扶養人数 = 対象世帯("扶養人数", 対象期間)

        # NOTE: 直接 `受給者[扶養人数]` のように要素参照すると型が合わず複数世帯の場合に計算できないためnp.selectを使用
        障害児福祉手当 = parameters(対象期間).福祉.育児.障害児福祉手当
        扶養義務者の所得制限限度額 = np.select(
            [扶養人数 == i for i in range(10)],
            [障害児福祉手当.所得制限限度額.扶養義務者[i] for i in range(10)],
            -1).astype(int)

        return 扶養義務者の所得制限限度額
