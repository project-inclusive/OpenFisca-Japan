"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

import numpy as np

# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.holders import set_input_divide_by_period
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 人物, 世帯

from openfisca_japan.variables.障害.身体障害者手帳 import 身体障害者手帳等級認定パターン
from openfisca_japan.variables.障害.療育手帳 import 療育手帳等級パターン
from openfisca_japan.variables.障害.愛の手帳 import 愛の手帳等級パターン
from openfisca_japan.variables.障害.精神障害者保健福祉手帳 import 精神障害者保健福祉手帳等級パターン



class 所得(Variable):
    # NOTE: 手当によって障害者控除や寡婦控除等の額を差し引く必要があるが、世帯情報が必要なため未実装
    value_type = float
    entity = 人物
    # NOTE: 所得自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare a 所得 for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の所得"

    def formula(対象人物, 対象期間, _parameters):
        # NOTE: 収入660万円未満の場合給与所得控除額ではなく「所得税法別表第五」から算出するため、実際の所得と最大1000円程度誤差が発生する
        # https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
        収入 = 対象人物("収入", 対象期間)
        給与所得控除額 = 対象人物("給与所得控除額", 対象期間)
        # 負の数にならないよう、0円未満になった場合は0円に補正
        return np.clip(収入 - 給与所得控除額, 0.0, None)


class 給与所得控除額(Variable):
    value_type = float
    entity = 人物
    # NOTE: Variable自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の収入に対する給与所得控除額"

    def formula_2020_01_01(対象人物, 対象期間, _parameters):
        収入 = 対象人物("収入", 対象期間)

        return np.select([収入 <= 1625000, 収入 <= 1800000, 収入 <= 3600000, 収入 <= 6600000, 収入 <= 8500000],
                         [float(550000), 収入 * 0.4 - 100000, 収入 * 0.3 + 80000, 収入 * 0.2 + 440000, 収入 * 0.1 + 1100000],
                         float(1950000))

    # TODO: 必要であれば平成28(2016)年より前の計算式も追加
    def formula_2017_01_01(対象人物, 対象期間, _parameters):
        収入 = 対象人物("収入", 対象期間)

        return np.select([収入 <= 1625000, 収入 <= 1800000, 収入 <= 3600000, 収入 <= 6600000, 収入 <= 10000000],
                         [float(650000), 収入 * 0.4, 収入 * 0.3 + 180000, 収入 * 0.2 + 540000, 収入 * 0.1 + 1200000],
                         float(2200000))


class 収入(Variable):
    value_type = float
    entity = 人物
    # NOTE: 収入自体は1年ごとに定義されるが、特定の日付における各種手当に計算できるように DAY で定義
    definition_period = DAY
    # Optional attribute. Allows user to declare this variable for a year.
    # OpenFisca will spread the yearly 金額 over the days contained in the year.
    set_input = set_input_divide_by_period
    label = "人物の収入"


class 世帯所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯全員の収入の合計"

    def formula(対象世帯, 対象期間, _parameters):
        各収入 = 対象世帯.members("所得", 対象期間)
        return 対象世帯.sum(各収入)


class 世帯高所得(Variable):
    value_type = float
    entity = 世帯
    definition_period = DAY
    label = "世帯で最も所得が高い人物の所得"

    def formula(対象世帯, 対象期間, _parameters):
        各収入 = 対象世帯.members("所得", 対象期間)
        return 対象世帯.max(各収入)


class 可処分所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "所得のうち、人物が実際に使える額"

    def formula(対象人物, 対象期間, _parameters):
        return (
            + 対象人物("所得", 対象期間)
            + 対象人物("ベーシックインカム", 対象期間)
            - 対象人物("所得税", 対象期間)
            - 対象人物("社会保険料", 対象期間)
            )


