"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

from functools import cache

import numpy as np
from openfisca_core.periods import DAY, period
from openfisca_core.variables import Variable
from openfisca_japan import COUNTRY_DIR
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.全般 import 性別パターン

# NOTE: 項目数が多い金額表は可読性の高いCSV形式としている。


@cache
def 配偶者控除額表():
    """
    csvファイルから値を取得

    配偶者控除額表()[配偶者の所得区分, 納税者本人の所得区分] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/住民税/配偶者控除額.csv",
                  delimiter=",", skip_header=1, dtype="int64")[np.newaxis, 1:]


@cache
def 老人控除対象配偶者_配偶者控除額表():
    """
    csvファイルから値を取得

    老人控除対象配偶者_配偶者控除額表()[配偶者の所得区分, 納税者本人の所得区分] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/住民税/配偶者控除額_老人控除対象配偶者.csv",
                         delimiter=",", skip_header=1, dtype="int64")[np.newaxis, 1:]


@cache
def 配偶者特別控除額表():
    """
    csvファイルから値を取得

    配偶者特別控除額表()[配偶者の所得区分, 納税者本人の所得区分] の形で参照可能
    """
    return np.genfromtxt(COUNTRY_DIR + "/assets/住民税/配偶者特別控除額.csv",
                  delimiter=",", skip_header=1, dtype="int64")[:, 1:]


class 住民税障害者控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税における障害者控除額"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意（金額が異なるだけで条件は同じ）。
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加。
    """

    def formula(対象人物, 対象期間, _parameters):
        # 自身が扶養に入っている、または同一生計配偶者である場合、納税者（世帯主）が控除を受ける
        扶養親族である = 対象人物("扶養親族である", 対象期間)
        同一生計配偶者である = 対象人物("同一生計配偶者である", 対象期間)
        被扶養者である = 扶養親族である + 同一生計配偶者である

        所得 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, -所得)
        # NOTE: 便宜上、被扶養者は所得が最も高い世帯員の扶養に入るとする
        所得が最も高い世帯員である = 所得降順 == 0

        控除対象額 = 対象人物("住民税障害者控除対象額", 対象期間)
        # NOTE: 異なる人物に対する値であるため、人物ではなく世帯ごとに集計（でないと「扶養者である」と要素がずれてしまい計算できない)
        被扶養者の合計控除額 = 対象人物.世帯.sum(被扶養者である * 控除対象額)

        # 最も所得が高い世帯員ではないが、一定以上の所得がある場合
        扶養に入っていない納税者である = np.logical_not(所得が最も高い世帯員である) * np.logical_not(被扶養者である)
        # 被扶養者は控除を受けない（扶養者が代わりに控除を受けるため）
        return 所得が最も高い世帯員である * (被扶養者の合計控除額 + 控除対象額) + 扶養に入っていない納税者である * 控除対象額


class 住民税障害者控除対象額(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税障害者控除額の対象額"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    実際の控除額は同一生計配偶者、扶養親族が該当する場合にも加算される
    """

    def formula(対象人物, 対象期間, parameters):
        # 障害者控除額は対象人物ごとに算出される
        # https://www.city.hirakata.osaka.jp/kosodate/0000000544.html
        同居特別障害者控除対象 = 対象人物("同居特別障害者控除対象", 対象期間)
        # 重複して該当しないよう、同居特別障害者控除対象の場合を除外
        特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間) * np.logical_not(同居特別障害者控除対象)
        障害者控除対象 = 対象人物("障害者控除対象", 対象期間)

        同居特別障害者控除額 = parameters(対象期間).住民税.同居特別障害者控除額
        特別障害者控除額 = parameters(対象期間).住民税.特別障害者控除額
        障害者控除額 = parameters(対象期間).住民税.障害者控除額

        return 同居特別障害者控除対象 * 同居特別障害者控除額 + 特別障害者控除対象 * 特別障害者控除額 + 障害者控除対象 * 障害者控除額


