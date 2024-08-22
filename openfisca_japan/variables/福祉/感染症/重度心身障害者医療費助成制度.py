"""
重度心身障害者医療費助成制度の実装
"""

from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 重度心身障害者医療費助成制度の対象者がいる(Variable):
    value_type = bool
    entity = 世帯
    definition_period = DAY
    label = "重度心身障害者医療費助成制度の対象者がいるか否か"
    reference = "https://pap-net.jp/medical_bills/subsidy/"

    def formula(対象世帯, 対象期間, _parameters):
        重度心身障害者医療費助成制度の対象者である = 対象世帯.members("重度心身障害者医療費助成制度の対象者である", 対象期間)
        return 対象世帯.sum(重度心身障害者医療費助成制度の対象者である)


class 重度心身障害者医療費助成制度の対象者である(Variable):
    value_type = bool
    entity = 人物
    definition_period = DAY
    label = "重度心身障害者医療費助成制度の対象者である可能性があるか否か"
    reference = "https://pap-net.jp/medical_bills/subsidy/"
    documentation = """
    都道府県によって条件や助成額が異なるため、対象か否かのみ計算
    居住地に対応した条件確認はせず、いずれかの都道府県の条件に該当する場合はTrueとする

    （参考）
    東京都: https://www.fukushi.metro.tokyo.lg.jp/seikatsu/josei/marusyo.html
    千葉県: https://www.pref.chiba.lg.jp/shoufuku/service/iryou/juudo.html
    埼玉県: https://www.pref.saitama.lg.jp/a0702/jyuudo.html
    山梨県: https://www.pref.yamanashi.jp/shogai-fks/judo/jidoukanpu-ikou.html
    """

    def formula(対象人物, 対象期間, _parameters):
        年齢 = 対象人物("年齢", 対象期間)
        身体障害者手帳等級 = 対象人物("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級 = 対象人物("精神障害者保健福祉手帳等級", 対象期間)
        愛の手帳等級 = 対象人物("愛の手帳等級", 対象期間)
        療育手帳等級 = 対象人物("療育手帳等級", 対象期間)
        障害基礎年金_等級_最大 = 対象人物("障害基礎年金_等級_最大", 対象期間)

        身体障害条件 = (身体障害者手帳等級 == 身体障害者手帳等級パターン.一級) +\
            (身体障害者手帳等級 == 身体障害者手帳等級パターン.二級) +\
            (身体障害者手帳等級 == 身体障害者手帳等級パターン.三級)
        知的障害条件 = (愛の手帳等級 == 愛の手帳等級パターン.一度) +\
            (愛の手帳等級 == 愛の手帳等級パターン.二度) +\
            (療育手帳等級 == 療育手帳等級パターン.A) +\
            (療育手帳等級 == 療育手帳等級パターン.B)
        精神障害条件 = (精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.一級) +\
            (精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.二級)

        # https://www.pref.saitama.lg.jp/a0702/jyuudo.html
        # 後期高齢者医療制度の障害認定を受けている方
        # (上記の障害条件に含まれない条件を追加)
        # https://www.saitama-koukikourei.org/seido/taisho/hihokensya/
        後期高齢者医療制度の障害認定年齢条件 = (年齢 >= 65) * (年齢 <= 74)
        後期高齢者医療制度の障害認定基準 = (身体障害者手帳等級 == 身体障害者手帳等級パターン.四級) +\
            (障害基礎年金_等級_最大 == 1) +\
            (障害基礎年金_等級_最大 == 2)
        障害認定条件 = 後期高齢者医療制度の障害認定年齢条件 * 後期高齢者医療制度の障害認定基準

        return 身体障害条件 + 知的障害条件 + 精神障害条件 + 障害認定条件
