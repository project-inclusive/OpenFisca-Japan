"""
生活保護の実装
"""

import csv

import numpy as np

from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯
from openfisca_core.indexed_enums import Enum


# TODO: issue#45 で作成した「openfisca_japan/parameters/福祉/生活保護」以下の設定ファイルを
# グローバル名前空間で読み込む
# NOTE: 各種基準額表は項目数が多いため可読性の高いCSV形式やjson形式としている。
# https://www.mhlw.go.jp/content/000776372.pdf を参照

with open('openfisca_japan/parameters/福祉/生活保護/生活扶助基準額/第1類1.csv') as f:
    reader = csv.reader(f)
    # TODO: dict型等に変換して扱いやすいようにする

# TODO: 逓減率, 冬季加算, ...


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

        # 【Ａ】 (「生活扶助基準（第１類＋第２類）①×0.855」又は「生活扶助基準（第１類＋第２類）②」のいずれか高い方)＋生活扶助本体における経過的加算
        生活扶助基準1 = 対象世帯("生活扶助基準1", 対象期間)
        生活扶助基準2 = 対象世帯("生活扶助基準2", 対象期間)
        生活扶助本体における経過的加算 = 対象世帯("生活扶助本体における経過的加算", 対象期間)
        a = np.max([生活扶助基準1 * 0.855, 生活扶助基準2]) + 生活扶助本体における経過的加算

        # 【Ｂ】加算額
        障害者加算額 = 対象世帯("障害者加算額", 対象期間)
        母子加算額 = 対象世帯("母子加算額", 対象期間)
        児童を養育する場合の加算額 = 対象世帯("児童を養育する場合の加算額", 対象期間)
        母子世帯等に係る経過的加算 = 対象世帯("母子世帯等に係る経過的加算", 対象期間)
        児童を養育する場合に係る経過的加算 = 対象世帯("児童を養育する場合に係る経過的加算", 対象期間)
        # 障害者加算と母子加算は併給できない（参考：https://www.mhlw.go.jp/content/000776372.pdf）
        # 高い方のみ加算（参考：https://www.ace-room.jp/safetynet/safetyqa/safety-add/）
        b = np.max([障害者加算額, 母子加算額]) + 児童を養育する場合の加算額 + 母子世帯等に係る経過的加算 + 児童を養育する場合に係る経過的加算

        # TODO: その他加算
        # 必要な入力情報もvariableで定義する
        # openfisca_japan/variables/障害/精神障害者保健福祉手帳.py, openfisca_japan/variables/所得.py の学生のようにenumやboolで定義
        # https://seikatsuhogo.biz/blogs/105
        # 放射線障害者加算
        # 妊産婦加算
        # 児童養育加算
        # 介護施設入所者加算
        # 在宅患者加算

        # TODO: 期末一時扶助
        # https://seikatsuhogo.biz/blogs/61
        # 対象期間が12月の時のみ支給

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

        # 以上のステップで出した最低生活費から月収と各種手当額を引いた額が給付される
        # 参考: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/seikatuhogo/index.html
        最低生活費 = a + b + c + d + e + f
        収入 = np.sum(対象世帯.members("収入", 対象期間))
        月収 = 収入 / 12
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
        # TODO: 生活扶助基準（第1類+第2類）①
        # グローバル名前空間で読み込んだ基準額①をもとに、
        # 世帯の居住級地区分と世帯員ごとの年齢から基準額①を算出し、世帯員分を合計する
        # 世帯人数と居住級地区分から算出した逓減率①をかける
        # 生活扶助基準（第２類）①を算出し加算する
        # 冬季加算を加える
        return 0


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
        # TODO: 生活扶助基準（第1類+第2類）②
        # グローバル名前空間で読み込んだ基準額②をもとに、
        # 世帯の居住級地区分と世帯員ごとの年齢から基準額②を算出し、世帯員分を合計する
        # 世帯人数と居住級地区分から算出した逓減率②をかける
        # 生活扶助基準（第２類）②を算出し加算する
        # 冬季加算を加える
        return 0


class 生活扶助本体における経過的加算(Variable):
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
        # TODO: 生活扶助本体に係る経過的加算
        return 0


class 障害者加算額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "障害者に関する加算額"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 障害者加算
        # https://www.mhlw.go.jp/content/000776372.pdf 1ページ目右上を参照
        # 障害者手帳等級の取得方法は openfisca_japan/variables/福祉/育児/障害児福祉手当.py を参照
        return 0


class 母子加算額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "母子世帯等に関する加算額（父子世帯も対象）"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO:
        # https://www.mhlw.go.jp/content/000776372.pdf 1ページ目右上を参照
        # 父子世帯も対象となるため、「対象世帯.nb_persons(世帯.配偶者) == 0」をもとに判定
        return 0


class 児童を養育する場合の加算額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "児童を養育する場合の加算額"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO:
        # https://www.mhlw.go.jp/content/000776372.pdf 1ページ目右上を参照
        return 0


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
        # TODO: 「母子世帯等」に係る経過的加算
        # https://www.mhlw.go.jp/content/000776372.pdf 2ページ目右上を参照
        return 0


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
        # TODO: 「児童を養育する場合に係る経過的加算」に係る経過的加算
        # https://www.mhlw.go.jp/content/000776372.pdf 2ページ目右上を参照
        return 0


class 住宅扶助基準(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "住宅扶助基準"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 住宅扶助基準の加算
        # 算出できるのは上限額だが、額が大きいため加算する
        # http://kobekoubora.life.coocan.jp/2021juutakufujo.pdf 参照
        # p.4~6までの市に居住している場合はp.4~6を適用
        # それ以外の市区町村に居住している場合はp.1~3を適用
        # 母子家庭や障害、病気などで特定の病院の近くに住む必要があるといった場合には、特別加算分が計上される場合もあるが、
        # 判定条件不明のため一旦無視
        # （参考：https://www.chintai.net/news/2021/02/09/109515/）
        return 0


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
        # TODO: 教育扶助基準、高等学校等就学費の加算
        # https://www.mhlw.go.jp/content/000776372.pdf 1ページ目右を参照
        return 0


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
        # TODO: 教育扶助基準、高等学校等就学費の加算
        # https://www.mhlw.go.jp/content/000776372.pdf 1ページ目右を参照
        return 0


class 介護扶助基準(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "介護扶助基準"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 実装
        return 0


class 医療扶助基準(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "医療扶助基準"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 実装
        return 0


class 冬季加算(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "冬季加算"
    reference = "https://www.mhlw.go.jp/content/000776372.pdf"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/content/12002000/000771098.pdf
    https://www.holos.jp/media/welfare-amount-of-money.php
    https://www.wam.go.jp/wamappl/bb16GS70.nsf/0/573310120867b50d4925743c00047cb4/$FILE/20080501_1shiryou5_1.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        # TODO: 冬季加算
        # 参考:https://www.mhlw.go.jp/file/05-Shingikai-12601000-Seisakutoukatsukan-Sanjikanshitsu_Shakaihoshoutantou/26102103_6.pdf
        # openfisca_japan/variables/住居.py の「居住都道府県」から地区別(I~VI区)を判定
        # 対象期間が4~10月（I, II区は5~9月）の場合は0円。それ以外の月は以下を算出する（参考：https://seikatsuhogo.biz/blogs/105）
        # 地区別, 世帯人員, 居住級地区分から冬季加算を算出する 
        return 0
