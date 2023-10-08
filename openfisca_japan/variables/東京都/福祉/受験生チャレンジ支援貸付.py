"""
受験生チャレンジ支援貸付の実装
"""

import numpy as np

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.全般 import 中学生学年, 高校生学年

class 受験生チャレンジ支援貸付(Variable):
    value_type = int
    default_value = 0
    entity = 世帯
    definition_period = DAY
    label = "受験生チャレンジ支援貸付"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"

    def formula(対象世帯, 対象期間, parameters):
        子供である = 対象世帯.has_role(世帯.子)
        子供の学年一覧 = 対象世帯.members("学年", 対象期間)[子供である]

        対象学年インデックス一覧 = np.where(np.isin(子供の学年一覧, [中学生学年.三年生.value, 高校生学年.三年生.value]))
        子供の学年一覧 = 子供の学年一覧[対象学年インデックス一覧]

        年間支給金額 = 0
        for 子供の学年 in 子供の学年一覧:
            年間支給金額 += parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.学習塾等受講料

            if 子供の学年 == 中学生学年.三年生.value:
                年間支給金額 += parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.高校受験料
            elif 子供の学年 == 高校生学年.三年生.value:
                年間支給金額 += parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.大学受験料

        受験生チャレンジ支援貸付可能 = 対象世帯("受験生チャレンジ支援貸付可能", 対象期間)
        return 年間支給金額 * 受験生チャレンジ支援貸付可能

class 受験生チャレンジ支援貸付可能(Variable):
    value_type = int
    default_value = 0
    entity = 世帯
    definition_period = DAY
    label = "受験生チャレンジ支援貸付可能"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        if 居住都道府県 != "東京都":
            return 0

        預貯金 = 対象世帯.sum(対象世帯.members("預貯金", 対象期間))
        if 預貯金 > 6000000:
            return 0

        ひとり親である = 対象世帯("ひとり親", 対象期間)
        世帯所得 = 対象世帯("世帯所得", 対象期間)
        世帯人数 = 対象世帯("世帯人数", 対象期間)

        受給可能 = 0
        if ひとり親である:
            受給可能 = np.select(
                [
                    世帯人数 == 2 and 世帯所得 <= 2805000, 
                    世帯人数 == 3 and 世帯所得 <= 3532000, 
                    世帯人数 == 4 and 世帯所得 <= 4175000, 
                    世帯人数 == 5 and 世帯所得 <= 4674000
                ],
                [1, 1, 1, 1],
                0
            )
        else:
            受給可能 = np.select(
                [
                    世帯人数 == 3 and 世帯所得 <= 3087000, 
                    世帯人数 == 4 and 世帯所得 <= 3599000, 
                    世帯人数 == 5 and 世帯所得 <= 4149000, 
                    世帯人数 == 6 and 世帯所得 <= 4776000
                ],
                [1, 1, 1, 1],
                0
            )
        return 受給可能
