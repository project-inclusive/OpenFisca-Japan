"""
受験生チャレンジ支援貸付の実装
"""

from enum import Enum as OriginalEnum
import math
import numpy as np

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_core.indexed_enums import Enum

class 受験生チャレンジ支援貸付(Variable):
    value_type = int
    default_value = 0
    entity = 世帯
    definition_period = DAY
    label = "受験生チャレンジ支援貸付"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"

    def formula(対象世帯, 対象期間, parameters):
        if not 受給可能である(対象世帯, 対象期間):
            return 0

        子供である = 対象世帯.has_role(世帯.子)
        子供の学年一覧 = 対象世帯.members("学年", 対象期間)[子供である]
        子供が塾に通っているか一覧 = 対象世帯.members("塾に通っている", 対象期間)[子供である]

        対象学年インデックス一覧 = np.where(子供の学年一覧 in [中学生学年.三年生.value, 高校生学年.三年生.value])
        子供の学年一覧 = 子供の学年一覧[対象学年インデックス一覧]
        子供が塾に通っているか一覧 = 子供が塾に通っているか一覧[対象学年インデックス一覧]

        年間支給金額 = 0
        for (i, 子供の学年) in enumerate(子供の学年一覧):
            塾に通っている = 子供が塾に通っているか一覧[i]
            if 塾に通っている:
                年間支給金額 += parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.学習塾等受講料

            if 子供の学年 == 中学生学年.三年生.value:
                年間支給金額 += parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.高校受験料
            elif 子供の学年 == 高校生学年.三年生.value:
                年間支給金額 += parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.大学受験料

        return 月間支給金額へ変換(年間支給金額)

class 塾に通っている(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "塾に通っている"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"

class 中学生学年(OriginalEnum):
    一年生 = 7
    二年生 = 8
    三年生 = 9

class 高校生学年(OriginalEnum):
    一年生 = 10
    二年生 = 11
    三年生 = 12

def 受給可能である(対象世帯, 対象期間):
    居住都道府県 = 対象世帯("居住都道府県", 対象期間)
    if 居住都道府県 != "東京都":
        return False

    預貯金 = np.sum(対象世帯.members("預貯金", 対象期間))
    if 預貯金 > 6000000:
        return False

    ひとり親である = 対象世帯("ひとり親", 対象期間)
    世帯所得 = 対象世帯("世帯所得", 対象期間)
    世帯人数 = 対象世帯("世帯人数", 対象期間)

    受給可能 = False
    if ひとり親である:
        受給可能 = np.select(
            [
                世帯人数 == 2 and 世帯所得 <= 2805000, 
                世帯人数 == 3 and 世帯所得 <= 3532000, 
                世帯人数 == 4 and 世帯所得 <= 4175000, 
                世帯人数 == 5 and 世帯所得 <= 4674000
            ],
            [True, True, True, True],
            False
        )
    else:
        受給可能 = np.select(
            [
                世帯人数 == 3 and 世帯所得 <= 3087000, 
                世帯人数 == 4 and 世帯所得 <= 3599000, 
                世帯人数 == 5 and 世帯所得 <= 4149000, 
                世帯人数 == 6 and 世帯所得 <= 4776000
            ],
            [True, True, True, True],
            False
        )

    return 受給可能

def 月間支給金額へ変換(年間支給金額):
    return math.floor(年間支給金額 / 12)
