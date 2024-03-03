"""
障害児童育成手当の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.脳性まひ_進行性筋萎縮症 import 脳性まひ_進行性筋萎縮症パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 障害児童育成手当(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "保護者への障害児童育成手当"
    reference = "https://www.city.shibuya.tokyo.jp/kodomo/ninshin/teate/jido_i.html"
    documentation = """
    渋谷区の児童育成（障害）手当

    - 〒150-8010 東京都渋谷区宇田川町1-1
    - 渋谷区子ども青少年課子育て給付係
    - 03-3463-2558
    """

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        居住地条件 = 居住都道府県 == "東京都"

        障害児童育成手当 = parameters(対象期間).福祉.育児.障害児童育成手当

        # 世帯で最も高い所得の人が基準となる。特別児童扶養手当と同等の控除が適用される。
        # （参考）https://www.city.adachi.tokyo.jp/oyako/k-kyoiku/kosodate/hitorioya-ikuse.html
        世帯高所得 = 対象世帯("特別児童扶養手当の控除後世帯高所得", 対象期間)
        扶養人数 = 対象世帯("扶養人数", 対象期間)

        # NOTE: 直接 `所得制限限度額[扶養人数]` のように要素参照すると型が合わず複数世帯の場合に計算できないためnp.selectを使用
        所得制限限度額 = np.select(
            [扶養人数 == i for i in range(6)],
            [障害児童育成手当.所得制限限度額[i] for i in range(6)],
            -1).astype(int)

        所得条件 = 世帯高所得 < 所得制限限度額

        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)
        脳性まひ_進行性筋萎縮症一覧 = 対象世帯.members("脳性まひ_進行性筋萎縮症", 対象期間)
        年齢 = 対象世帯.members("年齢", 対象期間)
        児童である = 対象世帯.has_role(世帯.子)
        上限年齢未満の児童 = 児童である * (年齢 < 障害児童育成手当.上限年齢)

        対象障害者手帳等級 = \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.一級) + \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.二級) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.一度) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.二度) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.三度) + \
            (脳性まひ_進行性筋萎縮症一覧 == 脳性まひ_進行性筋萎縮症パターン.有)

        上限年齢未満の身体障害を持つ児童人数 = 対象世帯.sum(上限年齢未満の児童 & 対象障害者手帳等級)
        手当金額 = 障害児童育成手当.金額 * 上限年齢未満の身体障害を持つ児童人数

        return 居住地条件 * 所得条件 * 手当金額
