"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

import json
from functools import cache

import numpy as np
# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.indexed_enums import Enum
from openfisca_core.periods import MONTH, DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan.entities import 世帯


@cache
def 市区町村級地区分():
    with open('openfisca_japan/assets/市区町村級地区分.json') as f:
        return json.load(f)


class 居住都道府県(Variable):
    value_type = str
    entity = 世帯
    label = "居住都道府県"
    definition_period = DAY
    default_value = "北海道"


class 居住市区町村(Variable):
    value_type = str
    entity = 世帯
    label = "居住市区町村"
    definition_period = DAY
    default_value = "その他"


class 居住級地区分1(Variable):
    # m級地-n のとき m を返す
    value_type = int
    entity = 世帯
    label = "居住級地区分1"
    definition_period = DAY
    reference = 'https://best-selection.co.jp/media/wp-content/uploads/2021/03/seikatsuhogo-kyuchi2022.pdf'

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)[0]
        居住市区町村 = 対象世帯("居住市区町村", 対象期間)[0]
        if 居住市区町村 in 市区町村級地区分()[居住都道府県]:
            return 市区町村級地区分()[居住都道府県][居住市区町村][0]
        else:
            return 3
        
    
class 居住級地区分2(Variable):
    # m級地-n のとき n を返す
    value_type = int
    entity = 世帯
    label = "居住級地区分2"
    definition_period = DAY
    reference = 'https://best-selection.co.jp/media/wp-content/uploads/2021/03/seikatsuhogo-kyuchi2022.pdf'

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)[0]
        居住市区町村 = 対象世帯("居住市区町村", 対象期間)[0]
        if 居住市区町村 in 市区町村級地区分()[居住都道府県]:
            return 市区町村級地区分()[居住都道府県][居住市区町村][1]
        else:
            return 2

