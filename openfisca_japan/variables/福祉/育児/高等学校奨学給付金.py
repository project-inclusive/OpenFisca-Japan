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
    return np.genfromtxt(
        COUNTRY_DIR
        + "/assets/福祉/育児/高等学校奨学給付金/国立高等学校奨学給付金額.csv",
        delimiter=",",
        skip_header=1,
        dtype="int64",
    )[:, 1:]


@cache
def 公立高等学校奨学給付金表():
    """
    csvファイルから値を読み込み

    公立高等学校奨学給付金表()[世帯区分, 履修形態] の形で参照可能
    """
    return np.genfromtxt(
        COUNTRY_DIR
        + "/assets/福祉/育児/高等学校奨学給付金/公立高等学校奨学給付金額.csv",
        delimiter=",",
        skip_header=1,
        dtype="int64",
    )[:, 1:]


@cache
def 私立高等学校奨学給付金表():
    """
    csvファイルから値を読み込み

    私立高等学校奨学給付金表()[世帯区分, 履修形態] の形で参照可能
    """
    return np.genfromtxt(
        COUNTRY_DIR
        + "/assets/福祉/育児/高等学校奨学給付金/私立高等学校奨学給付金額.csv",
        delimiter=",",
        skip_header=1,
        dtype="int64",
    )[:, 1:]


class 高等学校奨学給付金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/index.htm"
    documentation = """
    高等学校奨学給付金_最小
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm
    (文部科学省)https://www.mext.go.jp/content/20250411-mxt_shuukyo03-100002595-03.pdf
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344146.htm
    (文部科学省)専攻科の生徒への支援（授業料以外）https://www.mext.go.jp/content/20250711-mxt_kouhou02-1.pdf
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """

    def formula(対象世帯, 対象期間, _parameters):
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0
        生活保護受給世帯の高等学校奨学給付金 = (
            対象世帯.sum(
                対象世帯.members("生活保護受給世帯の高等学校奨学給付金", 対象期間)
            )
            * 生活保護受給可能
        )

        住民税非課税世帯である = 対象世帯("住民税非課税世帯", 対象期間)
        住民税非課税世帯の高等学校奨学給付金 = (
            対象世帯.sum(
                対象世帯.members("住民税非課税世帯の高等学校奨学給付金", 対象期間)
            )
            * 住民税非課税世帯である
        )

        専攻科低所得世帯である = 対象世帯("専攻科低所得世帯である", 対象期間)
        専攻科低所得世帯の高等学校奨学給付金 = (
            対象世帯.sum(
                対象世帯.members("専攻科低所得世帯の高等学校奨学給付金", 対象期間)
            )
            * 専攻科低所得世帯である
        )

        給付金額候補 = np.stack(
            [
                生活保護受給世帯の高等学校奨学給付金,
                住民税非課税世帯の高等学校奨学給付金,
                専攻科低所得世帯の高等学校奨学給付金,
            ],
            axis=0,
        ).astype(float)
        給付対象となる = np.stack(
            [生活保護受給可能, 住民税非課税世帯である, 専攻科低所得世帯である], axis=0
        )

        年間支給金額 = np.min(np.where(給付対象となる, 給付金額候補, np.inf), axis=0)
        年間支給金額 = np.where(np.isfinite(年間支給金額), 年間支給金額, 0)

        # 月間支給金額へ変換
        return np.floor(年間支給金額 / 12)


