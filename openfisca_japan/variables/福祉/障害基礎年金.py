"""
特別障害者手当の実装
"""

import numpy as np
from openfisca_core.periods import DAY, instant
from openfisca_core.variables import Variable
from openfisca_japan.entities import 世帯, 人物
from openfisca_japan.variables.全般 import 高校生学年
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン
from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級パターン


class 障害基礎年金_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "障害基礎年金の最大額"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"
    documentation = """
    保険料納付済期間の条件（納付条件）については、利用者の回答負荷が高いため考慮せずに計算している。

    障害者手帳等級と障害基礎年金の等級には互換性がないため、最大値、最小額として幅を持たせて計算
    https://www.iizuka-nenkin.net/14097085633831
    """

    def formula(対象世帯, 対象期間, parameters):
        # NOTE: 幅を持たせて結果を算出しているため、回答負荷の高い初診日については考慮しない
        # (条件としては 初診日のときの年齢 < 65)

        # NOTE: 障害認定日の条件は回答負荷が高いため、過去の障害認定日と現在の障害が同様であると仮定して計算
        # ただし、障害認定日が20歳未満の場合20歳になってから支給が始まるため年齢条件のみ考慮
        年齢 = 対象世帯.members("年齢", 対象期間)
        年齢条件 = 年齢 >= 20

        支給額 = parameters(対象期間).福祉.障害基礎年金.支給額

        誕生年月日 = 対象世帯.members("誕生年月日", 対象期間)
        支給額変更日 = instant("1956-04-02").date
        一級の支給額 = np.select([誕生年月日 >= 支給額変更日],
            [支給額.支給額_一級_昭和三一年度以降],
            支給額.支給額_一級_昭和三〇年度以前)
        二級の支給額 = np.select([誕生年月日 >= 支給額変更日],
            [支給額.支給額_二級_昭和三一年度以降],
            支給額.支給額_二級_昭和三〇年度以前)

        障害等級 = 対象世帯.members("障害基礎年金_等級_最大", 対象期間)
        年金額 = np.select([障害等級 == 1, 障害等級 == 2],
            [一級の支給額, 二級の支給額],
            0)

        子の加算額 = 対象世帯("障害基礎年金の子の加算額_最大", 対象期間)

        # NOTE: 年金額が0円出ない場合のみ加算額を足したいため、障害等級を改めて条件に指定
        障害条件 = (障害等級 == 1) + (障害等級 == 2)
        支給条件 = 年齢条件 * 障害条件

        # 月額に直すため12か月で割る
        # NOTE: 子の加算額は世帯単位のため、支給条件を満たす世帯員が1人でもいる場合は加算する
        return (対象世帯.sum(支給条件 * 年金額) + 対象世帯.any(支給条件) * 子の加算額) / 12


class 障害基礎年金_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "障害基礎年金の最小額"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"
    documentation = """
    保険料納付済期間の条件（納付条件）については、利用者の回答負荷が高いため考慮せずに計算している。

    障害者手帳等級と障害基礎年金の等級には互換性がないため、最大値、最小額として幅を持たせて計算
    https://www.iizuka-nenkin.net/14097085633831
    """

    def formula(対象世帯, 対象期間, parameters):
        # NOTE: 幅を持たせて結果を算出しているため、回答負荷の高い初診日については考慮しない
        # (条件としては 初診日のときの年齢 < 65)

        # NOTE: 障害認定日の条件は回答負荷が高いため、過去の障害認定日と現在の障害が同様であると仮定して計算
        # ただし、障害認定日が20歳未満の場合20歳になってから支給が始まるため年齢条件のみ考慮
        年齢 = 対象世帯.members("年齢", 対象期間)
        年齢条件 = 年齢 >= 20

        支給額 = parameters(対象期間).福祉.障害基礎年金.支給額

        誕生年月日 = 対象世帯.members("誕生年月日", 対象期間)
        支給額変更日 = instant("1956-04-02").date
        一級の支給額 = np.select([誕生年月日 >= 支給額変更日],
            [支給額.支給額_一級_昭和三一年度以降],
            支給額.支給額_一級_昭和三〇年度以前)
        二級の支給額 = np.select([誕生年月日 >= 支給額変更日],
            [支給額.支給額_二級_昭和三一年度以降],
            支給額.支給額_二級_昭和三〇年度以前)

        障害等級 = 対象世帯.members("障害基礎年金_等級_最小", 対象期間)
        年金額 = np.select([障害等級 == 1, 障害等級 == 2],
            [一級の支給額, 二級の支給額],
            0)

        子の加算額 = 対象世帯("障害基礎年金の子の加算額_最小", 対象期間)

        # NOTE: 年金額が0円出ない場合のみ加算額を足したいため、障害等級を改めて条件に指定
        障害条件 = (障害等級 == 1) + (障害等級 == 2)
        支給条件 = 年齢条件 * 障害条件

        # 月額に直すため12か月で割る
        # NOTE: 子の加算額は世帯単位のため、支給条件を満たす世帯員が1人でもいる場合は加算する
        return (対象世帯.sum(支給条件 * 年金額) + 対象世帯.any(支給条件) * 子の加算額) / 12


