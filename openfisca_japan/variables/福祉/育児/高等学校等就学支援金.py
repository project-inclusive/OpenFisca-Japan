"""
高等学校等就学支援金の実装
"""

from functools import cache

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan import COUNTRY_DIR
from openfisca_japan.entities import 世帯
from openfisca_japan.variables.全般 import 高校生学年
from openfisca_japan.variables.福祉.育児.高等学校奨学給付金 import 高校履修種別パターン, 高校運営種別パターン

# TODO: 専攻科の就学支援金についても実装する（高等学校等就学支援金制度では専攻科は対象外）

# NOTE: 項目数が多い金額表は可読性の高いCSV形式としている。


@cache
def 支給限度額_学年制表():
    """
    csvファイルから値を取得

    支給限度額_学年制表()[高校履修種別, 高校運営種別] の形で参照可能
    """
    # NOTE: 特別支援学校等、一部の高校履修種別は非対応（網羅すると判別のために利用者の入力負担が増えてしまうため）
    # https://www.mext.go.jp/a_menu/shotou/mushouka/__icsFiles/afieldfile/2020/04/30/100014428_4.pdf
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校等就学支援金/支給額/支給限度額_学年制.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:]


@cache
def 支給限度額_単位制表():
    """
    csvファイルから値を取得

    支給限度額_単位制表()[高校履修種別, 高校運営種別] の形で参照可能
    """
    # 月額の最大値として、年間取得可能最大単位数を取った場合の年額を12か月で按分した値を使用
    # https://www.mext.go.jp/a_menu/shotou/mushouka/__icsFiles/afieldfile/2020/04/30/100014428_4.pdf
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校等就学支援金/支給額/支給限度額_単位制.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:]


@cache
def 加算額_学年制表():
    """
    csvファイルから値を取得

    加算額_学年制表()[高校履修種別, 高校運営種別] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校等就学支援金/支給額/加算額_学年制.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:]


@cache
def 加算額_単位制表():
    """
    csvファイルから値を取得

    加算額_単位制表()[高校履修種別][高校運営種別] の形で参照可能
    """
    # 月額の最大値として、年間取得可能最大単位数を取った場合の年額を12か月で按分した値を使用
    # https://www.mext.go.jp/a_menu/shotou/mushouka/__icsFiles/afieldfile/2020/04/30/100014428_4.pdf
    return np.genfromtxt(COUNTRY_DIR + "/assets/福祉/育児/高等学校等就学支援金/支給額/加算額_単位制.csv",
                         delimiter=",", skip_header=1, dtype="int64")[:, 1:]


class 高等学校等就学支援金_最小(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "高等学校等就学支援金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1342674.htm"
    documentation = """
    専攻科は対象外。
    算出方法は以下リンクも参考になる。
    (条件) https://www.mext.go.jp/a_menu/shotou/mushouka/20220329-mxt_kouhou02-3.pdf
    (金額) https://www.mext.go.jp/a_menu/shotou/mushouka/__icsFiles/afieldfile/2020/04/30/100014428_4.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        所得判定基準 = 対象世帯("高等学校等就学支援金_所得判定基準", 対象期間)
        学年 = 対象世帯.members("学年", 対象期間)
        高校生である = (学年 >= 高校生学年.一年生.value) * (学年 <= 高校生学年.三年生.value)

        高校履修種別 = 対象世帯.members("高校履修種別", 対象期間)
        高校運営種別 = 対象世帯.members("高校運営種別", 対象期間)

        高校履修種別インデックス = np.select(
            [高校履修種別 == 高校履修種別パターン.全日制課程,
             高校履修種別 == 高校履修種別パターン.定時制課程,
             高校履修種別 == 高校履修種別パターン.通信制課程],
            list(range(3)),
            -1).astype(int)

        高校運営種別インデックス = np.select(
            [高校運営種別 == 高校運営種別パターン.公立,
             高校運営種別 == 高校運営種別パターン.国立,
             高校運営種別 == 高校運営種別パターン.私立],
            list(range(3)),
            -1).astype(int)

        支給対象者である = 高校生である * (高校履修種別 != 高校履修種別パターン.無) * (高校運営種別 != 高校運営種別パターン.無)

        支給金額 = 支給限度額_学年制表()[高校履修種別インデックス, 高校運営種別インデックス]
        加算金額 = 加算額_学年制表()[高校履修種別インデックス, 高校運営種別インデックス]

        合計支給金額 = 対象世帯.sum(支給対象者である * 支給金額)
        合計加算金額 = 対象世帯.sum(支給対象者である * 加算金額)

        所得が支給対象である = 所得判定基準 < parameters(対象期間).福祉.育児.高等学校等就学支援金.所得判定基準.所得判定基準
        所得が加算対象である = 所得判定基準 < parameters(対象期間).福祉.育児.高等学校等就学支援金.所得判定基準.加算_所得判定基準

        return 合計支給金額 * 所得が支給対象である + 合計加算金額 * 所得が加算対象である


