"""
特別障害者手当の実装
"""

import numpy as np
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 特別障害者手当_最大(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "特別障害者手当の最大額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/tokubetsu.html"
    documentation = """
    厳密な判定には詳細な症状が必要なため、身体障害者手帳、精神障害者保健福祉手帳等から推定可能な最小値、最大値を算出

    算出方法は以下リンクも参考になる。
    https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/toku_shou.html
    """

    def formula(対象世帯, 対象期間, parameters):
        年齢 = 対象世帯.members("年齢", 対象期間)
        年齢条件 = 年齢 >= 20

        身体障害者手帳等級 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級 = 対象世帯.members("精神障害者保健福祉手帳等級", 対象期間)
        愛の手帳等級 = 対象世帯.members("愛の手帳等級", 対象期間)
        療育手帳等級 = 対象世帯.members("療育手帳等級", 対象期間)

        # 身体障害者手帳2級以上、療育手帳（愛の手帳）2度以上または精神障害者保健福祉手帳1級相当の障害が重複していることが条件のため
        # いずれかを持っている場合は最大値を満額とする
        # https://www.atgp.jp/knowhow/oyakudachi/c5943/
        身体障害条件 = (身体障害者手帳等級 == 身体障害者手帳等級パターン.一級) + (身体障害者手帳等級 == 身体障害者手帳等級パターン.二級)
        # NOTE: 療育手帳、愛の手帳いずれを指定した場合も該当するよう判定（療育手帳Aが愛の手帳1度~2度に相当）
        # https://www.rease.e.u-tokyo.ac.jp/read/jp/archive/statistics/leaf11031504p04.pdf
        知的障害条件 = ((愛の手帳等級 == 愛の手帳等級パターン.一度) + (愛の手帳等級 == 愛の手帳等級パターン.二度)
            + (療育手帳等級 == 療育手帳等級パターン.A))
        精神障害条件 = 精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.一級

        障害条件 = 身体障害条件 + (精神障害条件 + 知的障害条件)

        所得条件 = 対象世帯.members("特別障害者手当所得制限", 対象期間)

        # TODO: 介護施設以外の施設に入所中の場合も考慮する
        # 3か月以上継続して入院している場合のみ対象外となるため、最小額では「入院中」条件を参照せず満額とする
        入院入所条件 = np.logical_not(対象世帯.members("介護施設入所中", 対象期間))

        人物ごとの受給条件 = 年齢条件 * 障害条件 * 所得条件 * 入院入所条件
        対象人数 = 対象世帯.sum(人物ごとの受給条件)

        return 対象人数 * parameters(対象期間).福祉.特別障害者手当.支給額


class 特別障害者手当_最小(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "特別障害者手当の最小額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/tokubetsu.html"
    documentation = """
    厳密な判定には詳細な症状が必要なため、身体障害者手帳、精神障害者保健福祉手帳等から推定可能な最小値、最大値を算出

    算出方法は以下リンクも参考になる。
    https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/toku_shou.html
    https://h-navi.jp/column/article/35029230
    """

    def formula(対象世帯, 対象期間, parameters):
        年齢 = 対象世帯.members("年齢", 対象期間)
        年齢条件 = 年齢 >= 20

        身体障害者手帳等級 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級 = 対象世帯.members("精神障害者保健福祉手帳等級", 対象期間)
        愛の手帳等級 = 対象世帯.members("愛の手帳等級", 対象期間)
        療育手帳等級 = 対象世帯.members("療育手帳等級", 対象期間)

        # 身体障害者手帳2級以上、療育手帳（愛の手帳）2度以上または精神障害者保健福祉手帳1級相当の障害が重複していることが条件のため
        # いずれかを持っている場合は最大値を満額とする
        # https://www.atgp.jp/knowhow/oyakudachi/c5943/
        身体障害条件 = (身体障害者手帳等級 == 身体障害者手帳等級パターン.一級) + (身体障害者手帳等級 == 身体障害者手帳等級パターン.二級)
        # NOTE: 療育手帳、愛の手帳いずれを指定した場合も該当するよう判定（療育手帳Aが愛の手帳1度~2度に相当）
        # https://www.rease.e.u-tokyo.ac.jp/read/jp/archive/statistics/leaf11031504p04.pdf
        知的障害条件 = ((愛の手帳等級 == 愛の手帳等級パターン.一度) + (愛の手帳等級 == 愛の手帳等級パターン.二度)
            + (療育手帳等級 == 療育手帳等級パターン.A))
        精神障害条件 = 精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.一級

        障害条件 = 身体障害条件 * (精神障害条件 + 知的障害条件)

        所得条件 = 対象世帯.members("特別障害者手当所得制限", 対象期間)

        # TODO: 介護施設以外の施設に入所中の場合も考慮する
        入院入所条件 = np.logical_not(対象世帯.members("入院中", 対象期間) + 対象世帯.members("介護施設入所中", 対象期間))

        人物ごとの受給条件 = 年齢条件 * 障害条件 * 所得条件 * 入院入所条件
        対象人数 = 対象世帯.sum(人物ごとの受給条件)

        return 対象人数 * parameters(対象期間).福祉.特別障害者手当.支給額


class 特別障害者手当所得制限(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "特別障害者手当の所得制限"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/tokubetsu.html"
    documentation = """
    算出方法は以下リンクも参考になる。
    https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/toku_shou.html
    """

    def formula(対象人物, 対象期間, parameters):
        特別障害者手当 = parameters(対象期間).福祉.特別障害者手当
        扶養人数 = 対象人物.世帯("扶養人数", 対象期間)
        # 複数世帯入力(2以上の長さのndarray入力)対応のためndarray化
        本人所得を参照する場合の所得制限限度額 = np.array(特別障害者手当.所得制限限度額.本人)[np.clip(扶養人数, 0, 9)]
        扶養義務者所得を参照する場合の所得制限限度額 = np.array(特別障害者手当.所得制限限度額.扶養義務者)[np.clip(扶養人数, 0, 9)]

        # 加算額を考慮
        # NOTE: += は使用不可（Variableの破壊的変更により正しく計算されない）
        本人所得を参照する場合の所得制限限度額 = \
            本人所得を参照する場合の所得制限限度額 + 対象人物.世帯("特別障害者手当_受給者の所得加算額", 対象期間)
        扶養義務者所得を参照する場合の所得制限限度額 = \
            扶養義務者所得を参照する場合の所得制限限度額 + (扶養人数 >= 2) * 対象人物.世帯("特別障害者手当_扶養義務者の所得加算額", 対象期間)

        本人の控除後所得 = 対象人物("特別障害者手当の控除後所得_本人所得", 対象期間)
        # 便宜上、世帯の最大の所得を扶養義務者の所得とする
        扶養義務者の控除後所得 = 対象人物.世帯.max(対象人物("特別障害者手当の控除後所得_扶養義務者所得", 対象期間))

        # NOTE: 本人所得の場合は限度額以下、扶養義務者所得の場合は限度額より少ない場合に支給
        本人の所得制限 = 本人の控除後所得 <= 本人所得を参照する場合の所得制限限度額
        扶養義務者の所得制限 = 扶養義務者の控除後所得 < 扶養義務者所得を参照する場合の所得制限限度額

        return 本人の所得制限 * 扶養義務者の所得制限


class 特別障害者手当の控除後所得_扶養義務者所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "各種控除が適用された後の特別障害者手当における世帯高所得額（扶養義務者所得を計算する場合）"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/toku_shou.html"

    def formula(対象人物, 対象期間, parameters):
        # TODO: 障害年金実装時に所得に加算する
        # (障害年金、遺族年金等の公的年金も所得に加算される)
        所得 = 対象人物("所得", 対象期間)

        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        社会保険料控除 = parameters(対象期間).所得.社会保険料相当額

        # 上限33万円
        配偶者特別控除 = np.clip(対象人物("配偶者特別控除", 対象期間), 0, 330000)

        障害者控除 = 対象人物("障害者控除", 対象期間)
        寡婦控除 = 対象人物("寡婦控除", 対象期間)
        ひとり親控除 = 対象人物("ひとり親控除", 対象期間)
        勤労学生控除 = 対象人物("勤労学生控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する
        控除総額 = 給与所得及び雑所得からの控除額 + 社会保険料控除 + 配偶者特別控除 + 障害者控除 + 寡婦控除 + ひとり親控除 + 勤労学生控除
        控除後所得 = 所得 - 控除総額

        return 控除後所得


class 特別障害者手当の控除後所得_本人所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "各種控除が適用された後の特別障害者手当における世帯高所得額（本人所得を計算する場合）"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/toku_shou.html"

    def formula(対象人物, 対象期間, parameters):
        # TODO: 障害年金実装時に所得に加算する
        # (障害年金、遺族年金等の公的年金も所得に加算される)
        所得 = 対象人物("所得", 対象期間)

        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額

        # 本人所得に対しては社会保険料控除0円で計算される
        社会保険料控除 = 0
        # 上限33万円
        配偶者特別控除 = np.clip(対象人物("配偶者特別控除", 対象期間), 0, 330000)

        障害者控除 = 対象人物("障害者控除", 対象期間)

        # 本人所得の場合、障害者控除, 特別障害者控除については0円で計算
        障害者控除対象 = 対象人物("障害者控除対象", 対象期間)
        特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間)
        本人分の障害者控除 = np.select(
            [障害者控除対象, 特別障害者控除対象],
            [parameters(対象期間).所得.障害者控除額, parameters(対象期間).所得.特別障害者控除額],
            0)
        # 本人分の障害者控除、特別障害者控除は0円で計算される
        障害者控除 = np.clip(障害者控除 - 本人分の障害者控除, 0, None)

        # TODO: 同居特別障害者の場合も通常の特別障害者と同じ額に補正する必要がある？
        # 単純に記載を省略しているだけの可能性もあり (https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/toku_shou.html で国の制度を照会しているが同居特別障害者の記載はない)

        寡婦控除 = 対象人物("寡婦控除", 対象期間)
        ひとり親控除 = 対象人物("ひとり親控除", 対象期間)
        勤労学生控除 = 対象人物("勤労学生控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する
        控除総額 = 給与所得及び雑所得からの控除額 + 社会保険料控除 + 配偶者特別控除 + 障害者控除 + 寡婦控除 + ひとり親控除 + 勤労学生控除
        控除後所得 = 所得 - 控除総額

        return 控除後所得


class 特別障害者手当_受給者の所得加算額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "特別障害者手当_受給者の所得加算額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/tokubetsu.html"

    def formula(対象世帯, 対象期間, parameters):
        年齢 = 対象世帯.members("年齢", 対象期間)
        # 同一生計配偶者のうち70歳以上の者
        同一生計配偶者である = 対象世帯.members("同一生計配偶者である", 対象期間)
        配偶者が70歳以上 = 年齢 >= 70
        配偶者70歳以上の人数 = 対象世帯.sum(同一生計配偶者である * 配偶者が70歳以上)

        扶養親族である = 対象世帯.members("扶養親族である", 対象期間)

        # 老人扶養親族
        老人扶養親族である = 扶養親族である * (年齢 >= 70)
        老人扶養親族の人数 = 対象世帯.sum(老人扶養親族である)

        # 特定扶養親族又は控除対象扶養親族（19歳未満の者に限る。）
        # 特定扶養親族と控除対象扶養親族の定義: https://www.nta.go.jp/taxes/shiraberu/taxanswer/yogo/senmon.htm#word9
        # TODO: 特定扶養親族と控除対象扶養親族をvariableに切り出す
        特定扶養親族である = 扶養親族である * (年齢 >= 19) * (年齢 < 23)
        控除対象扶養親族である = 扶養親族である * (年齢 >= 16)
        特定扶養親族又は控除対象扶養親族である = 特定扶養親族である + (控除対象扶養親族である * (年齢 < 19))
        特定扶養親族又は控除対象扶養親族の人数 = 対象世帯.sum(特定扶養親族又は控除対象扶養親族である)

        所得制限限度額 = parameters(対象期間).福祉.特別障害者手当.所得制限限度額
        老人扶養親族加算額 = (配偶者70歳以上の人数 + 老人扶養親族の人数) * 所得制限限度額.本人_老人扶養親族加算額
        特定扶養親族加算額 = 特定扶養親族又は控除対象扶養親族の人数 * 所得制限限度額.本人_特定扶養親族加算額

        return 老人扶養親族加算額 + 特定扶養親族加算額


class 特別障害者手当_扶養義務者の所得加算額(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "特別障害者手当_扶養義務者の所得加算額"
    reference = "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/tokubetsu.html"

    def formula(対象世帯, 対象期間, parameters):
        年齢 = 対象世帯.members("年齢", 対象期間)

        # 老人扶養親族
        老人扶養親族である = 対象世帯.members("扶養親族である", 対象期間) * (年齢 >= 70)
        老人扶養親族の人数 = 対象世帯.sum(老人扶養親族である)

        # 老人扶養親族以外の人数
        老人扶養親族以外の扶養親族の人数 = 対象世帯.sum(対象世帯.members("扶養親族である", 対象期間) * (np.logical_not(老人扶養親族である)))

        # 老人扶養親族のみの場合、1人を除いた人数を加算
        # それ以外の場合、老人扶養親族の人数を加算
        加算人数 = np.where(老人扶養親族以外の扶養親族の人数 == 0, 老人扶養親族の人数 - 1, 老人扶養親族の人数)

        return 加算人数 * parameters(対象期間).福祉.特別障害者手当.所得制限限度額.扶養義務者_老人扶養親族加算額
