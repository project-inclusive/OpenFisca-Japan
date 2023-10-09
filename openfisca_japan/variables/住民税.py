"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

import csv

import numpy as np

# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY, period
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 人物, 世帯


# NOTE: 項目数が多い金額表は可読性の高いCSV形式としている。
with open('openfisca_japan/parameters/住民税/配偶者特別控除額.csv') as f:
    reader = csv.DictReader(f)
    # 配偶者特別控除額表[配偶者の所得区分][納税者本人の所得区分] の形で参照可能
    配偶者特別控除額表 = {row[""]: row for row in reader}


class 住民税障害者控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税における障害者控除額"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加
    """

    def formula(対象世帯, 対象期間, parameters):
        特別障害者控除対象 = 対象世帯.members("特別障害者控除対象", 対象期間)
        障害者控除対象 = 対象世帯.members("障害者控除対象", 対象期間)

        # 障害者控除額は対象人数分が算出される
        # https://www.city.hirakata.osaka.jp/kosodate/0000000544.html
        特別障害者控除対象人数 = 対象世帯.sum(特別障害者控除対象)
        障害者控除対象人数 = 対象世帯.sum(障害者控除対象)

        特別障害者控除額 = parameters(対象期間).住民税.特別障害者控除額
        障害者控除額 = parameters(対象期間).住民税.障害者控除額
        
        return 特別障害者控除対象人数 * 特別障害者控除額 + 障害者控除対象人数 * 障害者控除額


class 住民税ひとり親控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税におけるひとり親控除額"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加
    """

    def formula_2020_01_01(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        # 児童扶養手当の対象と異なり、父母の遺棄・DV等は考慮しない
        # (参考：児童扶養手当 https://www.city.hirakata.osaka.jp/0000026828.html)
        対象ひとり親 = (対象世帯.nb_persons(世帯.配偶者) == 0) * (対象世帯.nb_persons(世帯.子) >= 1) 
        ひとり親控除額 = parameters(対象期間).住民税.ひとり親控除額
        ひとり親控除_所得制限額 = parameters(対象期間).住民税.ひとり親控除_所得制限額

        return ひとり親控除額 * 対象ひとり親 * (世帯高所得 < ひとり親控除_所得制限額)


class 住民税寡婦控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税における寡婦控除額"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加
    """

    def formula_2020_01_01(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        寡婦 = 対象世帯("寡婦", 対象期間)
        寡婦控除額 = parameters(対象期間).住民税.寡婦控除額
        寡婦控除_所得制限額 = parameters(対象期間).住民税.寡婦控除_所得制限額

        return 寡婦控除額 * 寡婦 * (世帯高所得 <= 寡婦控除_所得制限額)


class 住民税勤労学生控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税における勤労学生控除"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加
    """

    def formula(対象世帯, 対象期間, parameters):
        # 勤労学生控除額は対象人数によらず定額そう
        # https://www.city.hirakata.osaka.jp/kosodate/0000000544.html

        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        学生 = np.any(対象世帯.members("学生", 対象期間))
        勤労学生控除額 = parameters(対象期間).住民税.勤労学生控除額
        勤労学生_所得制限額 = parameters(対象期間).住民税.勤労学生_所得制限額
        所得条件 = (世帯高所得 > 0) * (世帯高所得 <= 勤労学生_所得制限額)

        return 所得条件 * 学生 * 勤労学生控除額


class 住民税配偶者特別控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税における配偶者特別控除"
    reference = "https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html#gaiyo_07"
    documentation = """
    所得税における控除額とはことなるので注意
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加
    """

    def formula(対象世帯, 対象期間, parameters):
        自分の所得 = 対象世帯.自分("所得", 対象期間)
        配偶者の所得 = 対象世帯.配偶者("所得", 対象期間)

        # 所得が高いほうが控除を受ける対象となる
        納税者の所得 = np.max([自分の所得[0], 配偶者の所得[0]])
        納税者の配偶者の所得 = np.min([自分の所得[0], 配偶者の所得[0]])

        納税者の所得区分 = np.select(
            [納税者の所得 <= 9000000, 納税者の所得 > 9000000 and 納税者の所得 <= 9500000, 納税者の所得 > 9500000 and 納税者の所得 <= 10000000],
            ["~9000000", "~9500000", "~10000000"],
            None)
        
        納税者の配偶者の所得区分 = np.select(
            [納税者の配偶者の所得 > 480000 and 納税者の配偶者の所得 <= 1000000,
             納税者の配偶者の所得 > 1000000 and 納税者の配偶者の所得 <= 1050000,
             納税者の配偶者の所得 > 1050000 and 納税者の配偶者の所得 <= 1100000,
             納税者の配偶者の所得 > 1100000 and 納税者の配偶者の所得 <= 1150000,
             納税者の配偶者の所得 > 1150000 and 納税者の配偶者の所得 <= 1200000,
             納税者の配偶者の所得 > 1200000 and 納税者の配偶者の所得 <= 1250000,
             納税者の配偶者の所得 > 1250000 and 納税者の配偶者の所得 <= 1300000,
             納税者の配偶者の所得 > 1300000 and 納税者の配偶者の所得 <= 1330000],
            ["~1000000",
             "~1050000",
             "~1100000",
             "~1150000",
             "~1200000",
             "~1250000",
             "~1300000",
             "~1330000"],
            None)

        if 納税者の所得区分 == None or 納税者の配偶者の所得区分 == None:
            # 該当しない場合
            return 0

        return 配偶者特別控除額表[str(納税者の配偶者の所得区分)][str(納税者の所得区分)]


class 住民税扶養控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住民税における扶養控除"
    reference = "https://www.town.hinode.tokyo.jp/0000000519.html"
    documentation = """
    所得税における控除額とはことなるので注意
    OpenFiscaではクラス名をアプリ全体で一意にする必要があるため、先頭に「住民税」を追加
    """

    def formula(対象世帯, 対象期間, parameters):
        扶養親族である = 対象世帯.members("扶養親族である", 対象期間)

        # NOTE: その年の12/31時点の年齢を参照
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word5
        該当年12月31日 = period(f'{対象期間.start.year}-12-31')
        年齢 = 対象世帯.members("年齢", 該当年12月31日)

        控除対象扶養親族である = 扶養親族である * (年齢 >= 16)

        特定扶養親族である = 控除対象扶養親族である * (年齢 >= 19) * (年齢 < 23)
        老人扶養親族である = 控除対象扶養親族である * (年齢 >= 70)

        # NOTE: 入院中の親族は同居扱いだが老人ホーム等への入居は除く
        # TODO: 「同居していない親族」も世帯内で扱うようになったら同居老親かどうかの判定追加
        介護施設入所中 = 対象世帯.members("介護施設入所中", 対象期間)
        同居している老人扶養親族である = 老人扶養親族である * np.logical_not(介護施設入所中)
        同居していない老人扶養親族である = 老人扶養親族である * 介護施設入所中
        
        # NOTE: np.selectのcondlistは最初に該当した条件で計算される
        扶養控除一覧 = np.select(
            [特定扶養親族である,
             同居している老人扶養親族である,
             同居していない老人扶養親族である,
             控除対象扶養親族である],
             [parameters(対象期間).住民税.扶養控除_特定扶養親族,
              parameters(対象期間).住民税.扶養控除_老人扶養親族_同居老親等,
              parameters(対象期間).住民税.扶養控除_老人扶養親族_同居老親等以外の者,
              parameters(対象期間).住民税.扶養控除_一般],
            0)
        
        return 対象世帯.sum(扶養控除一覧)


class 住民税非課税世帯(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "住民税非課税世帯か否か（東京23区で所得割と均等割両方が非課税になる世帯）"
    reference = "https://financial-field.com/tax/entry-173575"

    # 市町村の級地により住民税均等割における非課税限度額が異なる
    # https://www.soumu.go.jp/main_content/000758656.pdf

    def formula(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        世帯人数 = 対象世帯("世帯人数", 対象期間)         
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)[0]

        級地区分倍率 = np.select([居住級地区分1 == 1, 居住級地区分1 == 2, 居住級地区分1 == 3],
                         [1, 0.9, 0.8],
                         1)
        
        加算額 = np.select([世帯人数 == 1, 世帯人数 > 1],
                         [0, 210000 * 級地区分倍率],
                         0)

        return 世帯高所得 <= 350000 * 級地区分倍率 * 世帯人数 + 100000 + 加算額
