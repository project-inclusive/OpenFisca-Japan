"""
高等学校奨学給付金の実装
"""

import csv
from enum import Enum as OriginalEnum
import math
import numpy as np

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_core.indexed_enums import Enum

with open('openfisca_japan/parameters/東京都/福祉/高等学校奨学給付金/高等学校奨学給付金額.csv') as f:
    reader = csv.DictReader(f)
    # 高等学校奨学給付金表[世帯区分][履修形態] の形で参照可能
    高等学校奨学給付金表 = {row[""]: row for row in reader}

class 高等学校奨学給付金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校奨学給付金"
    reference = "https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html"
    documentation = """
    高等学校奨学給付金_最小
    """

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        if 居住都道府県[0] != "東京都":
            return 0

        年齢一覧 = 対象世帯.members("年齢", 対象期間)
        学年一覧 = 対象世帯.members("学年", 対象期間)
        子供である = 対象世帯.has_role(世帯.子)
        子供の学年一覧 = 学年一覧[子供である]
        子供の年齢一覧 = 年齢一覧[子供である]
        if not 高校生がいる(対象世帯, 学年一覧):
            return 0

        年間支給金額 = 0
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0
        if 生活保護受給可能:
            高校種別一覧 = 対象世帯.members("高校種別", 対象期間)[子供である].decode()
            子供の年齢降順インデックス一覧 = np.argsort(子供の年齢一覧)[::-1]

            for 子供の年齢降順インデックス in 子供の年齢降順インデックス一覧:
                子供の学年 = 子供の学年一覧[子供の年齢降順インデックス]
                高校種別 = 高校種別一覧[子供の年齢降順インデックス]
                if not 高校生である(子供の学年, 高校種別):
                    continue

                年間支給金額 += int(高等学校奨学給付金表["生活保護（生業扶助）受給世帯"][高校種別.value])
        
        return 月間支給金額へ変換(年間支給金額)

class 高等学校奨学給付金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校奨学給付金"
    reference = "https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html"
    documentation = """
    高等学校奨学給付金_最大
    """

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        if 居住都道府県[0] != "東京都":
            return 0
        
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)
        if not 住民税非課税世帯:
            return 0

        子供である = 対象世帯.has_role(世帯.子)
        年齢一覧 = 対象世帯.members("年齢", 対象期間)
        学年一覧 = 対象世帯.members("学年", 対象期間)
        子供の年齢一覧 = 年齢一覧[子供である]
        子供の学年一覧 = 学年一覧[子供である]
        if not 高校生がいる(対象世帯, 学年一覧):
            return 0
        
        年間支給金額 = 0
        計算対象年齢インデックス一覧 = np.where(子供の年齢一覧 < 23)
        子供の年齢一覧 = 子供の年齢一覧[計算対象年齢インデックス一覧]
        子供の学年一覧 = 子供の学年一覧[計算対象年齢インデックス一覧]
        高校種別一覧 = 対象世帯.members("高校種別", 対象期間)[子供である].decode()
        高校種別一覧 = 高校種別一覧[計算対象年齢インデックス一覧]
        子供の年齢降順インデックス一覧 = np.argsort(子供の年齢一覧)[::-1]

        for (i, 子供の年齢降順インデックス) in enumerate(子供の年齢降順インデックス一覧):
            高校種別 = 高校種別一覧[子供の年齢降順インデックス]
            子供の学年 = 子供の学年一覧[子供の年齢降順インデックス]
            if not 高校生である(子供の学年, 高校種別):
                continue

            if i == 0: # 第一子目
                if np.any(高校種別一覧 == 高校種別パターン.通信制課程) and (高校種別 in [高校種別パターン.全日制課程, 高校種別パターン.定時制課程]):
                    # 当該世帯に通信制過程の高等学校等に在籍する高校生がいる場合の、非課税世帯(第一子)の支給金額
                    年間支給金額 += parameters(対象期間).東京都.福祉.高等学校奨学給付金.非課税世帯第一子の特別支給金額
                else:
                    年間支給金額 += int(高等学校奨学給付金表["非課税世帯（第1子）"][高校種別.value])
            else: # それ以降
                年間支給金額 += int(高等学校奨学給付金表["非課税世帯（第2子）"][高校種別.value])

        return 月間支給金額へ変換(年間支給金額)

class 高校種別パターン(Enum):
    __order__ = "無 全日制課程 定時制課程 通信制課程 専攻科"
    無 = "無"
    全日制課程 = "全日制課程"
    定時制課程 = "定時制課程"
    通信制課程 = "通信制課程"
    専攻科 = "専攻科"

class 高校種別(Variable):
    value_type = Enum
    possible_values = 高校種別パターン
    default_value = 高校種別パターン.無
    entity = 人物
    definition_period = DAY
    label = "高校種別"

class 高校生学年(OriginalEnum):
    一年生 = 10
    二年生 = 11
    三年生 = 12

def 月間支給金額へ変換(年間支給金額):
    return math.floor(年間支給金額 / 12)

def 高校生である(子供の学年, 高校種別):
    return (子供の学年 >= 高校生学年.一年生.value and 子供の学年 <= 高校生学年.三年生.value) and 高校種別 != 高校種別パターン.無

def 高校生がいる(対象世帯, 学年一覧):
    return int(対象世帯.sum((学年一覧 >= 高校生学年.一年生.value) * (学年一覧 <= 高校生学年.三年生.value))[0]) > 0