class 高等学校等就学支援金_最大(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "高等学校等就学支援金"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/1342674.htm"
    documentation = """
    専攻科は対象外。
    算出方法は以下リンクも参考になる。
    (条件) https://www.mext.go.jp/a_menu/shotou/mushouka/20220329-mxt_kouhou02-3.pdf
    (金額) https://www.mext.go.jp/a_menu/shotou/mushouka/__icsFiles/afieldfile/2020/04/30/100014428_4.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        所得判定基準 = 対象世帯("高等学校等就学支援金_所得判定基準", 対象期間)
        学年 = 対象世帯.members("学年", 対象期間)
        高校生である = (学年 >= 高校生学年.一年生.value) * (学年 <= 高校生学年.三年生.value)

        高校履修種別 = 対象世帯.members("高校履修種別", 対象期間)
        高校運営種別 = 対象世帯.members("高校運営種別", 対象期間)

        高校履修種別インデックス = np.select(
            [高校履修種別 == 高校履修種別パターン.全日制課程,
             高校履修種別 == 高校履修種別パターン.定時制課程,
             高校履修種別 == 高校履修種別パターン.通信制課程],
            list(range(3)),
            -1).astype(int)

        高校運営種別インデックス = np.select(
            [高校運営種別 == 高校運営種別パターン.公立,
             高校運営種別 == 高校運営種別パターン.国立,
             高校運営種別 == 高校運営種別パターン.私立],
            list(range(3)),
            -1).astype(int)

        支給対象者である = 高校生である * (高校履修種別 != 高校履修種別パターン.無) * (高校運営種別 != 高校運営種別パターン.無)

        支給金額 = 支給限度額_単位制表()[高校履修種別インデックス, 高校運営種別インデックス]
        加算金額 = 加算額_単位制表()[高校履修種別インデックス, 高校運営種別インデックス]

        合計支給金額 = 対象世帯.sum(支給対象者である * 支給金額)
        合計加算金額 = 対象世帯.sum(支給対象者である * 加算金額)

        所得が支給対象である = 所得判定基準 < parameters(対象期間).福祉.育児.高等学校等就学支援金.所得判定基準.所得判定基準
        所得が加算対象である = 所得判定基準 < parameters(対象期間).福祉.育児.高等学校等就学支援金.所得判定基準.加算_所得判定基準

        return 合計支給金額 * 所得が支給対象である + 合計加算金額 * 所得が加算対象である


class 高等学校等就学支援金_所得判定基準(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "高等学校等就学支援金計算において、支給額の判定基準となる額"
    reference = "https://www.mext.go.jp/a_menu/shotou/mushouka/20220329-mxt_kouhou02-3.pdf"

    def formula(対象世帯, 対象期間, parameters):
        課税標準額 = 対象世帯("控除後住民税世帯高所得", 対象期間)
        調整控除 = 対象世帯("調整控除", 対象期間)

        二人親である = 対象世帯.nb_persons(世帯.親) == 2
        課税標準額 = 課税標準額 + 二人親である * 対象世帯("世帯主の配偶者の控除後住民税所得", 対象期間)
        調整控除 = 調整控除 + 二人親である * 対象世帯("世帯主の配偶者の調整控除", 対象期間)

        return 課税標準額 * 0.06 - 調整控除


class 世帯主の配偶者の控除後住民税所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯主の配偶者の控除後住民税所得"
    reference = "https://www.town.hinode.tokyo.jp/0000000516.html"
    # TODO: 各種控除のentityが人物になったら削除
    # （世帯主が「自分」または「配偶者」でないと実際の控除額がずれるため）

    def formula(対象世帯, 対象期間, parameters):
        # 所得が高いほうが控除を受ける対象となる
        所得一覧 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, - 所得一覧, condition=対象世帯.has_role(世帯.親))
        納税者の配偶者である = 所得降順 == 1
        納税者の配偶者の所得 = 対象世帯.sum(所得一覧 * 納税者の配偶者である)

        # 扶養等と関係のない、納税者全員に関わる控除を追加
        # TODO: 世帯高所得ではなく自分、配偶者それぞれの所得から控除額を算出
        基礎控除 = np.select(
            [納税者の配偶者の所得 <= 24000000,
             (納税者の配偶者の所得 > 24000000) * (納税者の配偶者の所得 <= 24500000),
             (納税者の配偶者の所得 > 24500000) * (納税者の配偶者の所得 <= 25000000)],
            [430000,
             290000,
             150000],
            0)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する
        総控除額 = 基礎控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(納税者の配偶者の所得 - 総控除額, 0.0, None)


class 世帯主の配偶者の人的控除額の差(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯主の配偶者に対する所得税と住民税の控除の差額"
    reference = "https://www.town.hinode.tokyo.jp/0000000516.html"
    # TODO: 各種控除のentityが人物になったら削除
    # （世帯主が「自分」または「配偶者」でないと実際の額とずれるため）

    def formula(対象世帯, 対象期間, parameters):
        # 所得が高いほうが控除を受ける対象となる
        所得一覧 = 対象世帯.members("所得", 対象期間)
        所得降順 = 対象世帯.get_rank(対象世帯, - 所得一覧, condition=対象世帯.has_role(世帯.親))
        納税者の配偶者である = 所得降順 == 1
        納税者の配偶者の所得 = 対象世帯.sum(所得一覧 * 納税者の配偶者である)

        基礎控除差額 = np.where(納税者の配偶者の所得 <= 25000000, 50000, 0)

        return 基礎控除差額


class 世帯主の配偶者の調整控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯主の配偶者の調整控除"
    reference = "https://money-bu-jpx.com/news/article043882/"
    # TODO: 各種控除のentityが人物になったら削除
    # （世帯主が「自分」または「配偶者」でないと実際の額とずれるため）

    def formula(対象世帯, 対象期間, _parameters):
        人的控除額の差 = 対象世帯("世帯主の配偶者の人的控除額の差", 対象期間)

        # 個人住民税の課税所得金額に相当
        控除後住民税世帯高所得 = 対象世帯("世帯主の配偶者の控除後住民税所得", 対象期間)

        控除額 = np.select(
            [控除後住民税世帯高所得 <= 2000000,
             (控除後住民税世帯高所得 > 2000000) * (控除後住民税世帯高所得 < 25000000)],
            # (noqa) np.maxを世帯員抽出ではなく2つの式の比較に使用しているためlinterを許容
            [np.min([控除後住民税世帯高所得, 人的控除額の差], axis=0) * 0.05,  # noqa: TID251
             (人的控除額の差 - (控除後住民税世帯高所得 - 2000000)) * 0.05],
            0)

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(控除額, 0.0, None)
