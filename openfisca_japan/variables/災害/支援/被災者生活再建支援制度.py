"""
被災者生活再建支援制度の実装
"""


from functools import cache

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan import COUNTRY_DIR
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.災害.住宅 import 住宅再建方法パターン, 住宅被害パターン


@cache
def 基礎支援金額表():
    """
    csvファイルから値を読み込み

    基礎支援金額表()[住宅被害] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/災害/支援/被災者生活再建支援制度_基礎支援金.csv",
                  delimiter=",", skip_header=1, dtype="int64")[1:]


@cache
def 加算支援金額表():
    """
    csvファイルから値を読み込み

    加算支援金額表()[住宅被害, 住宅再建方法] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/災害/支援/被災者生活再建支援制度_加算支援金.csv",
                  delimiter=",", skip_header=1, dtype="int64")[:, 1:]


class 被災者生活再建支援法の適用地域である(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "被災者生活再建支援法の適用地域であるかどうか"
    reference = "https://www.bousai.go.jp/taisaku/seikatsusaiken/pdf/140612gaiyou.pdf"
    documentation = """
    自然災害ごとに、市区町村ごとに適用有無が決まる
    災害発生時は適用有無が変化していくので注意
    """
    # TODO: 居住市区町村から支援法が適用されているかどうかを計算できるようにする


class 被災者生活再建支援制度(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "被災者生活再建支援制度"
    reference = "https://www.bousai.go.jp/taisaku/seikatsusaiken/pdf/140612gaiyou.pdf"
    documentation = """
    対象となる自然災害は都道府県が公示

    算出方法は以下リンクも参考になる。
    https://www.bousai.go.jp/taisaku/hisaisyagyousei/pdf/kakusyuseido_tsuujou.pdf
    """

    def formula(対象世帯, 対象期間, _parameters):
        被災者生活再建支援法の適用地域である = 対象世帯("被災者生活再建支援法の適用地域である", 対象期間)
        基礎支援金 = 対象世帯("被災者生活再建支援制度_基礎支援金", 対象期間)
        加算支援金 = 対象世帯("被災者生活再建支援制度_加算支援金", 対象期間)

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        世帯人数に応じた倍率 = np.select(
            [世帯人数 == 1],
            [0.75],
            1)

        return 被災者生活再建支援法の適用地域である * 世帯人数に応じた倍率 * (基礎支援金 + 加算支援金)


class 被災者生活再建支援制度_基礎支援金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "被災者生活再建支援制度における基礎支援金"
    reference = "https://www.bousai.go.jp/taisaku/seikatsusaiken/pdf/140612gaiyou.pdf"

    def formula(対象世帯, 対象期間, _parameters):
        住宅被害 = 対象世帯("住宅被害", 対象期間)
        支援制度対象である = 住宅被害 != 住宅被害パターン.無

        住宅被害区分 = np.select(
            [住宅被害 == 住宅被害パターン.滅失または流失,
             住宅被害 == 住宅被害パターン.全壊,
             住宅被害 == 住宅被害パターン.解体,
             住宅被害 == 住宅被害パターン.長期避難,
             住宅被害 == 住宅被害パターン.大規模半壊,
             住宅被害 == 住宅被害パターン.中規模半壊],
            list(range(6)),
            -1).astype(int)  # intにできるようデフォルトをNoneではなく-1

        基礎支援金額 = 基礎支援金額表()[住宅被害区分]
        return 支援制度対象である * 基礎支援金額


class 被災者生活再建支援制度_加算支援金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "被災者生活再建支援制度における加算支援金"
    reference = "https://www.bousai.go.jp/taisaku/seikatsusaiken/pdf/140612gaiyou.pdf"

    def formula(対象世帯, 対象期間, _parameters):
        住宅被害 = 対象世帯("住宅被害", 対象期間)
        住宅再建方法 = 対象世帯("住宅再建方法", 対象期間)
        支援制度対象である = (住宅被害 != 住宅被害パターン.無) * (住宅再建方法 != 住宅再建方法パターン.無)

        住宅被害区分 = np.select(
            [住宅被害 == 住宅被害パターン.滅失または流失,
             住宅被害 == 住宅被害パターン.全壊,
             住宅被害 == 住宅被害パターン.解体,
             住宅被害 == 住宅被害パターン.長期避難,
             住宅被害 == 住宅被害パターン.大規模半壊,
             住宅被害 == 住宅被害パターン.中規模半壊],
            list(range(6)),
            -1).astype(int)  # intにできるようデフォルトをNoneではなく-1

        住宅再建方法区分 = np.select(
            [住宅再建方法 == 住宅再建方法パターン.建設または購入,
             住宅再建方法 == 住宅再建方法パターン.補修,
             住宅再建方法 == 住宅再建方法パターン.賃借],
            list(range(3)),
            -1).astype(int)  # intにできるようデフォルトをNoneではなく-1

        加算支援金額 = 加算支援金額表()[住宅被害区分, 住宅再建方法区分]
        return 支援制度対象である * 加算支援金額
