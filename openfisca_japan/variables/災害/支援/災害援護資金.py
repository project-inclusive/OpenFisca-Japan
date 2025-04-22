"""
災害援護資金の実装
"""

from functools import cache

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan import COUNTRY_DIR
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.災害.住宅 import 住宅被害パターン, 家財の損害パターン, 災害による負傷の療養期間パターン


@cache
def 災害援護資金貸付限度額():
    """
    csvファイルから値を読み込み

    災害援護資金貸付限度額()[災害による負傷の療養期間, 住宅への損害] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/災害/支援/災害援護資金貸付限度額.csv",
                  delimiter=",", skip_header=1, dtype="int64")[:, 1:]


class 災害援護資金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "災害援護資金"
    reference = "https://www.bousai.go.jp/taisaku/hisaisyagyousei/pdf/kakusyuseido_tsuujou.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/shinsai_jouhou/saigaishien.html
    """

    def formula(対象世帯, 対象期間, _parameters):
        災害救助法の適用地域である = 対象世帯("災害救助法の適用地域である", 対象期間)

        家財の損害 = 対象世帯("家財の損害", 対象期間)
        住宅被害 = 対象世帯("住宅被害", 対象期間)

        所得一覧 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, -所得一覧)
        # NOTE: 厳密には世帯主は所得の多寡のみでは決まらないが、便宜上所得が最も多い世帯員を世帯主とする
        世帯主である = 所得降順 == 0

        災害による負傷の療養期間 = 対象世帯.members("災害による負傷の療養期間", 対象期間)

        世帯主が療養一か月以上の負傷をしている = 対象世帯.any((災害による負傷の療養期間 == 災害による負傷の療養期間パターン.一か月以上) * 世帯主である)

        災害による負傷の療養期間区分 = np.select(
            [世帯主が療養一か月以上の負傷をしている],
            [1],
            0).astype(int)

        住宅への損害区分 = np.select(
            [(家財の損害 == 家財の損害パターン.三分の一以上) * (住宅被害 == 住宅被害パターン.無),
             (住宅被害 == 住宅被害パターン.中規模半壊) + (住宅被害 == 住宅被害パターン.大規模半壊),
             (住宅被害 == 住宅被害パターン.全壊),
             # 住宅の解体が必要な場合厳密には半壊だった場合のみ金額が異なるが、解体前の住居の状態を入力上識別できないため一律同額とする
             # https://www.mhlw.go.jp/shinsai_jouhou/dl/shikingaiyou.pdf
             # 災害援護資金の条件に長期避難は記載されていないが、住宅被害パターンから1つのみを選択するため加える
             (住宅被害 == 住宅被害パターン.滅失または流失) + (住宅被害 == 住宅被害パターン.解体) + (住宅被害 == 住宅被害パターン.長期避難)],
            [1, 2, 3, 4],
            0).astype(int)

        災害援護資金_所得制限額 = 対象世帯("災害援護資金_所得制限額", 対象期間)
        所得制限以下である = 対象世帯.sum(所得一覧) <= 災害援護資金_所得制限額

        災害援護資金額 = 災害援護資金貸付限度額()[災害による負傷の療養期間区分, 住宅への損害区分]

        return 災害救助法の適用地域である * 所得制限以下である * 災害援護資金額


class 災害援護資金_所得制限額(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "災害援護資金における所得制限額"
    reference = "https://www.bousai.go.jp/taisaku/hisaisyagyousei/pdf/kakusyuseido_tsuujou.pdf"
    documentation = """
    「住居が滅失した場合」には全壊、全焼、流出も含まれる
    https://www.mhlw.go.jp/bunya/seikatsuhogo/dl/saigaikyujo6h_03.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        世帯人数 = 対象世帯("世帯人数", 対象期間)
        住宅被害 = 対象世帯("住宅被害", 対象期間)

        世帯人数ごとの所得制限額 = np.array(parameters(対象期間).災害.支援.災害援護資金.所得制限額)  # 複数世帯入力(2以上の長さのndarray入力)対応のためndarray化
        所得制限額_一人当たり追加額 = parameters(対象期間).災害.支援.災害援護資金.所得制限額_一人当たり追加額
        所得制限額_住居が滅失した場合 = parameters(対象期間).災害.支援.災害援護資金.所得制限額_住居が滅失した場合

        所得制限額 = np.select(
            [(住宅被害 == 住宅被害パターン.滅失または流失) + (住宅被害 == 住宅被害パターン.全壊),
             世帯人数 <= 4,
             世帯人数 > 4],
            [所得制限額_住居が滅失した場合,
             世帯人数ごとの所得制限額[np.clip(世帯人数, 0, 4)],  # HACK: out of rangeを防ぐためインデックスを4以下に制限（np.selectは条件に合わない式も計算されるため）
             世帯人数ごとの所得制限額[4] + (世帯人数 - 4) * 所得制限額_一人当たり追加額],
            0).astype(int)

        return 所得制限額