class 障害基礎年金_等級_最大(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "障害基礎年金の障害等級の最大値"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"
    documentation = """
    障害者手帳等級と障害基礎年金の等級には互換性がないため、手帳等級から年金の等級を幅を持たせて推定
    https://www.iizuka-nenkin.net/14097085633831

    すでに受給していないと等級は分からないため、直接利用者が入力する形式にはしない
    該当しない場合は0とする
    """

    def formula(対象人物, 対象期間, _parameters):
        身体障害者手帳等級 = 対象人物("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級 = 対象人物("精神障害者保健福祉手帳等級", 対象期間)
        愛の手帳等級 = 対象人物("愛の手帳等級", 対象期間)
        療育手帳等級 = 対象人物("療育手帳等級", 対象期間)

        # 障害等級の条件（障害の程度2級以上）
        # NOTE: 障害者手帳等級と障害基礎年金の等級には互換性がないため、該当しうる手帳等級の最小値を用いて計算

        # 身体障害者手帳等級4級「音声又は言語機能に著しい障害を有するもの」→障害基礎年金2級
        # 身体障害者手帳等級3級「両下肢を足関節以上で欠くもの」→ 障害基礎年金1級
        # 障害基礎年金: https://www.nenkin.go.jp/service/jukyu/shougainenkin/ninteikijun/tokyuhyo.html
        # 身体障害者手帳: https://www.jsh-japan.jp/cordiale-farm/column/3122/#techo2
        一級の身体障害条件 = (身体障害者手帳等級 == 身体障害者手帳等級パターン.一級) +\
            (身体障害者手帳等級 == 身体障害者手帳等級パターン.二級) +\
            (身体障害者手帳等級 == 身体障害者手帳等級パターン.三級)
        二級の身体障害条件 = (身体障害者手帳等級 == 身体障害者手帳等級パターン.四級)

        # 精神障害者手帳の1~2級: 障害年金とほぼ同じ基準
        # https://www.iizuka-nenkin.net/14097085633831
        一級の精神障害条件 = 精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.一級
        二級の精神障害条件 = 精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.二級

        # 療育手帳（愛の手帳）中度: 障害基礎年金1級~2級の可能性を検討
        # https://www.nenkin.go.jp/service/jukyu/shougainenkin/ninteikijun/20160715.files/A.pdf
        # https://hyogo-osaka-shogai.com/wp/chiteki-2
        一級の知的障害条件 = (愛の手帳等級 == 愛の手帳等級パターン.一度) +\
            (愛の手帳等級 == 愛の手帳等級パターン.二度) +\
            (愛の手帳等級 == 愛の手帳等級パターン.三度) +\
            (療育手帳等級 == 療育手帳等級パターン.A) +\
            (療育手帳等級 == 療育手帳等級パターン.B)

        障害等級 = np.select([
            一級の身体障害条件 + 一級の精神障害条件 + 一級の知的障害条件,
            二級の身体障害条件 + 二級の精神障害条件],
            [1, 2],
            0)
        return 障害等級


class 障害基礎年金_等級_最小(Variable):
    value_type = int
    entity = 人物
    definition_period = DAY
    label = "障害基礎年金の障害等級の最小値"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"
    documentation = """
    障害者手帳等級と障害基礎年金の等級には互換性がないため、手帳等級から年金の等級を幅を持たせて推定
    https://www.iizuka-nenkin.net/14097085633831

    すでに受給していないと等級は分からないため、直接利用者が入力する形式にはしない
    該当しない場合は0とする
    """

    def formula(対象人物, 対象期間, _parameters):
        # 障害等級の条件（障害の程度2級以上）
        # NOTE: 障害者手帳等級と障害基礎年金の等級には互換性がないため、比較的対応がとれている精神障害者手帳以外は最小額0円とする
        精神障害者保健福祉手帳等級 = 対象人物("精神障害者保健福祉手帳等級", 対象期間)

        # 精神障害者手帳の1~2級: 障害年金とほぼ同じ基準
        # https://www.iizuka-nenkin.net/14097085633831
        一級の精神障害条件 = 精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.一級
        二級の精神障害条件 = 精神障害者保健福祉手帳等級 == 精神障害者保健福祉手帳等級パターン.二級

        障害等級 = np.select([一級の精神障害条件, 二級の精神障害条件],
            [1, 2],
            0)
        return 障害等級


class 障害基礎年金の子の加算額_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "障害基礎年金の子の加算額の最大額"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"

    def formula(対象世帯, 対象期間, parameters):
        対象児童人数 = 対象世帯("障害基礎年金の対象児童人数_最大", 対象期間)

        支給額 = parameters(対象期間).福祉.障害基礎年金.支給額

        # 複数世帯入力(2以上の長さのndarray入力)対応のためndarray化
        return np.select([対象児童人数 <= 2, 対象児童人数 > 2],
            [支給額.子の加算額_二人目まで * 対象児童人数,
             支給額.子の加算額_二人目まで * 2 + 支給額.子の加算額_三人目以降 * (対象児童人数 - 2)],
            0)


class 障害基礎年金の子の加算額_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "障害基礎年金の子の加算額の最小額"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"

    def formula(対象世帯, 対象期間, parameters):
        対象児童人数 = 対象世帯("障害基礎年金の対象児童人数_最小", 対象期間)

        支給額 = parameters(対象期間).福祉.障害基礎年金.支給額

        # 複数世帯入力(2以上の長さのndarray入力)対応のためndarray化
        return np.select([対象児童人数 <= 2, 対象児童人数 > 2],
            [支給額.子の加算額_二人目まで * 対象児童人数,
             支給額.子の加算額_二人目まで * 2 + 支給額.子の加算額_三人目以降 * (対象児童人数 - 2)],
            0)


class 障害基礎年金の対象児童人数_最大(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "障害基礎年金の対象児童人数の最大値"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"
    documentation = """
    障害等級の算出に幅があるため、対象人数も最大、最小で算出
    """

    def formula(対象世帯, 対象期間, _parameters):
        障害等級 = 対象世帯.members("障害基礎年金_等級_最大", 対象期間)
        子である = 対象世帯.has_role(世帯.子)
        年齢 = 対象世帯.members("年齢", 対象期間)
        二十歳未満で障害等級二級以上の子 = 子である * (年齢 < 20) * ((障害等級 == 1) + (障害等級 == 2))

        # NOTE: 入力情報では誕生年月日が分からないため学年を使った計算で代替
        # （18歳になった後の最初の3月31日までの子）
        学年 = 対象世帯.members("学年", 対象期間)
        十八歳以下の子 = 子である * (学年 <= 高校生学年.三年生.value)

        return 対象世帯.sum(十八歳以下の子 + 二十歳未満で障害等級二級以上の子)


class 障害基礎年金の対象児童人数_最小(Variable):
    value_type = int
    entity = 世帯
    definition_period = DAY
    label = "障害基礎年金の対象児童人数の最小値"
    reference = "https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150514.html"
    documentation = """
    障害等級の算出に幅があるため、対象人数も最大、最小で算出
    """

    def formula(対象世帯, 対象期間, _parameters):
        障害等級 = 対象世帯.members("障害基礎年金_等級_最小", 対象期間)
        子である = 対象世帯.has_role(世帯.子)
        年齢 = 対象世帯.members("年齢", 対象期間)
        # 障害等級は数字が小さいほど等級が高い
        二十歳未満で障害等級二級以上の子 = 子である * (年齢 < 20) * ((障害等級 == 1) + (障害等級 == 2))

        # NOTE: 入力情報では誕生年月日が分からないため学年を使った計算で代替
        # （18歳になった後の最初の3月31日までの子）
        学年 = 対象世帯.members("学年", 対象期間)
        十八歳以下の子 = 子である * (学年 <= 高校生学年.三年生.value)

        return 対象世帯.sum(十八歳以下の子 + 二十歳未満で障害等級二級以上の子)
