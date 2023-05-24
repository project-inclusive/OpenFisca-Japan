"""
障害児福祉手当の実装
"""
import numpy as np

from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級認定パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン


class 障害児福祉手当(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "障害児童福祉手当"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/hukushi.html"
    documentation = """
    障害児童福祉手当
    """

    def formula(対象世帯, 対象期間, parameters):
        障害児福祉手当 = parameters(対象期間).福祉.育児.障害児福祉手当

        所得一覧 = 対象世帯.members("所得", 対象期間)
        扶養人数 = 対象世帯("扶養人数", 対象期間)[0]

        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        療育手帳等級一覧 = 対象世帯.members("療育手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)
        年齢 = 対象世帯.members("年齢", 対象期間)
        上限年齢未満 = 年齢 < 障害児福祉手当.上限年齢

        対象障害者手帳等級 = \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級認定パターン.一級) + \
                (身体障害者手帳等級一覧 == 身体障害者手帳等級認定パターン.二級) + \
                    (療育手帳等級一覧 == 療育手帳等級パターン.A) + \
                        (療育手帳等級一覧 == 療育手帳等級パターン.B) + \
                            (愛の手帳等級一覧 == 愛の手帳等級パターン.一度) + \
                                (愛の手帳等級一覧 == 愛の手帳等級パターン.二度)

        対象障害者である = 上限年齢未満 * 対象障害者手帳等級
        # 障害児はほとんど控除が該当しないと考える
        対象障害者の所得 = 対象障害者である * 所得一覧
        受給者の所得制限限度額 = 障害児福祉手当.所得制限限度額.受給者[扶養人数]
        受給者の所得条件 = np.all(対象障害者の所得 < 受給者の所得制限限度額)

        保護者の所得 = 対象世帯.members("控除後世帯高所得", 対象期間)
        扶養義務者の所得制限限度額 = 障害児福祉手当.所得制限限度額.扶養義務者[扶養人数]
        扶養義務者の所得条件 = 保護者の所得 < 扶養義務者の所得制限限度額
        
        所得条件 = 受給者の所得条件 * 扶養義務者の所得条件
                                
        # 障害児福祉手当は対象障害者が受給者のため、世帯では対象障害者の人数分支給される。
        手当金額 = 障害児福祉手当.金額 * 対象世帯.sum(対象障害者である)

        return 所得条件 * 手当金額
