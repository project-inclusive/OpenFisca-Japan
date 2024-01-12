"""
災害障害見舞金の実装
"""


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

        所得一覧 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, -所得一覧)

        # NOTE: 厳密な生計維持者の判定には被災前の各世帯員の所得と比較が必要だが、簡便のため所得が最も多い世帯員を生計維持者の候補とする
        # （災害関連の計算で入力される「収入」は「被災前の収入」を指すため、被災による収入変化は影響しない）
        # また、世帯所得制限額についても柔軟な対応が取られているため計算式には入れない
        # 災害弔慰金等、災害援護資金関係 https://www.bousai.go.jp/taisaku/kyuujo/pdf/h30kaigi/siryo3-1.pdf
        生計維持者である = 所得降順 == 0
        生計維持者以外 = 所得降順 != 0
        対象生計維持者人数 = 対象世帯.sum(災害による重い後遺障害がある * 生計維持者である)
        対象生計維持者以外人数 = 対象世帯.sum(災害による重い後遺障害がある * 生計維持者以外)
        支給額 = 対象生計維持者人数 * 生計維持者への支給額 + 対象生計維持者以外人数 * 生計維持者以外への支給額

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