class 障害者控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "障害者控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1160.htm"

    def formula(対象世帯, 対象期間, parameters):
        身体障害者手帳等級一覧 = 対象世帯.members("身体障害者手帳等級", 対象期間)
        精神障害者保健福祉手帳等級一覧 = 対象世帯.members("精神障害者保健福祉手帳等級", 対象期間)
        療育手帳等級一覧 = 対象世帯.members("療育手帳等級", 対象期間)
        愛の手帳等級一覧 = 対象世帯.members("愛の手帳等級", 対象期間)

        特別障害者控除対象 = \
            (身体障害者手帳等級一覧 == 身体障害者手帳等級認定パターン.一級) + \
                (身体障害者手帳等級一覧 == 身体障害者手帳等級認定パターン.二級) + \
                    (精神障害者保健福祉手帳等級一覧 == 精神障害者保健福祉手帳等級パターン.一級) + \
                        (療育手帳等級一覧 == 療育手帳等級パターン.A) + \
                            (愛の手帳等級一覧 == 愛の手帳等級パターン.一度) + \
                                (愛の手帳等級一覧 == 愛の手帳等級パターン.二度)
        
        障害者控除対象 = \
            ~特別障害者控除対象 *  \
                ((身体障害者手帳等級一覧 != 身体障害者手帳等級認定パターン.無) + \
                    (精神障害者保健福祉手帳等級一覧 != 精神障害者保健福祉手帳等級パターン.無) + \
                        (療育手帳等級一覧 != 療育手帳等級パターン.無) + \
                            (愛の手帳等級一覧 != 愛の手帳等級パターン.無))
        
        特別障害者控除額 = parameters(対象期間).所得.特別障害者控除額
        障害者控除額 = parameters(対象期間).所得.障害者控除額
        
        return 特別障害者控除対象 * 特別障害者控除額 + 障害者控除対象 * 障害者控除額
        

class ひとり親控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "ひとり親控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1171.htm"

    def formula_2020_01_01(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        対象ひとり親 = (対象世帯.nb_persons(世帯.保護者) == 1) * (対象世帯.nb_persons(世帯.児童) >= 1) 
        ひとり親控除額 = parameters(対象期間).所得.ひとり親控除額
        ひとり親控除_所得制限額 = parameters(対象期間).所得.ひとり親控除_所得制限額

        return ひとり親控除額 * 対象ひとり親 * (世帯高所得 < ひとり親控除_所得制限額)


class 寡婦控除(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "寡婦控除額"
    reference = "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1170.htm"

    def formula_2020_01_01(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        ひとり親控除 = 対象世帯("ひとり親控除", 対象期間)
        ひとり親でない = ひとり親控除 == 0
        寡婦 = 対象世帯.nb_persons(世帯.保護者) == 1
        寡婦控除額 = parameters(対象期間).所得.寡婦控除額
        寡婦控除_所得制限額 = parameters(対象期間).所得.寡婦控除_所得制限額

        return 寡婦控除額 * ひとり親でない * 寡婦 * (世帯高所得 < 寡婦控除_所得制限額)
            

class 控除後世帯高所得(Variable):
    value_type = float
    entity = 人物
    definition_period = DAY
    label = "各種控除が適用された後の世帯高所得額"
    reference = "https://www.city.himeji.lg.jp/waku2child/0000013409.html"

    def formula(対象世帯, 対象期間, parameters):
        世帯高所得 = 対象世帯("世帯高所得", 対象期間)
        社会保険料 = parameters(対象期間).所得.社会保険料相当額
        給与所得及び雑所得からの控除額 = parameters(対象期間).所得.給与所得及び雑所得からの控除額
        障害者控除 = 対象世帯("障害者控除", 対象期間)
        ひとり親控除 = 対象世帯("ひとり親控除", 対象期間)
        寡婦控除 = 対象世帯("寡婦控除", 対象期間)

        

        return (
            + 対象人物("所得", 対象期間)
            + 対象人物("ベーシックインカム", 対象期間)
            - 対象人物("所得税", 対象期間)
            - 対象人物("社会保険料", 対象期間)
            )