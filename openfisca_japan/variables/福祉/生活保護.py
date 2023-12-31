"""
生活保護の実装
"""

import csv
import json
from collections import defaultdict
from functools import cache

import numpy as np

from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン
from openfisca_core.indexed_enums import Enum


# NOTE: 各種基準額表は項目数が多いため可読性の高いCSV形式やjson形式としている。
# https://www.mhlw.go.jp/content/000776372.pdf を参照


@cache
def 生活扶助基準1_第1類_基準額1表():
    with open('openfisca_japan/assets/福祉/生活保護/生活扶助基準額/第1類1.csv') as f:
        reader = csv.DictReader(f)
        # 生活扶助基準1_第1類_基準額1表()[年齢][居住級地区分] の形で参照可能
        return {row[""]: row for row in reader}


@cache
def 生活扶助基準1_逓減率1表():
    with open('openfisca_japan/assets/福祉/生活保護/生活扶助基準額/逓減率1.csv') as f:
        reader = csv.DictReader(f)
        # 生活扶助基準1_逓減率1表()[世帯人数][居住級地区分] の形で参照可能
        return {row[""]: row for row in reader}


@cache
def 生活扶助基準1_第2類_基準額1表():
    with open('openfisca_japan/assets/福祉/生活保護/生活扶助基準額/第2類1.csv') as f:
        reader = csv.DictReader(f)
        # 生活扶助基準1_第2類_基準額1表()[世帯人数][居住級地区分] の形で参照可能
        return {row[""]: row for row in reader}


@cache
def 生活扶助基準2_第1類_基準額2表():
    with open('openfisca_japan/assets/福祉/生活保護/生活扶助基準額/第1類2.csv') as f:
        reader = csv.DictReader(f)
        # 生活扶助基準2_第1類_基準額2表()[年齢][居住級地区分] の形で参照可能
        return {row[""]: row for row in reader}


@cache
def 生活扶助基準2_逓減率2表():
    with open('openfisca_japan/assets/福祉/生活保護/生活扶助基準額/逓減率2.csv') as f:
        reader = csv.DictReader(f)
        # 生活扶助基準2_逓減率2表()[世帯人数][居住級地区分] の形で参照可能
        return {row[""]: row for row in reader}


@cache
def 生活扶助基準2_第2類_基準額2表():
    with open('openfisca_japan/assets/福祉/生活保護/生活扶助基準額/第2類2.csv') as f:
        reader = csv.DictReader(f)
        # 生活扶助基準2_第2類_基準額2表()[世帯人数][居住級地区分] の形で参照可能
        return {row[""]: row for row in reader}


@cache
def 地域区分表():
    with open('openfisca_japan/assets/福祉/生活保護/冬季加算/地域区分.json') as f:
        d = json.load(f)
        # 地域区分表()[都道府県] の形で参照可能
        # 該当しないものはすべて6区
        地域区分表 = defaultdict(lambda: 6)
        for 区, values in d.items():
            for 都道府県 in values:
                # 区分の名称から数値のみ抽出
                地域区分表[都道府県] = int(区.replace("区", ""))
        return 地域区分表


@cache
def 冬季加算表():
    # 冬季加算表()[冬季加算地域区分][世帯人数][居住級地区分] の形で参照可能
    冬季加算表 = {}
    for i in range(1, 7):
        with open(f'openfisca_japan/assets/福祉/生活保護/冬季加算/{i}区.csv') as f:
            reader = csv.DictReader(f)
            冬季加算表[f'{i}区'] = {row[""]: row for row in reader}
    return 冬季加算表


@cache
def 市ごとの住宅扶助限度額():
    with open('openfisca_japan/assets/福祉/生活保護/住宅扶助基準額/市.csv') as f:
        reader = csv.DictReader(f)
        # 都道府県ごとの住宅扶助限度額()[市][世帯人員] の形で参照可能
        return {row["市"]: row for row in reader}


@cache
def 都道府県ごとの住宅扶助限度額():
    with open('openfisca_japan/assets/福祉/生活保護/住宅扶助基準額/都道府県.csv') as f:
        reader = csv.DictReader(f)
        # 都道府県ごとの住宅扶助限度額()[都道府県][居住級地区分1][世帯人員] の形で参照可能
        都道府県ごとの住宅扶助限度額 = {}
        for row in reader:
            if 都道府県ごとの住宅扶助限度額.get(row["都道府県"]) is None:
                都道府県ごとの住宅扶助限度額[row["都道府県"]] = {}
            都道府県ごとの住宅扶助限度額[row["都道府県"]][row["級地"]] = row
        return 都道府県ごとの住宅扶助限度額