class 高等学校奨学給付金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/index.htm"
    documentation = """
    高等学校奨学給付金_最大
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm
    (文部科学省)https://www.mext.go.jp/content/20250411-mxt_shuukyo03-100002595-03.pdf
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344146.htm
    (文部科学省)専攻科の生徒への支援（授業料以外）https://www.mext.go.jp/content/20250711-mxt_kouhou02-1.pdf
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """

    def formula(対象世帯, 対象期間, _parameters):
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0
        生活保護受給世帯の高等学校奨学給付金 = (
            対象世帯.sum(
                対象世帯.members("生活保護受給世帯の高等学校奨学給付金", 対象期間)
            )
            * 生活保護受給可能
        )

        住民税非課税世帯である = 対象世帯("住民税非課税世帯", 対象期間)
        住民税非課税世帯の高等学校奨学給付金 = (
            対象世帯.sum(
                対象世帯.members("住民税非課税世帯の高等学校奨学給付金", 対象期間)
            )
            * 住民税非課税世帯である
        )

        専攻科低所得世帯である = 対象世帯("専攻科低所得世帯である", 対象期間)
        専攻科低所得世帯の高等学校奨学給付金 = (
            対象世帯.sum(
                対象世帯.members("専攻科低所得世帯の高等学校奨学給付金", 対象期間)
            )
            * 専攻科低所得世帯である
        )

        給付金額候補 = np.stack(
            [
                生活保護受給世帯の高等学校奨学給付金,
                住民税非課税世帯の高等学校奨学給付金,
                専攻科低所得世帯の高等学校奨学給付金,
            ],
            axis=0,
        )
        給付対象となる = np.stack(
            [生活保護受給可能, 住民税非課税世帯である, 専攻科低所得世帯である], axis=0
        )

        年間支給金額 = np.max(np.where(給付対象となる, 給付金額候補, 0), axis=0)

        # 月間支給金額へ変換
        return np.floor(年間支給金額 / 12)