class 住民税ひとり親控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税におけるひとり親控除額"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意（金額が異なるだけで条件は同じ）。
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加。
    """

    def formula_2020_01_01(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        # 児童扶養手当の対象と異なり、父母の遺棄・DV等は考慮しない
        # (参考：児童扶養手当 https://www.city.hirakata.osaka.jp/0000026828.html)
        親である = 対象人物.has_role(世帯.親)
        子である = 対象人物.has_role(世帯.子)
        対象ひとり親 = (対象人物.世帯.sum(親である) == 1) * (対象人物.世帯.sum(子である) >= 1)
        ひとり親控除額 = parameters(対象期間).住民税.ひとり親控除額
        ひとり親控除_所得制限額 = parameters(対象期間).住民税.ひとり親控除_所得制限額

        return 親である * ひとり親控除額 * 対象ひとり親 * (所得 < ひとり親控除_所得制限額)


class 住民税寡婦控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税における寡婦控除額"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意（金額が異なるだけで条件は同じ）。
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加。
    """

    def formula_2020_01_01(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        寡婦 = 対象人物("寡婦", 対象期間)
        寡婦控除額 = parameters(対象期間).住民税.寡婦控除額
        寡婦控除_所得制限額 = parameters(対象期間).住民税.寡婦控除_所得制限額

        return 寡婦控除額 * 寡婦 * (所得 <= 寡婦控除_所得制限額)


class 住民税勤労学生控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税における勤労学生控除"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意（金額が異なるだけで条件は同じ）。
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加。
    """

    def formula(対象人物, 対象期間, parameters):
        所得 = 対象人物("所得", 対象期間)
        学生である = 対象人物("学生", 対象期間)
        勤労学生控除額 = parameters(対象期間).住民税.勤労学生控除額
        勤労学生_所得制限額 = parameters(対象期間).住民税.勤労学生_所得制限額
        所得条件 = (所得 > 0) * (所得 <= 勤労学生_所得制限額)

        return 所得条件 * 学生である * 勤労学生控除額


class 住民税配偶者控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税における配偶者控除"
    reference = "https://www.city.hiroshima.lg.jp/soshiki/26/202040.html"
    documentation = """
    所得税における控除額とはことなるので注意（金額が異なるだけで条件は同じ）。
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加。
    配偶者特別控除とは異なる。
    配偶者の所得が配偶者控除の所得制限を超えた場合でも、配偶者特別控除が適用される可能性がある。
    老人控除対象かどうかは以下を参照。
    https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1182.htm
    """

    def formula(対象人物, 対象期間, _parameters):
        # 所得が高いほうが控除を受ける対象となる
        所得一覧 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, - 所得一覧, condition=対象人物.has_role(世帯.親))
        控除対象者である = (所得降順 == 0) * 対象人物.has_role(世帯.親)
        控除対象者の配偶者である = (所得降順 == 1) * 対象人物.has_role(世帯.親)
        控除対象者の所得 = 所得一覧 * 控除対象者である
        # NOTE: 異なる人物に対する値であるため、人物ではなく世帯ごとに集計（でないと「控除対象者の所得」と要素がずれてしまい計算できない)
        控除対象者の配偶者の所得 = 対象人物.世帯.sum(所得一覧 * 控除対象者の配偶者である)

        控除対象者の所得区分 = np.select(
            [控除対象者の所得 <= 9000000,
             (控除対象者の所得 > 9000000) * (控除対象者の所得 <= 9500000),
             (控除対象者の所得 > 9500000) * (控除対象者の所得 <= 10000000)],
            list(range(3)),
            -1).astype(int)

        控除対象者の配偶者の所得区分 = np.select(
            [控除対象者の配偶者の所得 <= 480000],
            [0],
            -1).astype(int)

        対象所得区分に該当する = (控除対象者の所得区分 != -1) * (控除対象者の配偶者の所得区分 != -1)  # 控除条件

        # NOTE: その年の12/31時点の年齢を参照
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word5
        該当年12月31日 = period(f"{対象期間.start.year}-12-31")
        該当年12月31日の年齢一覧 = 対象人物("年齢", 該当年12月31日)
        控除対象者の配偶者の年齢 = 該当年12月31日の年齢一覧 * 控除対象者の配偶者である
        # NOTE: 自分ではない人物についての計算のため、世帯で計算（でないと要素がずれてしまい計算できない）
        配偶者が老人控除対象である = 対象人物.世帯.sum(控除対象者の配偶者の年齢 >= 70)
        老人控除対象配偶者控除額 = 老人控除対象配偶者_配偶者控除額表()[控除対象者の配偶者の所得区分, 控除対象者の所得区分]

        通常配偶者控除額 = 配偶者控除額表()[控除対象者の配偶者の所得区分, 控除対象者の所得区分]

        配偶者控除額 = np.logical_not(配偶者が老人控除対象である) * 通常配偶者控除額 + 配偶者が老人控除対象である * 老人控除対象配偶者控除額

        配偶者がいる = 対象人物.世帯.sum(対象人物.has_role(世帯.親)) == 2  # 控除条件

        return 控除対象者である * 配偶者がいる * 対象所得区分に該当する * 配偶者控除額


class 住民税配偶者特別控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税における配偶者特別控除"
    reference = "https://www.city.hiroshima.lg.jp/soshiki/26/202040.html"
    documentation = """
    所得税における控除額とはことなるので注意（金額が異なるだけで条件は同じ）。
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加。
    """

    def formula(対象人物, 対象期間, _parameters):
        # 所得が高いほうが控除を受ける対象となる
        所得一覧 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, - 所得一覧, condition=対象人物.has_role(世帯.親))
        控除対象者である = (所得降順 == 0) * 対象人物.has_role(世帯.親)
        控除対象者の配偶者である = (所得降順 == 1) * 対象人物.has_role(世帯.親)
        控除対象者の所得 = 所得一覧 * 控除対象者である
        # NOTE: 異なる人物に対する値であるため、人物ではなく世帯ごとに集計（でないと「控除対象者の所得」と要素がずれてしまい計算できない)
        控除対象者の配偶者の所得 = 対象人物.世帯.sum(所得一覧 * 控除対象者の配偶者である)

        控除対象者の所得区分 = np.select(
            [控除対象者の所得 <= 9000000,
             (控除対象者の所得 > 9000000) * (控除対象者の所得 <= 9500000),
             (控除対象者の所得 > 9500000) * (控除対象者の所得 <= 10000000)],
            list(range(3)),
            -1).astype(int)

        控除対象者の配偶者の所得区分 = np.select(
            [(控除対象者の配偶者の所得 > 480000) * (控除対象者の配偶者の所得 <= 1000000),
             (控除対象者の配偶者の所得 > 1000000) * (控除対象者の配偶者の所得 <= 1050000),
             (控除対象者の配偶者の所得 > 1050000) * (控除対象者の配偶者の所得 <= 1100000),
             (控除対象者の配偶者の所得 > 1100000) * (控除対象者の配偶者の所得 <= 1150000),
             (控除対象者の配偶者の所得 > 1150000) * (控除対象者の配偶者の所得 <= 1200000),
             (控除対象者の配偶者の所得 > 1200000) * (控除対象者の配偶者の所得 <= 1250000),
             (控除対象者の配偶者の所得 > 1250000) * (控除対象者の配偶者の所得 <= 1300000),
             (控除対象者の配偶者の所得 > 1300000) * (控除対象者の配偶者の所得 <= 1330000)],
            list(range(8)),
            -1).astype(int)

        対象所得区分に該当する = (控除対象者の所得区分 != -1) * (控除対象者の配偶者の所得区分 != -1)  # 控除条件

        配偶者がいる = 対象人物.世帯.sum(対象人物.has_role(世帯.親)) == 2  # 控除条件

        return 控除対象者である * 配偶者がいる * 対象所得区分に該当する * 配偶者特別控除額表()[控除対象者の配偶者の所得区分, 控除対象者の所得区分]


class 住民税扶養控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "住民税における扶養控除"
    reference = "https://www.town.hinode.tokyo.jp/0000000519.html"
    documentation = """
    所得税における控除額とはことなるので注意（金額が異なるだけで条件は同じ）。
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加。
    """

    def formula(対象人物, 対象期間, parameters):
        扶養親族である = 対象人物("扶養親族である", 対象期間)

        # NOTE: その年の12/31時点の年齢を参照
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word5
        該当年12月31日 = period(f"{対象期間.start.year}-12-31")
        年齢 = 対象人物("年齢", 該当年12月31日)

        控除対象扶養親族である = 扶養親族である * (年齢 >= 16)

        特定扶養親族である = 控除対象扶養親族である * (年齢 >= 19) * (年齢 < 23)
        老人扶養親族である = 控除対象扶養親族である * (年齢 >= 70)

        # NOTE: 入院中の親族は同居扱いだが老人ホーム等への入居は除く
        # TODO: 「同居していない親族」も世帯内で扱うようになったら同居老親かどうかの判定追加
        介護施設入所中 = 対象人物("介護施設入所中", 対象期間)
        同居している老人扶養親族である = 老人扶養親族である * np.logical_not(介護施設入所中)
        同居していない老人扶養親族である = 老人扶養親族である * 介護施設入所中

        # NOTE: np.selectのcondlistは最初に該当した条件で計算される
        扶養控除額 = np.select(
            [特定扶養親族である,
             同居している老人扶養親族である,
             同居していない老人扶養親族である,
             控除対象扶養親族である],
            [parameters(対象期間).住民税.扶養控除_特定扶養親族,
             parameters(対象期間).住民税.扶養控除_老人扶養親族_同居老親等,
             parameters(対象期間).住民税.扶養控除_老人扶養親族_同居老親等以外の者,
             parameters(対象期間).住民税.扶養控除_一般],
            0)

        所得 = 対象人物("所得", 対象期間)
        所得降順 = 対象人物.get_rank(対象人物.世帯, -所得)
        # NOTE: 便宜上所得が最も多い世帯員が扶養者であるとする
        扶養者である = 所得降順 == 0

        return 扶養者である * 対象人物.世帯.sum(扶養控除額)


class 住民税基礎控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税における基礎控除"
    reference = "https://www.city.yokohama.lg.jp/kurashi/koseki-zei-hoken/zeikin/y-shizei/kojin-shiminzei-kenminzei/kaisei/R3zeiseikaisei.html"

    def formula(対象世帯, 対象期間, _parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)

        return np.select(
            [世帯高所得 <= 24000000,
             (世帯高所得 > 24000000) * (世帯高所得 <= 24500000),
             (世帯高所得 > 24500000) * (世帯高所得 <= 25000000)],
            [430000,
             290000,
             150000],
            0)


class 控除後住民税世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税計算において、各種控除が適用された後の世帯高所得額"
    reference = "https://www.town.hinode.tokyo.jp/0000000516.html"

    def formula(対象世帯, 対象期間, _parameters):
        # TODO: 社会保険料を追加
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        配偶者控除一覧 = 対象世帯.members("住民税配偶者控除", 対象期間)
        配偶者控除 = 対象世帯.sum(配偶者控除一覧)
        配偶者特別控除一覧 = 対象世帯.members("住民税配偶者特別控除", 対象期間)
        配偶者特別控除 = 対象世帯.sum(配偶者特別控除一覧)
        扶養控除一覧 = 対象世帯.members("住民税扶養控除", 対象期間)
        扶養控除 = 対象世帯.sum(扶養控除一覧)
        障害者控除一覧 = 対象世帯.members("住民税障害者控除", 対象期間)
        障害者控除 = 対象世帯.sum(障害者控除一覧)
        ひとり親控除一覧 = 対象世帯.members("住民税ひとり親控除", 対象期間)
        ひとり親控除 = 対象世帯.sum(ひとり親控除一覧)
        寡婦控除一覧 = 対象世帯.members("住民税寡婦控除", 対象期間)
        寡婦控除 = 対象世帯.sum(寡婦控除一覧)
        勤労学生控除一覧 = 対象世帯.members("住民税勤労学生控除", 対象期間)
        勤労学生控除 = 対象世帯.sum(勤労学生控除一覧)
        基礎控除 = 対象世帯("住民税基礎控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する

        総控除額 = 配偶者控除 + 配偶者特別控除 + 扶養控除 + 障害者控除 + \
            ひとり親控除 + 寡婦控除 + 勤労学生控除 + 基礎控除

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(世帯高所得 - 総控除額, 0.0, None)


class 住民税非課税世帯(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "住民税非課税世帯か否か（東京23区で所得割と均等割両方が非課税になる世帯）"
    reference = "https://financial-field.com/tax/entry-173575"

    # 市町村の級地により住民税均等割における非課税限度額が異なる
    # https://www.soumu.go.jp/main_content/000758656.pdf

    def formula(対象世帯, 対象期間, _parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        世帯人数 = 対象世帯("世帯人数", 対象期間)
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)

        級地区分倍率 = np.select([居住級地区分1 == 1, 居住級地区分1 == 2, 居住級地区分1 == 3],
                         [1, 0.9, 0.8],
            1)

        加算額 = np.select([世帯人数 == 1, 世帯人数 > 1],
                        [0, 210000 * 級地区分倍率],
                        0)

        return 世帯高所得 <= (350000 * 級地区分倍率 * 世帯人数 + 100000 + 加算額)


class 人的控除額の差(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "所得税と住民税の控除の差額"
    reference = "https://money-bu-jpx.com/news/article043882/"
    documentation = """
    差額計算には一部例外あり
    例外についての詳細は https://www.town.hinode.tokyo.jp/0000000519.html も参考になる
    """

    def formula(対象世帯, 対象期間, _parameters):
        障害者控除差額 = 対象世帯.sum(対象世帯.members("障害者控除", 対象期間) - 対象世帯.members("住民税障害者控除", 対象期間))
        寡婦控除一覧 = 対象世帯.members("寡婦控除", 対象期間)
        住民税寡婦控除一覧 = 対象世帯.members("住民税寡婦控除", 対象期間)
        寡婦控除差額 = 対象世帯.sum(寡婦控除一覧 - 住民税寡婦控除一覧)
        勤労学生控除一覧 = 対象世帯.members("勤労学生控除", 対象期間)
        住民税勤労学生控除一覧 = 対象世帯.members("住民税勤労学生控除", 対象期間)
        勤労学生控除差額 = 対象世帯.sum(勤労学生控除一覧 - 住民税勤労学生控除一覧)
        配偶者控除一覧 = 対象世帯.members("配偶者控除", 対象期間)
        住民税配偶者控除一覧 = 対象世帯.members("住民税配偶者控除", 対象期間)
        配偶者控除差額 = 対象世帯.sum(配偶者控除一覧 - 住民税配偶者控除一覧)
        配偶者特別控除一覧 = 対象世帯.members("配偶者特別控除", 対象期間)
        住民税配偶者特別控除一覧 = 対象世帯.members("住民税配偶者特別控除", 対象期間)
        配偶者特別控除差額 = 対象世帯.sum(配偶者特別控除一覧 - 住民税配偶者特別控除一覧)
        扶養控除差額 = 対象世帯.sum(対象世帯.members("扶養控除", 対象期間) - 対象世帯.members("住民税扶養控除", 対象期間))

        # NOTE: 以下は実際の差額とは異なる計算式を使用 https://www.town.hinode.tokyo.jp/0000000519.html
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        基礎控除差額 = np.where(世帯高所得 <= 25000000, 50000, 0)

        通常ひとり親控除差額一覧 = 対象世帯.members("ひとり親控除", 対象期間)
        住民税通常ひとり親控除差額一覧 = 対象世帯.members("住民税ひとり親控除", 対象期間)
        通常ひとり親控除差額 = 対象世帯.sum(通常ひとり親控除差額一覧 - 住民税通常ひとり親控除差額一覧)
        # ひとり親（父）の場合のみ差額が異なる
        性別一覧 = 対象世帯.members("性別", 対象期間)
        親である = 対象世帯.has_role(世帯.親)
        父親がいる = 対象世帯.sum((性別一覧 == 性別パターン.男性) * 親である)
        ひとり親父世帯である = (対象世帯.nb_persons(世帯.親) == 1) * 父親がいる

        ひとり親控除差額 = np.logical_not(ひとり親父世帯である) * 通常ひとり親控除差額 + (通常ひとり親控除差額 > 0) * ひとり親父世帯である * 10000

        return 障害者控除差額 + 寡婦控除差額 + 勤労学生控除差額 + 配偶者控除差額 + 配偶者特別控除差額 + 扶養控除差額 + 基礎控除差額 + ひとり親控除差額


class 調整控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "調整控除"
    reference = "https://money-bu-jpx.com/news/article043882/"
    documentation = """
    所得税と住民税の控除の差額（一部例外あり）
    例外についての詳細は https://www.town.hinode.tokyo.jp/0000000519.html も参考になる
    """

    def formula(対象世帯, 対象期間, parameters):
        人的控除額の差 = 対象世帯("人的控除額の差", 対象期間)
        # 個人住民税の課税所得金額に相当
        控除後住民税世帯高所得 = 対象世帯("控除後住民税世帯高所得", 対象期間)
        控除後住民税世帯高所得と人的控除額の差の小さい方 =\
            控除後住民税世帯高所得 * (控除後住民税世帯高所得 < 人的控除額の差) + 人的控除額の差 * (控除後住民税世帯高所得 >= 人的控除額の差)

        控除額 = np.select(
            [控除後住民税世帯高所得 <= 2000000,
             (控除後住民税世帯高所得 > 2000000) * (控除後住民税世帯高所得 < 25000000)],
            [控除後住民税世帯高所得と人的控除額の差の小さい方 * 0.05,
             (人的控除額の差 - (控除後住民税世帯高所得 - 2000000)) * 0.05],
            0)

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(控除額, 0.0, None)