@cache
def 生活扶助本体に係る経過的加算表():
    # 生活扶助本体に係る経過的加算表()[世帯人数][年齢][居住級地区分1] の形で参照可能
    生活扶助本体に係る経過的加算表 = {}
    for i in range(1, 6):
        with open(f'openfisca_japan/assets/福祉/生活保護/生活扶助本体に係る経過的加算/{i}人世帯.csv') as f:
            reader = csv.DictReader(f)
            生活扶助本体に係る経過的加算表[f'{i}人'] = {row[""]: row for row in reader}
    return 生活扶助本体に係る経過的加算表


@cache
def 母子世帯等に係る経過的加算表():
    # 母子世帯等に係る経過的加算表()[世帯人数][年齢][居住級地区分] の形で参照可能
    母子世帯等に係る経過的加算表 = {}

    with open('openfisca_japan/assets/福祉/生活保護/母子世帯等に係る経過的加算/3人世帯.csv') as f:
        reader = csv.DictReader(f)
        母子世帯等に係る経過的加算表[3] = {row[""]: row for row in reader}

    with open('openfisca_japan/assets/福祉/生活保護/母子世帯等に係る経過的加算/4人世帯.csv') as f:
        reader = csv.DictReader(f)
        母子世帯等に係る経過的加算表[4] = {row[""]: row for row in reader}

    with open('openfisca_japan/assets/福祉/生活保護/母子世帯等に係る経過的加算/5人世帯.csv') as f:
        reader = csv.DictReader(f)
        母子世帯等に係る経過的加算表[5] = {row[""]: row for row in reader}

    return 母子世帯等に係る経過的加算表


@cache
def 障害者加算表():
    with open('openfisca_japan/assets/福祉/生活保護/障害者加算.csv') as f:
        reader = csv.DictReader(f)
        # 障害者加算表()[等級][居住級地区分1] の形で参照可能
        return {row["等級"]: row for row in reader}


@cache
def 期末一時扶助表():
    with open('openfisca_japan/assets/福祉/生活保護/期末一時扶助.csv') as f:
        reader = csv.DictReader(f)
        # 期末一時扶助表()[世帯人数][居住級地区分] の形で参照可能
        return {row[""]: row for row in reader}


