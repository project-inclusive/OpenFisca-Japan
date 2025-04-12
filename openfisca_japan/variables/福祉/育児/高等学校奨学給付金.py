"""
高等学校奨学給付金の実装
"""

from functools import cache

import numpy as np
from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan import COUNTRY_DIR
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.全般 import 高校生学年


@cache
def 国立高等学校奨学給付金表():
    """
    csvファイルから値を読み込み

    国立高等学校奨学給付金表()[世帯区分, 履修形態] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校奨学給付金/国立高等学校奨学給付金額.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:]


@cache
def 公立高等学校奨学給付金表():
    """
    csvファイルから値を読み込み

    公立高等学校奨学給付金表()[世帯区分, 履修形態] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校奨学給付金/公立高等学校奨学給付金額.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:]


@cache
def 私立高等学校奨学給付金表():
    """
    csvファイルから値を読み込み

    私立高等学校奨学給付金表()[世帯区分, 履修形態] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校奨学給付金/私立高等学校奨学給付金額.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:]


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

    def formula(対象世帯, 対象期間, _parameters):
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0
        生活保護受給世帯の高等学校奨学給付金 = \
            対象世帯.sum(対象世帯.members("生活保護受給世帯の高等学校奨学給付金", 対象期間)) * 生活保護受給可能

        住民税非課税世帯である = 対象世帯("住民税非課税世帯", 対象期間)
        住民税非課税世帯の高等学校奨学給付金 = \
            対象世帯.sum(対象世帯.members("住民税非課税世帯の高等学校奨学給付金", 対象期間)) * 住民税非課税世帯である

        # 金額が小さい方(ただし、小さい方の金額が0円の場合はもう片方を適用)
        年間支給金額 = np.select(
            [(生活保護受給世帯の高等学校奨学給付金 >= 住民税非課税世帯の高等学校奨学給付金) * 住民税非課税世帯である,
             (生活保護受給世帯の高等学校奨学給付金 < 住民税非課税世帯の高等学校奨学給付金) * 生活保護受給可能,
             住民税非課税世帯の高等学校奨学給付金 == 0,
             生活保護受給世帯の高等学校奨学給付金 == 0],
            [住民税非課税世帯の高等学校奨学給付金,
             生活保護受給世帯の高等学校奨学給付金,
             生活保護受給世帯の高等学校奨学給付金,
             住民税非課税世帯の高等学校奨学給付金],
            0)

        # 月間支給金額へ変換
        return np.floor(年間支給金額 / 12)


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

    def formula(対象世帯, 対象期間, _parameters):
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0
        生活保護受給世帯の高等学校奨学給付金 = \
            対象世帯.sum(対象世帯.members("生活保護受給世帯の高等学校奨学給付金", 対象期間)) * 生活保護受給可能

        住民税非課税世帯である = 対象世帯("住民税非課税世帯", 対象期間)
        住民税非課税世帯の高等学校奨学給付金 = \
            対象世帯.sum(対象世帯.members("住民税非課税世帯の高等学校奨学給付金", 対象期間)) * 住民税非課税世帯である

        # 金額が大きい方
        年間支給金額 = np.select(
            [生活保護受給世帯の高等学校奨学給付金 >= 住民税非課税世帯の高等学校奨学給付金,
             生活保護受給世帯の高等学校奨学給付金 < 住民税非課税世帯の高等学校奨学給付金],
            [生活保護受給世帯の高等学校奨学給付金,
             住民税非課税世帯の高等学校奨学給付金],
            0)

        # 月間支給金額へ変換
        return np.floor(年間支給金額 / 12)


class 生活保護受給世帯の高等学校奨学給付金(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "生活保護受給世帯の高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm"
    documentation = """
    生活保護受給世帯の世帯員の高等学校奨学給付金
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """

    def formula(対象人物, 対象期間, parameters):
        子供である = 対象人物.has_role(世帯.子)
        高校生である = 対象人物("高校生である", 対象期間)

        高校履修種別 = 対象人物("高校履修種別", 対象期間).decode()
        高校履修種別区分 = np.select(
            [高校履修種別 == 高校履修種別パターン.全日制課程,
             高校履修種別 == 高校履修種別パターン.定時制課程,
             高校履修種別 == 高校履修種別パターン.通信制課程,
             高校履修種別 == 高校履修種別パターン.専攻科],
            [0, 1, 2, 3],
            -1).astype(int)  # intにできるようデフォルトをNoneではなく-1

        高校運営種別 = 対象人物("高校運営種別", 対象期間).decode()

        支給対象世帯区分 = 0  # 生活保護世帯に対応

        年間給付金額 = np.select(
            [高校運営種別 == 高校運営種別パターン.国立,
             高校運営種別 == 高校運営種別パターン.公立,
             高校運営種別 == 高校運営種別パターン.私立],
            [国立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
             公立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
             私立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分]],
            0)

        return 年間給付金額 * 高校生である * 子供である


class 住民税非課税世帯の高等学校奨学給付金(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "住民税非課税世帯の高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm"
    documentation = """
    住民税非課税世帯の世帯員の高等学校奨学給付金
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    (東京都私立財団HP)https://www.shigaku-tokyo.or.jp/pa_shougaku.html
    """

    def formula(対象人物, 対象期間, parameters):
        子供である = 対象人物.has_role(世帯.子)
        年齢 = 対象人物("年齢", 対象期間)
        支給対象である = 子供である & (年齢 < 23)
        子供の年齢降順インデックス = 対象人物.get_rank(対象人物.世帯, -年齢, condition=支給対象である)
        高校生である = 対象人物("高校生である", 対象期間)

        高校履修種別 = 対象人物("高校履修種別", 対象期間).decode()
        高校履修種別区分 = np.select(
            [高校履修種別 == 高校履修種別パターン.全日制課程,
             高校履修種別 == 高校履修種別パターン.定時制課程,
             高校履修種別 == 高校履修種別パターン.通信制課程,
             高校履修種別 == 高校履修種別パターン.専攻科],
            [0, 1, 2, 3],
            -1).astype(int)  # intにできるようデフォルトをNoneではなく-1

        高校運営種別 = 対象人物("高校運営種別", 対象期間).decode()

        通信制課程の高校に通う世帯員がいる = 対象人物.世帯("通信制課程の高校に通う世帯員がいる", 対象期間)
        # NOTE: 支給対象の範囲内の第一子か否かで区分が変わる(インデックスは0始まりのため、0は第一子を意味する)
        支給対象の範囲内の第一子である = 子供の年齢降順インデックス == 0
        第一子扱いとなる高校履修種別である = (高校履修種別 == 高校履修種別パターン.全日制課程) + (高校履修種別 == 高校履修種別パターン.定時制課程)
        支給対象世帯区分 = np.select(
            [支給対象の範囲内の第一子である * np.logical_not(通信制課程の高校に通う世帯員がいる) * 第一子扱いとなる高校履修種別である],
            [1],
            2).astype(int)

        年間給付金額 = np.select(
            [高校運営種別 == 高校運営種別パターン.国立,
             高校運営種別 == 高校運営種別パターン.公立,
             高校運営種別 == 高校運営種別パターン.私立],
            [国立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
             公立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
             私立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分]],
            0)

        return 年間給付金額 * 高校生である * 子供である


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


class 支給対象世帯(Enum):
    __order__ = "生活保護世帯 非課税世帯1 非課税世帯2"
    生活保護世帯 = "生活保護（生業扶助）受給世帯"
    非課税世帯1 = "非課税世帯（第1子）"
    非課税世帯2 = "非課税世帯（第2子）"


class 高校生である(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "高校生であるかどうか"

    def formula(対象人物, 対象期間, _parameters):
        学年 = 対象人物("学年", 対象期間)
        高校履修種別 = 対象人物("高校履修種別", 対象期間)
        return (学年 >= 高校生学年.一年生.value) * (学年 <= 高校生学年.三年生.value) * (高校履修種別 != 高校履修種別パターン.無)


class 通信制課程の高校に通う世帯員がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "通信制課程の高校に通う世帯員がいる"

    def formula(対象世帯, 対象期間, _parameters):
        高校履修種別一覧 = 対象世帯.members("高校履修種別", 対象期間).decode()
        return 対象世帯.any(高校履修種別一覧 == 高校履修種別パターン.通信制課程)