class 生活保護受給世帯の高等学校奨学給付金(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "生活保護受給世帯の高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/index.htm"
    documentation = """
    生活保護受給世帯の世帯員の高等学校奨学給付金
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm
    (文部科学省)https://www.mext.go.jp/content/20250411-mxt_shuukyo03-100002595-03.pdf
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344146.htm
    (文部科学省)専攻科の生徒への支援（授業料以外）https://www.mext.go.jp/content/20250711-mxt_kouhou02-1.pdf
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    """

    def formula(対象人物, 対象期間, parameters):
        子供である = 対象人物.has_role(世帯.子)
        高校生である = 対象人物("高校生である", 対象期間)

        高校履修種別 = 対象人物("高校履修種別", 対象期間).decode()
        高校履修種別区分 = np.select(
            [
                高校履修種別 == 高校履修種別パターン.全日制課程,
                高校履修種別 == 高校履修種別パターン.定時制課程,
                高校履修種別 == 高校履修種別パターン.通信制課程,
                高校履修種別 == 高校履修種別パターン.専攻科,
            ],
            [0, 1, 2, 3],
            -1,
        ).astype(
            int
        )  # intにできるようデフォルトをNoneではなく-1

        高校運営種別 = 対象人物("高校運営種別", 対象期間).decode()

        支給対象世帯区分 = 0  # 生活保護世帯に対応

        年間給付金額 = np.select(
            [
                高校運営種別 == 高校運営種別パターン.国立,
                高校運営種別 == 高校運営種別パターン.公立,
                高校運営種別 == 高校運営種別パターン.私立,
            ],
            [
                国立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
                公立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
                私立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
            ],
            0,
        )

        return 年間給付金額 * 高校生である * 子供である


class 住民税非課税世帯の高等学校奨学給付金(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "住民税非課税世帯の高等学校奨学給付金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/index.htm"
    documentation = """
    住民税非課税世帯の世帯員の高等学校奨学給付金
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344089.htm
    (文部科学省)https://www.mext.go.jp/content/20250411-mxt_shuukyo03-100002595-03.pdf
    (文部科学省)https://www.mext.go.jp/a_menu/shotou/mushouka/1344146.htm
    (文部科学省)専攻科の生徒への支援（授業料以外）https://www.mext.go.jp/content/20250711-mxt_kouhou02-1.pdf
    (東京都HP)https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html
    (兵庫HP)https://web.pref.hyogo.lg.jp/kk35/shougakukyuuhukinn.html
    (東京都私立財団HP)https://www.shigaku-tokyo.or.jp/pa_shougaku.html
    """

    def formula(対象人物, 対象期間, parameters):
        子供である = 対象人物.has_role(世帯.子)
        高校生である = 対象人物("高校生である", 対象期間)

        高校履修種別 = 対象人物("高校履修種別", 対象期間).decode()
        高校履修種別区分 = np.select(
            [
                高校履修種別 == 高校履修種別パターン.全日制課程,
                高校履修種別 == 高校履修種別パターン.定時制課程,
                高校履修種別 == 高校履修種別パターン.通信制課程,
                高校履修種別 == 高校履修種別パターン.専攻科,
            ],
            [0, 1, 2, 3],
            -1,
        ).astype(
            int
        )  # intにできるようデフォルトをNoneではなく-1

        高校運営種別 = 対象人物("高校運営種別", 対象期間).decode()

        # FY2025以降は第1子と第2子の給付額が統一されたため、非課税世帯の行はインデックス2を参照する。
        支給対象世帯区分 = 2

        年間給付金額 = np.select(
            [
                高校運営種別 == 高校運営種別パターン.国立,
                高校運営種別 == 高校運営種別パターン.公立,
                高校運営種別 == 高校運営種別パターン.私立,
            ],
            [
                国立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
                公立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
                私立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
            ],
            0,
        )

        return 年間給付金額 * 高校生である * 子供である


class levy_total(Variable):
    value_type = float
    default_value = 0.0
    entity = 世帯
    definition_period = DAY
    label = "道府県民税と市町村民税の所得割額の合計"


class 専攻科低所得世帯である(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "高等学校奨学給付金における専攻科の低所得世帯かどうか"

    def formula(対象世帯, 対象期間, parameters):
        levy_total = 対象世帯("levy_total", 対象期間)
        扶養人数 = 対象世帯("扶養人数", 対象期間)
        住民税非課税世帯である = 対象世帯("住民税非課税世帯", 対象期間)
        生活保護受給可能 = 対象世帯("生活保護", 対象期間) > 0

        専攻科判定パラメーター = parameters(
            対象期間
        ).福祉.育児.高等学校奨学給付金.専攻科低所得世帯
        低所得世帯合算額 = 専攻科判定パラメーター.低所得合算額
        多子世帯合算額 = 専攻科判定パラメーター.多子合算額
        多子世帯扶養人数 = 専攻科判定パラメーター.多子扶養人数

        levy_total_has_value = levy_total > 0
        低所得該当 = levy_total < 低所得世帯合算額
        多子該当 = (levy_total < 多子世帯合算額) & (扶養人数 >= 多子世帯扶養人数)

        高校履修種別一覧 = 対象世帯.members("高校履修種別", 対象期間).decode()
        専攻科に通う世帯員がいる = 対象世帯.any(
            高校履修種別一覧 == 高校履修種別パターン.専攻科
        )

        判定対象 = (
            専攻科に通う世帯員がいる & levy_total_has_value & (低所得該当 | 多子該当)
        )

        return (
            判定対象
            & np.logical_not(住民税非課税世帯である)
            & np.logical_not(生活保護受給可能)
        )


class 専攻科低所得世帯の高等学校奨学給付金(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "専攻科低所得世帯の世帯員の高等学校奨学給付金"

    def formula(対象人物, 対象期間, parameters):
        子供である = 対象人物.has_role(世帯.子)
        高校生である = 対象人物("高校生である", 対象期間)

        高校履修種別 = 対象人物("高校履修種別", 対象期間).decode()
        高校履修種別区分 = np.select(
            [
                高校履修種別 == 高校履修種別パターン.全日制課程,
                高校履修種別 == 高校履修種別パターン.定時制課程,
                高校履修種別 == 高校履修種別パターン.通信制課程,
                高校履修種別 == 高校履修種別パターン.専攻科,
            ],
            [0, 1, 2, 3],
            -1,
        ).astype(int)

        高校運営種別 = 対象人物("高校運営種別", 対象期間).decode()

        支給対象世帯区分 = 3  # 専攻科低所得世帯専用の区分（CSVの4行目）

        年間給付金額 = np.select(
            [
                高校運営種別 == 高校運営種別パターン.国立,
                高校運営種別 == 高校運営種別パターン.公立,
                高校運営種別 == 高校運営種別パターン.私立,
            ],
            [
                国立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
                公立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
                私立高等学校奨学給付金表()[支給対象世帯区分, 高校履修種別区分],
            ],
            0,
        )

        専攻科である = 高校履修種別 == 高校履修種別パターン.専攻科

        return 年間給付金額 * 専攻科である * 高校生である * 子供である


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
        return (
            (学年 >= 高校生学年.一年生.value)
            * (学年 <= 高校生学年.三年生.value)
            * (高校履修種別 != 高校履修種別パターン.無)
        )


class 通信制課程の高校に通う世帯員がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "通信制課程の高校に通う世帯員がいる"

    def formula(対象世帯, 対象期間, _parameters):
        高校履修種別一覧 = 対象世帯.members("高校履修種別", 対象期間).decode()
        return 対象世帯.any(高校履修種別一覧 == 高校履修種別パターン.通信制課程)
