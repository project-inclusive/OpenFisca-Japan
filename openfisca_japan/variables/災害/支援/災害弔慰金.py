"""
災害弔慰金の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯


class 災害弔慰金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "災害弔慰金"
    reference = "https://www.bousai.go.jp/taisaku/choui/pdf/siryo1-1.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.city.hino.lg.jp/kurashi/annzen/hisai/1011473.html
    """

    def formula(対象世帯, 対象期間, parameters):
        災害救助法の適用地域である = 対象世帯("災害救助法の適用地域である", 対象期間)

        災害で死亡した世帯員の人数 = 対象世帯("災害で死亡した世帯員の人数", 対象期間)
        災害で生計維持者が死亡した = 対象世帯("災害で生計維持者が死亡した", 対象期間)

        生計維持者死亡の場合の支給額 = parameters(対象期間).災害.支援.災害弔慰金.生計維持者死亡の場合の支給額
        生計維持者以外死亡の場合の支給額 = parameters(対象期間).災害.支援.災害弔慰金.生計維持者以外死亡の場合の支給額

        支給額 = np.select(
            [災害で生計維持者が死亡した],
            [生計維持者死亡の場合の支給額 + (災害で死亡した世帯員の人数 - 1) * 生計維持者以外死亡の場合の支給額],
            災害で死亡した世帯員の人数 * 生計維持者以外死亡の場合の支給額).astype(int)

        return 災害救助法の適用地域である * 支給額


class 災害で死亡した世帯員の人数(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "災害で死亡した世帯員の人数"
    reference = "https://www.bousai.go.jp/taisaku/choui/pdf/siryo1-1.pdf"
    documentation = """
    死亡した世帯員は世帯情報に含められない（含めると他の制度の対象になってしまう）ため、死亡者に関するVariableを別途用意
    """


class 災害で生計維持者が死亡した(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "災害で生計維持者が死亡したかどうか"
    reference = "https://www.bousai.go.jp/taisaku/choui/pdf/siryo1-1.pdf"
    documentation = """
    死亡した世帯員は世帯情報に含められない（含めると他の制度の対象になってしまう）ため、死亡者に関するVariableを別途用意
    """
