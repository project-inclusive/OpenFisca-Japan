"""
受験生チャレンジ支援貸付の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
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
        学年 = 対象世帯.members("学年", 対象期間)

        中学三年生である = 学年 == 中学生学年.三年生.value
        高校三年生である = 学年 == 高校生学年.三年生.value

        学習塾等受講料 = 対象世帯.sum(子供である * (中学三年生である + 高校三年生である)) * parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.学習塾等受講料
        高校受験料 = 対象世帯.sum(子供である * 中学三年生である) * parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.高校受験料
        大学受験料 = 対象世帯.sum(子供である * 高校三年生である) * parameters(対象期間).東京都.福祉.受験生チャレンジ支援貸付.大学受験料

        年間支給金額 = 学習塾等受講料 + 高校受験料 + 大学受験料

        受験生チャレンジ支援貸付可能 = 対象世帯("受験生チャレンジ支援貸付可能", 対象期間)
        return 年間支給金額 * 受験生チャレンジ支援貸付可能


class 受験生チャレンジ支援貸付可能(Variable):
    value_type = int
    default_value = 0
    entity = 世帯
    definition_period = DAY
    label = "受験生チャレンジ支援貸付可能"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/seikatsu/teisyotokusyataisaku/jukenseichallenge.html"

    def formula(対象世帯, 対象期間, _parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        居住地条件 = 居住都道府県 == "東京都"

        預貯金一覧 = 対象世帯.members("預貯金", 対象期間)
        親または子である = 対象世帯.has_role(世帯.親) + 対象世帯.has_role(世帯.子)
        親子の預貯金総額 = 対象世帯.sum(預貯金一覧 * 親または子である)
        預貯金条件 = 親子の預貯金総額 <= 6000000

        ひとり親である = 対象世帯("ひとり親", 対象期間)
        世帯所得 = 対象世帯("世帯所得", 対象期間)
        世帯人数 = 対象世帯("世帯人数", 対象期間)

        ひとり親の場合の所得条件 =\
            ((世帯人数 == 2) * (世帯所得 <= 2805000)) +\
            ((世帯人数 == 3) * (世帯所得 <= 3532000)) +\
            ((世帯人数 == 4) * (世帯所得 <= 4175000)) +\
            ((世帯人数 == 5) * (世帯所得 <= 4674000))
        ひとり親でない場合の所得条件 =\
            ((世帯人数 == 3) * (世帯所得 <= 3087000)) +\
            ((世帯人数 == 4) * (世帯所得 <= 3599000)) +\
            ((世帯人数 == 5) * (世帯所得 <= 4149000)) +\
            ((世帯人数 == 6) * (世帯所得 <= 4776000))
        所得条件 = (ひとり親である * ひとり親の場合の所得条件) + (np.logical_not(ひとり親である) * ひとり親でない場合の所得条件)

        return 居住地条件 * 預貯金条件 * 所得条件
