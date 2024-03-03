"""
児童扶養手当の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 児童扶養手当_最大(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "保護者への児童扶養手当の最大額"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/fuyou-teate/"
    documentation = """
    児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        児童扶養手当 = parameters(対象期間).福祉.育児.児童扶養手当

        全部支給所得条件 = 対象世帯("児童扶養手当の全部支給所得条件", 対象期間)
        一部支給所得条件 = 対象世帯("児童扶養手当の一部支給所得条件", 対象期間)
        ひとり親世帯である = 対象世帯("ひとり親", 対象期間)
        手当条件 = ひとり親世帯である * (全部支給所得条件 + 一部支給所得条件)

        最大支給額児童1人 = 全部支給所得条件 * 児童扶養手当.金額.全部支給.児童1人 + 一部支給所得条件 * 児童扶養手当.金額.一部支給_最大額.児童1人
        最大支給額児童2人 = 全部支給所得条件 * 児童扶養手当.金額.全部支給.児童2人 + 一部支給所得条件 * 児童扶養手当.金額.一部支給_最大額.児童2人
        最大支給額児童3人目以降 = 全部支給所得条件 * 児童扶養手当.金額.全部支給.児童3人目以降 + 一部支給所得条件 * 児童扶養手当.金額.一部支給_最大額.児童3人目以降

        対象児童人数 = 対象世帯("児童扶養手当の対象児童人数", 対象期間)

        # 児童の人数に応じて手当金額を変える
        # TODO: 一部支給の場合に対応する。(手当額の算出方法不明)
        # TODO: 公的年金額が児童扶養手当額より低い場合はその差額を児童扶養手当として受け取れる
        # 参考：https://www.city.shibuya.tokyo.jp/kodomo/teate/hitorioya/heikyu.html
        手当金額 = \
            ((対象児童人数 == 1) * 最大支給額児童1人) +\
            ((対象児童人数 == 2) * (最大支給額児童1人 + 最大支給額児童2人)) +\
            ((対象児童人数 > 2) * (最大支給額児童1人 + 最大支給額児童2人 + (最大支給額児童3人目以降 * (対象児童人数 - 2))))

        return 手当条件 * 手当金額


