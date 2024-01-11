"""
災害障害見舞金の実装
"""


import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物


class 災害救助法の適用地域である(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "災害救助法の適用地域であるかどうか"
    reference = "https://elaws.e-gov.go.jp/document?lawid=322AC0000000118"
    documentation = """
    自然災害ごとに、市区町村ごとに適用有無が決まる
    災害発生時は適用有無が変化していくので注意
    適用状況 https://www.bousai.go.jp/taisaku/kyuujo/kyuujo_tekiyou.html
    """
    # TODO: 居住市区町村から災害救助法が適用されているかどうかを計算できるようにする


class 災害障害見舞金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "災害障害見舞金の最大額"
    reference = "https://www.bousai.go.jp/taisaku/choui/pdf/siryo1-1.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.city.hino.lg.jp/kurashi/annzen/hisai/1011473.html
    """

    def formula(対象世帯, 対象期間, parameters):
        災害救助法の適用地域である = 対象世帯("災害救助法の適用地域である", 対象期間)

        災害による重い後遺障害がある = 対象世帯.members("災害による重い後遺障害がある", 対象期間)

        生計維持者への支給額 = parameters(対象期間).災害.支援.災害障害見舞金.生計維持者への支給額
        生計維持者以外への支給額 = parameters(対象期間).災害.支援.災害障害見舞金.生計維持者以外への支給額
        生計維持者_世帯所得制限額 = parameters(対象期間).災害.支援.災害障害見舞金.生計維持者_世帯所得制限額

        世帯所得 = 対象世帯("世帯所得", 対象期間)

        # NOTE: 厳密な生計維持者の判定には被災前の各世帯員の所得と比較が必要だが、簡便のため親のいずれかを生計維持者の候補とする
        # 災害弔慰金等、災害援護資金関係 https://www.bousai.go.jp/taisaku/kyuujo/pdf/h30kaigi/siryo3-1.pdf
        親である = 対象世帯.has_role(世帯.親)
        生計維持者候補への支給額 = np.select(
            [対象世帯.any(災害による重い後遺障害がある * 親である) * (世帯所得 <= 生計維持者_世帯所得制限額)],
            [生計維持者への支給額],
            生計維持者以外への支給額)
        
        支給額 = (対象世帯.sum(災害による重い後遺障害がある) - 1) * 生計維持者以外への支給額 + 生計維持者候補への支給額

        return 災害救助法の適用地域である * 支給額


class 災害障害見舞金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "災害障害見舞金の最小額"
    reference = "https://www.bousai.go.jp/taisaku/choui/pdf/siryo1-1.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.city.hino.lg.jp/kurashi/annzen/hisai/1011473.html
    """

    def formula(対象世帯, 対象期間, parameters):
        災害救助法の適用地域である = 対象世帯("災害救助法の適用地域である", 対象期間)

        災害による重い後遺障害がある = 対象世帯.members("災害による重い後遺障害がある", 対象期間)
        生計維持者以外への支給額 = parameters(対象期間).災害.支援.災害障害見舞金.生計維持者以外への支給額

        支給額 = 対象世帯.sum(災害による重い後遺障害がある) * 生計維持者以外への支給額
        return 災害救助法の適用地域である * 支給額


class 災害による重い後遺障害がある(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "災害による重い後遺障害がある"
    reference = "https://www.city.hino.lg.jp/kurashi/annzen/hisai/1011473.html"
