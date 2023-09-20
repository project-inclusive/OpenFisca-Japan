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

with open('openfisca_japan/parameters/福祉/育児/高等学校奨学給付金/国立高等学校奨学給付金額.csv') as f:
    reader = csv.DictReader(f)
    # 国立高等学校奨学給付金表[世帯区分][履修形態] の形で参照可能
    国立高等学校奨学給付金表 = {row[""]: row for row in reader}

with open('openfisca_japan/parameters/福祉/育児/高等学校奨学給付金/公立高等学校奨学給付金額.csv') as f:
    reader = csv.DictReader(f)
    # 公立高等学校奨学給付金表[世帯区分][履修形態] の形で参照可能
    公立高等学校奨学給付金表 = {row[""]: row for row in reader}

with open('openfisca_japan/parameters/福祉/育児/高等学校奨学給付金/私立高等学校奨学給付金額.csv') as f:
    reader = csv.DictReader(f)
    # 私立高等学校奨学給付金表[世帯区分][履修形態] の形で参照可能
    私立高等学校奨学給付金表 = {row[""]: row for row in reader}

class 高等学校奨学給付金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm"
    documentation = """
    高等学校奨学給付金_最小
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """

    def formula(対象世帯, 対象期間, parameters):
        年間支給金額 = 0
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)

        # 私立高等学校で通信制課程の場合、他の給付金額の場合と異なり生活保護世帯の給付金の方が高くなっていた。
        # そのため、対象世帯が通信制課程の方の場合は、順番を逆にして支給金額を返しております。
        # openfisca_japan/parameters/福祉/育児/高等学校奨学給付金/私立高等学校奨学給付金額.csv
        if 私立で通信制課程のみ(対象世帯, 対象期間):
            if 住民税非課税世帯:
                年間支給金額 = 対象世帯("住民税非課税世帯の高等学校奨学給付金", 対象期間)
            elif 生活保護受給可能:
                年間支給金額 = 対象世帯("生活保護受給世帯の高等学校奨学給付金", 対象期間)    
        else:
            if 生活保護受給可能:
                年間支給金額 = 対象世帯("生活保護受給世帯の高等学校奨学給付金", 対象期間)
            elif 住民税非課税世帯:
                年間支給金額 = 対象世帯("住民税非課税世帯の高等学校奨学給付金", 対象期間)           

        return 月間支給金額へ変換(年間支給金額)

class 高等学校奨学給付金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm"
    documentation = """
    高等学校奨学給付金_最大
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """

    def formula(対象世帯, 対象期間, parameters):
        年間支給金額 = 0
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0
        住民税非課税世帯 = 対象世帯("住民税非課税世帯", 対象期間)

        # 私立高等学校で通信制課程の場合、他の給付金額の場合と異なり生活保護世帯の給付金の方が高くなっていた。
        # そのため、対象世帯が通信制課程の方の場合は、順番を逆にして支給金額を返しております。
        # openfisca_japan/parameters/福祉/育児/高等学校奨学給付金/私立高等学校奨学給付金額.csv
        if 私立で通信制課程のみ(対象世帯, 対象期間):
            if 生活保護受給可能:
                年間支給金額 = 対象世帯("生活保護受給世帯の高等学校奨学給付金", 対象期間)
            elif 住民税非課税世帯:
                年間支給金額 = 対象世帯("住民税非課税世帯の高等学校奨学給付金", 対象期間)    
        else:
            if 住民税非課税世帯:
                年間支給金額 = 対象世帯("住民税非課税世帯の高等学校奨学給付金", 対象期間)
            elif 生活保護受給可能:
                年間支給金額 = 対象世帯("生活保護受給世帯の高等学校奨学給付金", 対象期間)   

        return 月間支給金額へ変換(年間支給金額)

class 生活保護受給世帯の高等学校奨学給付金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "生活保護受給世帯の高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm"
    documentation = """
    生活保護受給世帯の高等学校奨学給付金
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """
    
    def formula(対象世帯, 対象期間, parameters):
        年齢一覧 = 対象世帯.members("年齢", 対象期間)
        学年一覧 = 対象世帯.members("学年", 対象期間)
        子供である = 対象世帯.has_role(世帯.子)
        子供の学年一覧 = 学年一覧[子供である]
        子供の年齢一覧 = 年齢一覧[子供である]
        if not 高校生がいる(対象世帯, 学年一覧):
            return 0

        高校履修種別一覧 = 対象世帯.members("高校履修種別", 対象期間)[子供である].decode()
        高校運営種別一覧 = 対象世帯.members("高校運営種別", 対象期間)[子供である].decode()
        子供の年齢降順インデックス一覧 = np.argsort(子供の年齢一覧)[::-1]

        年間支給金額 = 0
        for 子供の年齢降順インデックス in 子供の年齢降順インデックス一覧:
            子供の学年 = 子供の学年一覧[子供の年齢降順インデックス]
            高校履修種別 = 高校履修種別一覧[子供の年齢降順インデックス]
            高校運営種別 = 高校運営種別一覧[子供の年齢降順インデックス]
            if not 高校生である(子供の学年, 高校履修種別):
                continue

            年間支給金額 += 高校運営種別に応じた給付金額取得(高校履修種別, 高校運営種別, 支給対象世帯.生活保護世帯)

        return 年間支給金額