class 児童扶養手当_最小(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "保護者への児童扶養手当の最小額"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/fuyou-teate/"
    documentation = """
    児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        児童扶養手当 = parameters(対象期間).福祉.育児.児童扶養手当

        全部支給所得条件 = 対象世帯("児童扶養手当の全部支給所得条件", 対象期間)
        一部支給所得条件 = 対象世帯("児童扶養手当の一部支給所得条件", 対象期間)
        ひとり親世帯である = 対象世帯("ひとり親", 対象期間)
        手当条件 = ひとり親世帯である * (全部支給所得条件 + 一部支給所得条件)

        最小支給額児童1人 = 全部支給所得条件 * 児童扶養手当.金額.全部支給.児童1人 + 一部支給所得条件 * 児童扶養手当.金額.一部支給_最小額.児童1人
        最小支給額児童2人 = 全部支給所得条件 * 児童扶養手当.金額.全部支給.児童2人 + 一部支給所得条件 * 児童扶養手当.金額.一部支給_最小額.児童2人
        最小支給額児童3人目以降 = 全部支給所得条件 * 児童扶養手当.金額.全部支給.児童3人目以降 + 一部支給所得条件 * 児童扶養手当.金額.一部支給_最小額.児童3人目以降

        対象児童人数 = 対象世帯("児童扶養手当の対象児童人数", 対象期間)

        # 児童の人数に応じて手当金額を変える
        # TODO: 一部支給の場合に対応する。(手当額の算出方法不明)
        # TODO: 公的年金額が児童扶養手当額より低い場合はその差額を児童扶養手当として受け取れる
        # 参考：https://www.city.shibuya.tokyo.jp/kodomo/teate/hitorioya/heikyu.html
        手当金額 = \
            ((対象児童人数 == 1) * 最小支給額児童1人) +\
            ((対象児童人数 == 2) * (最小支給額児童1人 + 最小支給額児童2人)) +\
            ((対象児童人数 > 2) * (最小支給額児童1人 + 最小支給額児童2人 + (最小支給額児童3人目以降 * (対象児童人数 - 2))))

        return 手当条件 * 手当金額


class 児童扶養手当の全部支給所得条件(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "保護者への児童扶養手当の全額支給所得条件"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/fuyou-teate/"
    documentation = """
    児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        児童扶養手当 = parameters(対象期間).福祉.育児.児童扶養手当

        # 世帯で最も高い所得の人が基準となる
        世帯高所得 = 対象世帯("児童扶養手当の控除後世帯高所得", 対象期間)

        扶養人数 = 対象世帯("扶養人数", 対象期間)

        # 所得が全部支給所得制限限度額よりも高かったら一部支給になる
        # NOTE: 直接 `全部支給[扶養人数]` のように要素参照すると型が合わず複数世帯の場合に計算できないためnp.selectを使用
        全部支給所得制限限度額 = np.select(
            [扶養人数 == i for i in range(10)],
            [児童扶養手当.所得制限限度額.全部支給[i] for i in range(10)],
            -1).astype(int)

        全部支給所得条件 = 世帯高所得 < 全部支給所得制限限度額

        return 全部支給所得条件


class 児童扶養手当の一部支給所得条件(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "保護者への児童扶養手当の一部支給所得条件"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/fuyou-teate/"
    documentation = """
    児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        児童扶養手当 = parameters(対象期間).福祉.育児.児童扶養手当

        # 世帯で最も高い所得の人が基準となる
        世帯高所得 = 対象世帯("児童扶養手当の控除後世帯高所得", 対象期間)

        扶養人数 = 対象世帯("扶養人数", 対象期間)

        # NOTE: 直接 `全部支給[扶養人数]` のように要素参照すると型が合わず複数世帯の場合に計算できないためnp.selectを使用
        全部支給所得制限限度額 = np.select(
            [扶養人数 == i for i in range(10)],
            [児童扶養手当.所得制限限度額.全部支給[i] for i in range(10)],
            -1).astype(int)

        一部支給所得制限限度額 = np.select(
            [扶養人数 == i for i in range(10)],
            [児童扶養手当.所得制限限度額.一部支給[i] for i in range(10)],
            -1).astype(int)

        # 所得が全部支給所得制限限度額よりも高かったら一部支給になる
        # 所得が一部支給所得制限限度額よりも高かったら支給なしになる
        一部支給所得条件 = (世帯高所得 >= 全部支給所得制限限度額) * (世帯高所得 < 一部支給所得制限限度額)

        return 一部支給所得条件


class 児童扶養手当の対象児童人数(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "保護者への児童扶養手当の対象児童人数"
    reference = "https://www.cfa.go.jp/policies/hitori-oya/fuyou-teate/"
    documentation = """
    児童扶養手当制度
    """

    def formula(対象世帯, 対象期間, parameters):
        児童扶養手当 = parameters(対象期間).福祉.育児.児童扶養手当

        学年 = 対象世帯.members("学年", 対象期間)
        上限学年以下児童 = 学年 <= 児童扶養手当.上限学年

        # 特別児童扶養手当2級と同じ程度以上の障害を持つ児童は20歳未満まで対象
        # 参考：https://www.city.nagato.yamaguchi.jp/site/nagato-kosodatenavi/43285.html
        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        療育手帳等級一覧 = 対象世帯.members("療育手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)
        精神障害者保健福祉手帳等級一覧 = 対象世帯.members("精神障害者保健福祉手帳等級", 対象期間)

        # 精神障害者保健福祉手帳の等級は以下の中標津町のHPを参照
        # https://www.nakashibetsu.jp/kurashi/kosodate_fukushi/shougaisha/teate/tokubetujidou/
        # 内部障害は対象になるか不明のため含めない
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

        年齢 = 対象世帯.members("年齢", 対象期間)
        上限年齢未満障害児童 = 対象障害者手帳等級 * (年齢 < 児童扶養手当.障害児の上限年齢)
        対象児童人数 = 対象世帯.sum(上限学年以下児童 + 上限年齢未満障害児童)

        return 対象児童人数
