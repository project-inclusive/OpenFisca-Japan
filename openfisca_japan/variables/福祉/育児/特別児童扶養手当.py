"""
特別児童扶養手当の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.障害.内部障害 import 内部障害パターン
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 特別児童扶養手当_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "保護者への特別児童扶養手当の最大額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/huyou.html"
    documentation = """
    特別児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        特別児童扶養手当 = parameters(対象期間).福祉.育児.特別児童扶養手当

        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        療育手帳等級一覧 = 対象世帯.members("療育手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)
        精神障害者保健福祉手帳等級一覧 = 対象世帯.members("精神障害者保健福祉手帳等級", 対象期間)
        内部障害一覧 = 対象世帯.members("内部障害", 対象期間)
        年齢 = 対象世帯.members("年齢", 対象期間)
        児童である = 対象世帯.has_role(世帯.子)
        上限年齢未満の児童 = 児童である * (年齢 < 特別児童扶養手当.上限年齢)

        # 精神障害者保健福祉手帳の等級は以下の中標津町のHPを参照
        # https://www.nakashibetsu.jp/kurashi/kosodate_fukushi/shougaisha/teate/tokubetujidou/
        # 内部障害は対象になる場合とならない場合があるため最大額の対象には含める
        対象障害者手帳等級 = \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.一級) + \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.二級) + \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.三級) + \
            (療育手帳等級一覧 == 療育手帳等級パターン.A) + \
            (療育手帳等級一覧 == 療育手帳等級パターン.B) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.一度) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.二度) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.三度) + \
            (精神障害者保健福祉手帳等級一覧 == 精神障害者保健福祉手帳等級パターン.一級) + \
            (精神障害者保健福祉手帳等級一覧 == 精神障害者保健福祉手帳等級パターン.二級) + \
            (内部障害一覧 == 内部障害パターン.有)

        対象児童人数 = 対象世帯.sum(上限年齢未満の児童 & 対象障害者手帳等級)

        手当条件 = 対象世帯("特別児童扶養手当の所得条件", 対象期間)
        手当金額 = 対象児童人数 * 特別児童扶養手当.金額.一級

        # TODO 障がいを事由とする公的年金を受けているときは対象にならない

        return 手当条件 * 手当金額


class 特別児童扶養手当_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "保護者への特別児童扶養手当の最小額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/huyou.html"
    documentation = """
    特別児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        特別児童扶養手当 = parameters(対象期間).福祉.育児.特別児童扶養手当

        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        療育手帳等級一覧 = 対象世帯.members("療育手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)
        精神障害者保健福祉手帳等級一覧 = 対象世帯.members("精神障害者保健福祉手帳等級", 対象期間)
        年齢 = 対象世帯.members("年齢", 対象期間)
        児童である = 対象世帯.has_role(世帯.子)
        上限年齢未満の児童 = 児童である * (年齢 < 特別児童扶養手当.上限年齢)

        # 精神障害者保健福祉手帳の等級は以下の中標津町のHPを参照
        # https://www.nakashibetsu.jp/kurashi/kosodate_fukushi/shougaisha/teate/tokubetujidou/
        # 内部障害は対象になる場合とならない場合があるため最小額の対象には含めない
        対象障害者手帳等級 = \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.一級) + \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.二級) + \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.三級) + \
            (療育手帳等級一覧 == 療育手帳等級パターン.A) + \
            (療育手帳等級一覧 == 療育手帳等級パターン.B) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.一度) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.二度) + \
            (愛の手帳等級一覧 == 愛の手帳等級パターン.三度) + \
            (精神障害者保健福祉手帳等級一覧 == 精神障害者保健福祉手帳等級パターン.一級) + \
            (精神障害者保健福祉手帳等級一覧 == 精神障害者保健福祉手帳等級パターン.二級)

        対象児童人数 = 対象世帯.sum(上限年齢未満の児童 * 対象障害者手帳等級)

        手当条件 = 対象世帯("特別児童扶養手当の所得条件", 対象期間)
        手当金額 = 対象児童人数 * 特別児童扶養手当.金額.二級

        # TODO 障がいを事由とする公的年金を受けているときは対象にならない

        return 手当条件 * 手当金額


class 特別児童扶養手当の所得条件(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "保護者への特別児童扶養手当の所得条件"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/huyou.html"
    documentation = """
    特別児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        特別児童扶養手当 = parameters(対象期間).福祉.育児.特別児童扶養手当

        # 世帯で最も高い所得の人が基準となる
        世帯高所得 = 対象世帯("特別児童扶養手当の控除後世帯高所得", 対象期間)
        扶養人数 = 対象世帯("扶養人数", 対象期間)

        # 所得制限限度額の「扶養義務者」は、父または母か養育者が扶養義務者でない場合
        # 参考：厚労省HP (https://www.mhlw.go.jp/bunya/shougaihoken/jidou/huyou.html)
        # NOTE: 直接 `受給者[扶養人数]` のように要素参照すると型が合わず複数世帯の場合に計算できないためnp.selectを使用
        所得制限限度額 = np.select(
            [扶養人数 == i for i in range(10)],
            [特別児童扶養手当.所得制限限度額.受給者[i] for i in range(10)],
            -1).astype(int)

        # TODO: 所得税控除を世帯員ごとに計算できるようになったら以下のように修正
        # 児童扶養手当 = 対象世帯("児童扶養手当", 対象期間)
        # 所得制限限度額 = np.select(
        #    [児童扶養手当 <= 0, 0 < 児童扶養手当],
        #    [
        #        特別児童扶養手当.所得制限限度額.児童扶養手当受給者[扶養人数],
        #        特別児童扶養手当.所得制限限度額.扶養義務者[扶養人数],
        #    ],
        #    )
        所得条件 = 世帯高所得 < 所得制限限度額

        return 所得条件