class 住民税非課税世帯の高等学校奨学給付金(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "住民税非課税世帯の高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm"
    documentation = """
    住民税非課税世帯の高等学校奨学給付金
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """

    def formula(対象世帯, 対象期間, parameters):
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
        高校履修種別一覧 = 対象世帯.members("高校履修種別", 対象期間)[子供である].decode()[計算対象年齢インデックス一覧]
        高校運営種別一覧 = 対象世帯.members("高校運営種別", 対象期間)[子供である].decode()[計算対象年齢インデックス一覧]
        子供の年齢降順インデックス一覧 = np.argsort(子供の年齢一覧)[::-1]

        for (i, 子供の年齢降順インデックス) in enumerate(子供の年齢降順インデックス一覧):
            高校履修種別 = 高校履修種別一覧[子供の年齢降順インデックス]
            子供の学年 = 子供の学年一覧[子供の年齢降順インデックス]
            高校運営種別 = 高校運営種別一覧[子供の年齢降順インデックス]
            if not 高校生である(子供の学年, 高校履修種別):
                continue

            if i == 0: # 第一子目
                if np.any(高校履修種別一覧 == 高校履修種別パターン.通信制課程) and (高校履修種別 in [高校履修種別パターン.全日制課程, 高校履修種別パターン.定時制課程]):
                    # 当該世帯に通信制過程の高等学校等に在籍する高校生がいる場合の、非課税世帯(第一子)の支給金額
                    年間支給金額 += parameters(対象期間).福祉.育児.高等学校奨学給付金.非課税世帯第一子の特別支給金額
                else:
                    年間支給金額 += 高校運営種別に応じた給付金額取得(高校履修種別, 高校運営種別, 支給対象世帯.非課税世帯1)
            else: # それ以降
                年間支給金額 += 高校運営種別に応じた給付金額取得(高校履修種別, 高校運営種別, 支給対象世帯.非課税世帯2)

        return 年間支給金額

class 高校履修種別パターン(Enum):
    __order__ = "無 全日制課程 定時制課程 通信制課程 専攻科"
    無 = "無"
    全日制課程 = "全日制課程"
    定時制課程 = "定時制課程"
    通信制課程 = "通信制課程"
    専攻科 = "専攻科"

class 高校履修種別(Variable):
    value_type = Enum
    possible_values = 高校履修種別パターン
    default_value = 高校履修種別パターン.無
    entity = 人物
    definition_period = DAY
    label = "高校履修種別"

class 高校運営種別パターン(Enum):
    __order__ = "無 国立 公立 私立"
    無 = "無"
    国立 = "国立"
    公立 = "公立"
    私立 = "私立"

class 高校運営種別(Variable):
    value_type = Enum
    possible_values = 高校運営種別パターン
    default_value = 高校運営種別パターン.無
    entity = 人物
    definition_period = DAY
    label = "高校運営種別"

class 高校生学年(OriginalEnum):
    一年生 = 10
    二年生 = 11
    三年生 = 12

class 支給対象世帯(OriginalEnum):
    生活保護世帯 = "生活保護（生業扶助）受給世帯"
    非課税世帯1 = "非課税世帯（第1子）"
    非課税世帯2 = "非課税世帯（第2子）"

def 月間支給金額へ変換(年間支給金額):
    return math.floor(年間支給金額 / 12)

def 高校生である(子供の学年, 高校履修種別):
    return (子供の学年 >= 高校生学年.一年生.value and 子供の学年 <= 高校生学年.三年生.value) and 高校履修種別 != 高校履修種別パターン.無

def 高校生がいる(対象世帯, 学年一覧):
    return int(対象世帯.sum((学年一覧 >= 高校生学年.一年生.value) * (学年一覧 <= 高校生学年.三年生.value))[0]) > 0

def 私立で通信制課程のみ(対象世帯, 対象期間):
    子供である = 対象世帯.has_role(世帯.子)
    高校履修種別一覧 = 対象世帯.members("高校履修種別", 対象期間)[子供である].decode()
    高校運営種別一覧 = 対象世帯.members("高校運営種別", 対象期間)[子供である].decode()
    return np.all(高校履修種別一覧 == 高校履修種別パターン.通信制課程) and np.all(高校運営種別一覧 == 高校運営種別パターン.私立)

def 高校運営種別に応じた給付金額取得(高校履修種別, 高校運営種別, 支給対象世帯):
    給付金額 = 0
    if 高校運営種別 == 高校運営種別パターン.国立:
        給付金額 = int(国立高等学校奨学給付金表[支給対象世帯.value][高校履修種別.value])
    elif 高校運営種別 == 高校運営種別パターン.公立:
        給付金額 = int(公立高等学校奨学給付金表[支給対象世帯.value][高校履修種別.value])
    elif 高校運営種別 == 高校運営種別パターン.私立:
        給付金額 = int(私立高等学校奨学給付金表[支給対象世帯.value][高校履修種別.value])

    return 給付金額