class 生活保護(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活保護"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        #居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)[0]
        #居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)[0]

        # 以下、必要なvariableを作成する。
        # 細かく作成した方が単体テストの数が少なくなるため楽。
        # 組み合わせたvariableは条件も組み合わせてテストするためテスト数が多くなる。

        # 【Ａ】 (「生活扶助基準（第１類＋第２類）①×0.855」又は「生活扶助基準（第１類＋第２類）②」のいずれか高い方)＋生活扶助本体に係る経過的加算
        生活扶助基準1 = 対象世帯("生活扶助基準1", 対象期間)
        生活扶助基準2 = 対象世帯("生活扶助基準2", 対象期間)
        生活扶助本体に係る経過的加算 = 対象世帯("生活扶助本体に係る経過的加算", 対象期間)
        a = np.max([生活扶助基準1 * 0.855, 生活扶助基準2]) + 生活扶助本体に係る経過的加算

        # 【Ｂ】加算
        障害者加算 = 対象世帯("障害者加算", 対象期間)
        母子加算 = 対象世帯("母子加算", 対象期間)
        児童を養育する場合の加算 = 対象世帯("児童を養育する場合の加算", 対象期間)
        母子世帯等に係る経過的加算 = 対象世帯("母子世帯等に係る経過的加算", 対象期間)
        児童を養育する場合に係る経過的加算 = 対象世帯("児童を養育する場合に係る経過的加算", 対象期間)
        放射線障害者加算 = 対象世帯("放射線障害者加算", 対象期間)
        妊産婦加算 = 対象世帯("妊産婦加算", 対象期間)
        介護施設入所者加算 = 対象世帯("介護施設入所者加算", 対象期間)
        在宅患者加算 = 対象世帯("在宅患者加算", 対象期間)

        # 障害者加算と母子加算は併給できない（参考：https://www.mhlw.go.jp/content/000776372.pdf）
        # 高い方のみ加算（参考：https://www.ace-room.jp/safetynet/safetyqa/safety-add/）
        b = np.max([障害者加算, 母子加算]) + 児童を養育する場合の加算 + 母子世帯等に係る経過的加算 + 児童を養育する場合に係る経過的加算 + \
            放射線障害者加算 + 妊産婦加算 + 介護施設入所者加算 + 在宅患者加算

        # 【Ｃ】住宅扶助基準
        住宅扶助基準 = 対象世帯("住宅扶助基準", 対象期間)
        c = 住宅扶助基準

        # 【Ｄ】教育扶助基準、高等学校等就学費
        教育扶助基準 = 対象世帯("教育扶助基準", 対象期間)
        高等学校等就学費 = 対象世帯("高等学校等就学費", 対象期間)
        d = 教育扶助基準 + 高等学校等就学費

        # NOTE: 介護費・医療費等その他の加算・扶助は実費のため計算せず、計算結果GUIの説明欄に記載
        # 【Ｅ】介護扶助基準
        e = 0.0
        # 【Ｆ】医療扶助基準
        f = 0.0

        期末一時扶助 = 対象世帯("期末一時扶助", 対象期間)

        # 以上のステップで出した最低生活費から月収と各種手当額を引いた額が給付される
        # 参考: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatuhogo/index.html
        最低生活費 = a + b + c + d + e + f + 期末一時扶助
        収入 = np.sum(対象世帯.members("収入", 対象期間))
        # 就労収入のうち一定額を控除
        勤労控除 = 対象世帯("勤労控除", 対象期間)
        月収 = np.clip(収入 / 12 - 勤労控除, 0, None)

        # TODO: 実装される手当てが増えるたびに追記しなくてもよい仕組みが必要？
        各種手当額 = 対象世帯("児童手当", 対象期間) + 対象世帯("児童育成手当", 対象期間) + 対象世帯("児童扶養手当_最小", 対象期間)

        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(最低生活費 - 月収 - 各種手当額, 0.0, None)


class 生活扶助基準1(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準（第1類+第2類）①"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        生活扶助基準1_第1類_基準額1 = 対象世帯("生活扶助基準1_第1類_基準額1", 対象期間)
        生活扶助基準1_逓減率1 = 対象世帯("生活扶助基準1_逓減率1", 対象期間)
        生活扶助基準1_第2類_基準額1 = 対象世帯("生活扶助基準1_第2類_基準額1", 対象期間)
        冬季加算 = 対象世帯("冬季加算", 対象期間)

        return 生活扶助基準1_第1類_基準額1 * 生活扶助基準1_逓減率1 + 生活扶助基準1_第2類_基準額1 + 冬季加算


class 生活扶助基準1_第1類_基準額1(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準(第1類) 基準額1"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        各世帯員の年齢 = 対象世帯.members("年齢", 対象期間)
        各世帯員の年齢区分 = [np.select(
            [年齢 >= 0 and 年齢 <= 2,
             年齢 >= 3 and 年齢 <= 5,
             年齢 >= 6 and 年齢 <= 11,
             年齢 >= 12 and 年齢 <= 17,
             年齢 >= 18 and 年齢 <= 19,
             年齢 >= 20 and 年齢 <= 40,
             年齢 >= 41 and 年齢 <= 59,
             年齢 >= 60 and 年齢 <= 64,
             年齢 >= 65 and 年齢 <= 69,
             年齢 >= 70 and 年齢 <= 74,
             年齢 >= 75],
            ["0~2", "3~5", "6~11", "12~17", "18~19", "20~40", "41~59", "60~64", "65~69", "70~74", "75~"],
            0) for 年齢 in 各世帯員の年齢]

        return sum([
            int(生活扶助基準1_第1類_基準額1表()[str(年齢区分)][居住級地区分]) for 年齢区分 in 各世帯員の年齢区分])


class 生活扶助基準1_逓減率1(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準 逓減率1"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        # 入院患者、施設入所者は世帯人数に含めない
        入院中 = 対象世帯.members("入院中", 対象期間)
        介護施設入所中 = 対象世帯.members("介護施設入所中", 対象期間)
        世帯人数 = 世帯人数 - np.count_nonzero(入院中 | 介護施設入所中)

        世帯人数区分 = np.clip(世帯人数, 1, 5).astype(str)

        return 生活扶助基準1_逓減率1表()[世帯人数区分[0]][居住級地区分]


class 生活扶助基準1_第2類_基準額1(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準(第2類) 基準額1"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        # 入院患者、施設入所者は世帯人数に含めない
        入院中 = 対象世帯.members("入院中", 対象期間)
        介護施設入所中 = 対象世帯.members("介護施設入所中", 対象期間)
        世帯人数 = 世帯人数 - np.count_nonzero(入院中 | 介護施設入所中)

        世帯人数区分 = np.clip(世帯人数, 1, 5).astype(str)

        return 生活扶助基準1_第2類_基準額1表()[世帯人数区分[0]][居住級地区分]


class 生活扶助基準2(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準（第1類+第2類）②"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        生活扶助基準2_第1類_基準額2 = 対象世帯("生活扶助基準2_第1類_基準額2", 対象期間)
        生活扶助基準2_逓減率2 = 対象世帯("生活扶助基準2_逓減率2", 対象期間)
        生活扶助基準2_第2類_基準額2 = 対象世帯("生活扶助基準2_第2類_基準額2", 対象期間)
        冬季加算 = 対象世帯("冬季加算", 対象期間)

        return 生活扶助基準2_第1類_基準額2 * 生活扶助基準2_逓減率2 + 生活扶助基準2_第2類_基準額2 + 冬季加算


class 生活扶助基準2_第1類_基準額2(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準(第1類) 基準額2"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        各世帯員の年齢 = 対象世帯.members("年齢", 対象期間)
        各世帯員の年齢区分 = [np.select(
            [年齢 >= 0 and 年齢 <= 2,
             年齢 >= 3 and 年齢 <= 5,
             年齢 >= 6 and 年齢 <= 11,
             年齢 >= 12 and 年齢 <= 17,
             年齢 >= 18 and 年齢 <= 19,
             年齢 >= 20 and 年齢 <= 40,
             年齢 >= 41 and 年齢 <= 59,
             年齢 >= 60 and 年齢 <= 64,
             年齢 >= 65 and 年齢 <= 69,
             年齢 >= 70 and 年齢 <= 74,
             年齢 >= 75],
            ["0~2", "3~5", "6~11", "12~17", "18~19", "20~40", "41~59", "60~64", "65~69", "70~74", "75~"],
            0) for 年齢 in 各世帯員の年齢]

        return sum([
            int(生活扶助基準2_第1類_基準額2表()[str(年齢区分)][居住級地区分]) for 年齢区分 in 各世帯員の年齢区分])


class 生活扶助基準2_逓減率2(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準 逓減率2"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        # 入院患者、施設入所者は世帯人数に含めない
        入院中 = 対象世帯.members("入院中", 対象期間)
        介護施設入所中 = 対象世帯.members("介護施設入所中", 対象期間)
        世帯人数 = 世帯人数 - np.count_nonzero(入院中 | 介護施設入所中)

        世帯人数区分 = np.clip(世帯人数, 1, 5).astype(str)

        return 生活扶助基準2_逓減率2表()[世帯人数区分[0]][居住級地区分]


class 生活扶助基準2_第2類_基準額2(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助基準(第2類) 基準額2"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        # 入院患者、施設入所者は世帯人数に含めない
        入院中 = 対象世帯.members("入院中", 対象期間)
        介護施設入所中 = 対象世帯.members("介護施設入所中", 対象期間)
        世帯人数 = 世帯人数 - np.count_nonzero(入院中 | 介護施設入所中)

        世帯人数区分 = np.clip(世帯人数, 1, 5).astype(str)

        return 生活扶助基準2_第2類_基準額2表()[世帯人数区分[0]][居住級地区分]


class 生活扶助本体に係る経過的加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活扶助本体に係る経過的加算"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        世帯人数 = 対象世帯("世帯人数", 対象期間)
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        各世帯員の年齢 = 対象世帯.members("年齢", 対象期間)
        各世帯員の年齢区分 = [np.select(
            [年齢 >= 0 and 年齢 <= 2,
             年齢 >= 3 and 年齢 <= 5,
             年齢 >= 6 and 年齢 <= 11,
             年齢 >= 12 and 年齢 <= 17,
             年齢 >= 18 and 年齢 <= 19,
             年齢 >= 20 and 年齢 <= 40,
             年齢 >= 41 and 年齢 <= 59,
             年齢 >= 60 and 年齢 <= 64,
             年齢 >= 65 and 年齢 <= 69,
             年齢 >= 70 and 年齢 <= 74,
             年齢 >= 75],
            ["0~2", "3~5", "6~11", "12~17", "18~19", "20~40", "41~59", "60~64", "65~69", "70~74", "75~"],
            0) for 年齢 in 各世帯員の年齢]
        世帯人数区分 = np.clip(世帯人数, 1, 5).astype(str)
        return sum([
            int(生活扶助本体に係る経過的加算表()[f'{世帯人数区分[0]}人'][str(年齢区分)][f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'])
            for 年齢区分 in 各世帯員の年齢区分])


class 障害者加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "障害者に関する加算"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        # 該当者(1級~3級)のみ抽出
        身体障害者手帳等級一覧 = 身体障害者手帳等級一覧[
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.一級) |
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.二級) |
            (身体障害者手帳等級一覧 == 身体障害者手帳等級パターン.三級)]

        return sum([int(障害者加算表()[str(等級)][f'{居住級地区分1[0]}級地']) for 等級 in 身体障害者手帳等級一覧])


class 母子加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "母子世帯等に関する加算（父子世帯も対象）"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        配偶者がいない = 対象世帯.nb_persons(世帯.親) == 1

        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)

        児童である = 対象世帯.members("児童", 対象期間)
        児童の人数 = 対象世帯.sum(児童である)

        if 居住級地区分1 == 1:
            return 配偶者がいない[0] * np.select(
                [児童の人数 == 1, 児童の人数 == 2, 児童の人数 >= 3],
                [18800, 23600, 23600 + 2900 * (児童の人数 - 2)],
                0)

        if 居住級地区分1 == 2:
            return 配偶者がいない[0] * np.select(
                [児童の人数 == 1, 児童の人数 == 2, 児童の人数 >= 3],
                [17400, 21800, 21800 + 2700 * (児童の人数 - 2)],
                0)

        if 居住級地区分1 == 3:
            return 配偶者がいない[0] * np.select(
                [児童の人数 == 1, 児童の人数 == 2, 児童の人数 >= 3],
                [16100, 20200, 20200 + 2500 * (児童の人数 - 2)],
                0)

        # この行には到達しない想定
        return 0


class 児童(Variable):
    value_type = bool
    entity = 人物
    default_value = False
    definition_period = DAY
    label = "児童かどうか"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象人物, 対象期間, parameters):
        # 児童とは、18歳になる日以後の最初の3月31日までの者
        年齢 = 対象人物("年齢", 対象期間)
        return np.select([年齢 < 18, 年齢 == 18, 年齢 > 18], [True, 対象期間.start.month <= 3, False], False)


class 児童を養育する場合の加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "児童を養育する場合の加算"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        児童である = 対象世帯.members("児童", 対象期間)
        児童の人数 = 対象世帯.sum(児童である)
        return 児童の人数 * 10190


class 母子世帯等に係る経過的加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "母子世帯等に係る経過的加算（父子世帯も対象）"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        子供である = 対象世帯.has_role(世帯.子)
        子供の人数 = 対象世帯.nb_persons(世帯.子)
        if 子供の人数 != 1:
            return 0

        年齢 = 対象世帯.members("年齢", 対象期間)
        # 子供の人数が1人であることは確認済み
        子供の年齢 = 年齢[子供である][0]

        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        # TODO: 表から年齢区分変換処理を組み立てる
        年齢区分 = None
        世帯人数 = 対象世帯("世帯人数", 対象期間)

        if 世帯人数 <= 2:
            return 0
        
        elif 世帯人数 == 3:
            年齢区分 = np.select(
            [子供の年齢 >= 0 and 子供の年齢 <= 5,
             子供の年齢 >= 6 and 子供の年齢 <= 11,
             子供の年齢 >= 12 and 子供の年齢 <= 14,
             子供の年齢 >= 15 and 子供の年齢 <= 17,
             子供の年齢 >= 18 and 子供の年齢 < 20],
            ["0~5", "6~11", "12~14", "15~17", "18~19"],
            None)

        elif 世帯人数 == 4:
            年齢区分 = np.select(
            [子供の年齢 >= 0 and 子供の年齢 <= 2,
             子供の年齢 >= 3 and 子供の年齢 <= 14,
             子供の年齢 >= 15 and 子供の年齢 <= 17,
             子供の年齢 >= 18 and 子供の年齢 < 20],
            ["0~2", "3~14", "15~17", "18~19"],
            None)

        else:  # 世帯人数が5人以上
            年齢区分 = np.select(
            [子供の年齢 >= 0 and 子供の年齢 <= 14,
             子供の年齢 >= 15 and 子供の年齢 <= 17,
             子供の年齢 >= 18 and 子供の年齢 < 20],
            ["0~14", "15~17", "18~19"],
            None)

        # 年齢が該当しない場合
        if 年齢区分 == None:
            return 0
        
        世帯人数区分 = np.clip(世帯人数[0], None, 5)

        配偶者がいない = 対象世帯.nb_persons(世帯.親) == 1

        return 配偶者がいない[0] * 母子世帯等に係る経過的加算表()[世帯人数区分][str(年齢区分)][居住級地区分]


class 入院中(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "入院しているか否か"


class 児童を養育する場合に係る経過的加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "児童を養育する場合に係る経過的加算"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # プライベートメソッドが使用できないため、別クラスに切り出し
        三人以下の世帯であって三歳未満の児童が入院している場合の経過的加算 = 対象世帯("三人以下の世帯であって三歳未満の児童が入院している場合の経過的加算", 対象期間)
        四人以上の世帯であって三歳未満の児童がいる場合の経過的加算 = 対象世帯("四人以上の世帯であって三歳未満の児童がいる場合の経過的加算", 対象期間)
        第三子以降の三歳から小学生修了前の児童がいる場合の経過的加算 = 対象世帯("第三子以降の三歳から小学生修了前の児童がいる場合の経過的加算", 対象期間)
        return (
            三人以下の世帯であって三歳未満の児童が入院している場合の経過的加算 +
            四人以上の世帯であって三歳未満の児童がいる場合の経過的加算 +
            第三子以降の三歳から小学生修了前の児童がいる場合の経過的加算
        )


class 三人以下の世帯であって三歳未満の児童が入院している場合の経過的加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "児童を養育する場合に係る経過的加算（３人以下の世帯であって、３歳未満の児童が入院している等の場合）"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        世帯人数 = 対象世帯("世帯人数", 対象期間)
        if 世帯人数 > 3:
            return 0
    
        各世帯員の年齢 = 対象世帯.members("年齢", 対象期間)
        各世帯員が3歳未満 = 各世帯員の年齢 < 3
        各世帯員が入院中 = 対象世帯.members("入院中", 対象期間)
        加算対象者数 = np.count_nonzero(各世帯員が3歳未満 & 各世帯員が入院中)
        return 加算対象者数 * 4330


class 四人以上の世帯であって三歳未満の児童がいる場合の経過的加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "児童を養育する場合に係る経過的加算（４人以上の世帯であって、３歳未満の児童がいる場合）"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        世帯人数 = 対象世帯("世帯人数", 対象期間)
        if 世帯人数 < 4:
            return 0
    
        各世帯員の年齢 = 対象世帯.members("年齢", 対象期間)
        各世帯員が3歳未満かどうか = 各世帯員の年齢 < 3
        加算対象者数 = np.count_nonzero(各世帯員が3歳未満かどうか)
        return 加算対象者数 * 4330


class 第三子以降の三歳から小学生修了前の児童がいる場合の経過的加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "児童を養育する場合に係る経過的加算（第３子以降の「３歳から小学生修了前」の児童がいる場合）"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        子の人数 = 対象世帯.nb_persons(世帯.子)
        if 子の人数 < 3:
            return 0
        
        子供である = 対象世帯.has_role(世帯.子)

        年齢 = 対象世帯.members("年齢", 対象期間)
        子供の年齢 = 年齢[子供である]
        子供の年齢の降順インデックス = np.argsort(子供の年齢)[::-1]

        第三子以降である = np.full(int(子の人数), True)
        # 第一子、第二子を除外
        第三子以降である[子供の年齢の降順インデックス[0]] = False
        第三子以降である[子供の年齢の降順インデックス[1]] = False

        三歳以上である = 子供の年齢 >= 3

        学年 = 対象世帯.members("学年", 対象期間)
        子供の学年 = 学年[子供である]
        小学生終了前である = 子供の学年 <= 6

        加算対象者数 = np.count_nonzero(第三子以降である & 三歳以上である & 小学生終了前である)
        return 加算対象者数 * 4330


class 放射線障害者パターン(Enum):
    __order__ = "無 現罹患者 元罹患者"
    無 = "無"
    現罹患者 = "現罹患者"
    元罹患者 = "元罹患者"


class 放射線障害(Variable):
    value_type = Enum
    possible_values = 放射線障害者パターン
    default_value = 放射線障害者パターン.無
    entity = 人物
    definition_period = DAY
    label = "放射線障害状況"


class 放射線障害者加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "放射線障害者加算"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://seikatsuhogo.biz/blogs/105
    """

    def formula(対象世帯, 対象期間, parameters):
        各世帯員の放射線障害 = 対象世帯.members("放射線障害", 対象期間)
        現罹患者の人数 = np.count_nonzero(各世帯員の放射線障害 == 放射線障害者パターン.現罹患者)
        元罹患者の人数 = np.count_nonzero(各世帯員の放射線障害 == 放射線障害者パターン.元罹患者)

        return 現罹患者の人数 * 43830 + 元罹患者の人数 * 21920


class 妊産婦パターン(Enum):
    __order__ = "無 妊娠6ヵ月未満 妊娠6ヵ月以上 産後6ヵ月以内"
    無 = "無"
    妊娠6ヵ月未満 = "妊娠6ヵ月未満"
    妊娠6ヵ月以上 = "妊娠6ヵ月以上"
    産後6ヵ月以内 = "産後6ヵ月以内"


class 妊産婦(Variable):
    value_type = Enum
    possible_values = 妊産婦パターン
    default_value = 妊産婦パターン.無
    entity = 人物
    definition_period = DAY
    label = "妊産婦の妊娠、産後状況"


class 妊産婦加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "妊産婦加算"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://seikatsuhogo.biz/blogs/105
    """

    def formula(対象世帯, 対象期間, parameters):
        妊産婦 = 対象世帯.members("妊産婦", 対象期間)
        妊娠6ヵ月未満の人数 = np.count_nonzero(妊産婦 == 妊産婦パターン.妊娠6ヵ月未満)
        妊娠6ヵ月以上の人数 = np.count_nonzero(妊産婦 == 妊産婦パターン.妊娠6ヵ月以上)
        産後6ヵ月以内の人数 = np.count_nonzero(妊産婦 == 妊産婦パターン.産後6ヵ月以内)

        return 妊娠6ヵ月未満の人数 * 9130 + 妊娠6ヵ月以上の人数 * 13790 + 産後6ヵ月以内の人数 * 8480


class 介護施設入所中(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "介護施設に入所しているか否か"


class 介護施設入所者加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "介護施設入所者加算"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://seikatsuhogo.biz/blogs/105
    """

    def formula(対象世帯, 対象期間, parameters):
        介護施設入所中 = 対象世帯.members("介護施設入所中", 対象期間)
        加算対象者数 = np.count_nonzero(介護施設入所中)
        return 加算対象者数 * 9880


class 在宅療養中(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "在宅で療養に専念している患者(結核又は3ヶ月以上の治療を要するもの)か否か"


class 在宅患者加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "在宅患者加算"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://seikatsuhogo.biz/blogs/105
    """

    def formula(対象世帯, 対象期間, parameters):
        各世帯員が在宅療養中 = 対象世帯.members("在宅療養中", 対象期間)
        加算対象者数 = np.count_nonzero(各世帯員が在宅療養中)
        return 加算対象者数 * 13270


class 住宅扶助基準(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住宅扶助基準"
    reference = "http://kobekoubora.life.coocan.jp/2021juutakufujo.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # 算出できるのは上限額だが、額が大きいため加算する
        # NOTE: 母子家庭や障害、病気などで特定の病院の近くに住む必要があるといった場合には、特別加算分が計上される場合もあるが、
        # 判定条件不明のため一旦無視
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        居住市区町村 = 対象世帯("居住市区町村", 対象期間)
        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        世帯人員区分 = np.select(
            [世帯人数 == 1, 世帯人数 == 2, 世帯人数 >= 3 and 世帯人数 <= 5, 世帯人数 == 6, 世帯人数 >= 7],
            ["1人", "2人", "3~5人", "6人", "7人以上"],
            "1人")

        # p.4~6までの市に居住している場合はp.4~6を適用
        if 市ごとの住宅扶助限度額().get(居住市区町村[0]):
            return 市ごとの住宅扶助限度額()[居住市区町村[0]][世帯人員区分[0]]

        # それ以外の市区町村に居住している場合はp.1~3を適用
        return 都道府県ごとの住宅扶助限度額()[居住都道府県[0]][f'{居住級地区分1[0]}級地'][世帯人員区分[0]]


class 教育扶助基準(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "教育扶助基準"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        学年一覧 = 対象世帯.members("学年", 対象期間)
        return sum([np.select([学年 >= 1 and 学年 <= 6, 学年 >= 7 and 学年 <= 9], [2600, 5100], 0) for 学年 in 学年一覧])


class 高等学校等就学費(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "高等学校等就学費"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        学年一覧 = 対象世帯.members("学年", 対象期間)
        return sum([np.where(学年 >= 10 and 学年 <= 12, 5300, 0) for 学年 in 学年一覧])


class 冬季加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "冬季加算"
    reference = "https://www.mhlw.go.jp/file/05-Shingikai-12601000-Seisakutoukatsukan-Sanjikanshitsu_Shakaihoshoutantou/26102103_6.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        冬季 = 対象世帯("冬季", 対象期間)
        if not 冬季:
            return 0

        冬季加算地域区分1 = 対象世帯("冬季加算地域区分1", 対象期間)

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        # 文字列形式で表現された区分に変換
        世帯人数区分 = np.where(世帯人数 >= 10, "10~", 世帯人数.astype(str))

        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        if 世帯人数区分[0] == "10~":
            # 9人の場合の加算に人数ごとの加算を追加
            return float(冬季加算表()[f'{冬季加算地域区分1[0]}区']["9"][居住級地区分]) + \
                (世帯人数[0] - 9) * float(冬季加算表()[f'{冬季加算地域区分1[0]}区']["10~"][居住級地区分])

        return float(冬季加算表()[f'{冬季加算地域区分1[0]}区'][世帯人数区分[0]][居住級地区分])


class 冬季加算地域区分1(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "冬季加算地域区分"
    reference = "https://www.mhlw.go.jp/file/05-Shingikai-12601000-Seisakutoukatsukan-Sanjikanshitsu_Shakaihoshoutantou/26102103_6.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        return 地域区分表()[居住都道府県[0]]


class 冬季(Variable):
    value_type = bool
    default_value = False
    entity = 世帯
    definition_period = DAY
    label = "冬季加算の対象となる期間内であるかどうか"
    reference = "https://www.mhlw.go.jp/file/05-Shingikai-12601000-Seisakutoukatsukan-Sanjikanshitsu_Shakaihoshoutantou/26102103_6.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://seikatsuhogo.biz/blogs/105
    """

    def formula(対象世帯, 対象期間, parameters):
        冬季加算地域区分1 = 対象世帯("冬季加算地域区分1", 対象期間)

        月 = 対象期間.date.month

        # 11~3月（I, II区は10~4月）を冬季とする
        if 冬季加算地域区分1 == 1 or 冬季加算地域区分1 == 2:
            return 月 <= 4 or 月 >= 10
        return 月 <= 3 or 月 >= 11


class 期末一時扶助(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "期末一時扶助"
    # TODO: 計算式について、官公庁の参考リンクも追加
    reference = "https://seikatsuhogo.biz/blogs/61"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # 対象期間が12月の時のみ支給
        月 = 対象期間.date.month
        if 月 != 12:
            return 0

        世帯人数 = 対象世帯("世帯人数", 対象期間)
        # 文字列形式で表現された区分に変換
        世帯人数区分 = np.where(世帯人数 >= 10, "10~", 世帯人数.astype(str))

        居住級地区分1 = 対象世帯("居住級地区分1", 対象期間)
        居住級地区分2 = 対象世帯("居住級地区分2", 対象期間)
        居住級地区分 = f'{居住級地区分1[0]}級地-{居住級地区分2[0]}'

        if 世帯人数区分[0] == "10~":
            # 9人の場合の加算に人数ごとの加算を追加
            return float(期末一時扶助表()["9"][居住級地区分]) + \
                (世帯人数[0] - 9) * float(期末一時扶助表()["10~"][居住級地区分])

        return 期末一時扶助表()[世帯人数区分[0]][居住級地区分]


class 勤労控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "勤労控除"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.holos.jp/media/welfare-income-earn.php
    """

    def formula(対象世帯, 対象期間, parameters):
        基礎控除 = 対象世帯("生活保護基礎控除", 対象期間)
        新規就労控除 = 対象世帯("新規就労控除", 対象期間)
        未成年者控除 = 対象世帯("未成年者控除", 対象期間)
        return 基礎控除 + 新規就労控除 + 未成年者控除


class 生活保護基礎控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "生活保護における基礎控除"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    所得税、住民税における基礎控除とは異なる。
    算出方法は以下リンクも参考になる。
    https://www.holos.jp/media/welfare-income-earn.php
    https://www.city.chiba.jp/hokenfukushi/hogo/documents/r3shinkijunngakuhyou.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 収入として年金等も入力するようになったら、勤労収入のみ計算対象に入れるようにする
        収入 = 対象世帯.members("収入", 対象期間)
        # 収入を高い順にソート
        収入 = np.sort(収入)[::-1]
        月収 = 収入 / 12

        一人目の控除 = np.clip((月収[0] - 15000) * 0.1 + 15000, 0, 月収[0])
        # 2人目以降の計算式は https://www.city.chiba.jp/hokenfukushi/hogo/documents/r3shinkijunngakuhyou.pdf の基礎控除表を参考に作成
        二人目以降の控除 = np.sum(np.clip(np.clip((月収[1:] - 41000) * 0.085, 0, None) + 14960 + np.clip(月収[1:] - 14960, 0, 40), 0, 月収[1:]))

        return 一人目の控除 + 二人目以降の控除


class 六か月以内に新規就労(Variable):
    value_type = bool
    default_value = False
    entity = 人物
    definition_period = DAY
    label = "6か月以内に新たに継続性のある職業に従事したかどうか"


class 新規就労控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "新規就労控除"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.holos.jp/media/welfare-income-earn.php
    https://www.mhlw.go.jp/stf/shingi/2r9852000001ifbg-att/2r9852000001ifii.pdf (額は現在と異なる部分あり)
    """

    def formula(対象世帯, 対象期間, parameters):
        六か月以内に新規就労 = 対象世帯.members("六か月以内に新規就労", 対象期間)
        対象者数 = np.count_nonzero(六か月以内に新規就労)
        return 対象者数 * 11700


class 未成年者控除(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "未成年者控除"
    reference = "https://www.mhlw.go.jp/content/12002000/000771098.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.holos.jp/media/welfare-income-earn.php
    https://www.mhlw.go.jp/stf/shingi/2r9852000001ifbg-att/2r9852000001ifii.pdf (額は現在と異なる部分あり)
    """

    def formula(対象世帯, 対象期間, parameters):
        未成年 = 対象世帯.members("年齢", 対象期間) < parameters(対象期間).全般.成人年齢
        # TODO: 収入として年金等も入力するようになったら、勤労収入のみ計算対象に入れるようにする
        就労中 = 対象世帯.members("収入", 対象期間) > 0
        対象者数 = np.count_nonzero(未成年 & 就労中)
        return 対象者数 * 11600
