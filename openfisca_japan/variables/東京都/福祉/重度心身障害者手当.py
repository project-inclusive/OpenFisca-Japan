"""
重度心身障害者手当の実装
"""

import numpy as np

from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン



class 重度心身障害者手当_最大(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "重度心身障害者手当の最大額"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/juudo.html"
    documentation = """
    東京都の制度
    厳密な判定には詳細な症状が必要なため、愛の手帳等級、身体障害者手帳等から推定可能な最小値、最大値を算出

    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/file/06-Seisakujouhou-12200000-Shakaiengokyokushougaihokenfukushibu/0000172197.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        年齢 = 対象世帯.members("年齢", 対象期間)
        年齢条件 = 年齢 < 65

        愛の手帳等級 = 対象世帯.members("愛の手帳等級", 対象期間)
        身体障害者手帳等級 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        # 該当する可能性のある条件
        一号要件 = (愛の手帳等級 == 愛の手帳等級パターン.一度) | (愛の手帳等級 == 愛の手帳等級パターン.二度)
        二号要件 = ((愛の手帳等級 == 愛の手帳等級パターン.一度) | (愛の手帳等級 == 愛の手帳等級パターン.二度)) & \
            ((身体障害者手帳等級 == 身体障害者手帳等級パターン.一級) | (身体障害者手帳等級 == 身体障害者手帳等級パターン.二級))
        三号要件 = 身体障害者手帳等級 == 身体障害者手帳等級パターン.一級
        障害条件 = 一号要件 | 二号要件 | 三号要件

        所得条件 = 対象世帯.members("重度心身障害者手当所得制限", 対象期間)

        受給条件 = 年齢条件 & 障害条件 & 所得条件
        対象人数 = np.count_nonzero(受給条件)

        return 対象人数 * parameters(対象期間).東京都.福祉.重度心身障害者手当.重度心身障害者手当額


class 重度心身障害者手当_最小(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "重度心身障害者手当の最小額"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/juudo.html"
    documentation = """
    東京都の制度
    厳密な判定には詳細な症状が必要なため、愛の手帳等級、身体障害者手帳等から推定可能な最小値、最大値を算出

    算出方法は以下リンクも参考になる。
    https://www.mhlw.go.jp/file/06-Seisakujouhou-12200000-Shakaiengokyokushougaihokenfukushibu/0000172197.pdf
    """

    def formula(対象世帯, 対象期間, parameters):
        年齢 = 対象世帯.members("年齢", 対象期間)
        年齢条件 = 年齢 < 65

        愛の手帳等級 = 対象世帯.members("愛の手帳等級", 対象期間)
        身体障害者手帳等級 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        # 1号要件,3号要件は愛の手帳、身体障害者手帳のみでは該当しない可能性があるため最小額は0
        二号要件 = ((愛の手帳等級 == 愛の手帳等級パターン.一度) | (愛の手帳等級 == 愛の手帳等級パターン.二度)) & \
            ((身体障害者手帳等級 == 身体障害者手帳等級パターン.一級) | (身体障害者手帳等級 == 身体障害者手帳等級パターン.二級))
        障害条件 = 二号要件

        所得条件 = 対象世帯.members("重度心身障害者手当所得制限", 対象期間)

        受給条件 = 年齢条件 & 障害条件 & 所得条件
        対象人数 = np.count_nonzero(受給条件)

        return 対象人数 * parameters(対象期間).東京都.福祉.重度心身障害者手当.重度心身障害者手当額


class 重度心身障害者手当所得制限(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "重度心身障害者手当の所得制限"
    reference = "https://www.fukushi.metro.tokyo.lg.jp/shinsho/teate/juudo.html"

    def formula(対象人物, 対象期間, parameters):
        重度心身障害者手当 = parameters(対象期間).東京都.福祉.重度心身障害者手当
        扶養人数 = 対象人物.世帯("扶養人数", 対象期間)[0]
        所得制限限度額 = 重度心身障害者手当.所得制限限度額[np.clip(扶養人数, 0, 5)]

        所得 = 対象人物("所得", 対象期間)
        # 便宜上、世帯の最大の所得を扶養義務者の所得とする
        扶養義務者の所得 = 対象人物.世帯("世帯高所得", 対象期間)
        年齢 = 対象人物("年齢", 対象期間)
        # 20歳未満の場合扶養義務者、20歳以上の場合本人の所得を参照
        本人所得を参照 = 年齢[0] >= 20
        対象となる所得 = 所得 if 本人所得を参照 else 扶養義務者の所得

        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        社会保険料控除 = parameters(対象期間).所得.社会保険料相当額 if not 本人所得を参照 else 0
        配偶者特別控除 = 対象人物.世帯("配偶者特別控除", 対象期間)

        障害者控除 = 対象人物.世帯("障害者控除", 対象期間)
        # 障害者控除, 特別障害者控除については、本人所得の場合本人の分は適用しない
        if 本人所得を参照:
            障害者控除対象 = 対象人物("障害者控除対象", 対象期間)
            特別障害者控除対象 = 対象人物("特別障害者控除対象", 対象期間)
            本人の控除 = np.select(
                [障害者控除対象, 特別障害者控除対象],
                [parameters(対象期間).所得.障害者控除額, parameters(対象期間).所得.特別障害者控除額],
                0)
            障害者控除 = 障害者控除 - 本人の控除

        寡婦控除 = 対象人物.世帯("寡婦控除", 対象期間)
        ひとり親控除 = 対象人物.世帯("ひとり親控除", 対象期間)
        勤労学生控除 = 対象人物.世帯("勤労学生控除", 対象期間)

        # 他の控除（雑損控除・医療費控除等）は定額でなく実費を元に算出するため除外する
        控除総額 = 給与所得及び雑所得からの控除額 + 社会保険料控除 + 配偶者特別控除 + 障害者控除 + 寡婦控除 + ひとり親控除 + 勤労学生控除
        控除後所得 = 対象となる所得 - 控除総額

        return 控除後所得 <= 所得制限限度額
