"""
This file defines variables for the modelled legislation.

A variable is a property of an Entity such as a 人物, a 世帯…

See https://openfisca.org/doc/key-concepts/variables.html
"""

from functools import cache
import json

import numpy as np
# Import from openfisca-core the Python objects used to code the legislation in OpenFisca
from openfisca_core.periods import DAY
from openfisca_core.variables import Variable
# Import the Entities specifically defined for this tax and benefit system
from openfisca_japan import COUNTRY_DIR
from openfisca_japan.entities import 世帯, 人物


@cache
def 市区町村級地区分_キー一覧():
    """
    jsonファイルからキーを取得

    各要素は [都道府県名, 市区町村名] の形式
    """
    with open(COUNTRY_DIR + "/assets/市区町村級地区分.json") as f:
        d = json.load(f)
        キー一覧 = []
        for 都道府県名, 都道府県データ in d.items():
            for 市区町村名 in 都道府県データ.keys():
                キー一覧.append([都道府県名, 市区町村名])
        return np.array(キー一覧)


@cache
def 市区町村級地区分_値一覧():
    """
    jsonファイルから値を取得

    市区町村級地区分_値一覧[市区町村級地区分キー, 区分]の形式で取得可能
    """
    with open(COUNTRY_DIR + "/assets/市区町村級地区分.json") as f:
        d = json.load(f)
        値一覧 = []
        for 都道府県データ in d.values():
            for 市区町村データ in 都道府県データ.values():
                値一覧.append(市区町村データ)
        return np.array(値一覧)


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
    reference = "https://best-selection.co.jp/media/wp-content/uploads/2021/03/seikatsuhogo-kyuchi2022.pdf"

    def formula(対象世帯, 対象期間, _parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        居住市区町村 = 対象世帯("居住市区町村", 対象期間)

        級地区分キー一覧 = 市区町村級地区分_キー一覧()
        級地区分インデックス = np.select(
            [(居住都道府県 == キー[0]) * (居住市区町村 == キー[1]) for キー in 級地区分キー一覧],
            list(range(len(級地区分キー一覧))),
            -1).astype(int)

        # NOTE: 市区町村級地区分()[級地区分インデックス, 0] が級地区分1を表す
        区分 = 市区町村級地区分_値一覧()[級地区分インデックス, 0]

        # 当てはまらない場合は3
        return np.select([級地区分インデックス != -1],
                         [区分],
                         3)


class 居住級地区分1_世帯員(Variable):
    # 世帯員ごとの所属世帯の居住級地区分 (障害者加算variableで世帯員ごとの身体障害者手帳等級との対応づけに必要)
    value_type = int
    entity = 人物
    label = "居住級地区分1_世帯員"
    definition_period = DAY
    reference = "https://best-selection.co.jp/media/wp-content/uploads/2021/03/seikatsuhogo-kyuchi2022.pdf"

    def formula(対象人物, 対象期間, _parameters):
        return 対象人物.世帯("居住級地区分1", 対象期間)


class 居住級地区分2(Variable):
    # m級地-n のとき n を返す
    value_type = int
    entity = 世帯
    label = "居住級地区分2"
    definition_period = DAY
    reference = "https://best-selection.co.jp/media/wp-content/uploads/2021/03/seikatsuhogo-kyuchi2022.pdf"

    def formula(対象世帯, 対象期間, parameters):
        居住都道府県 = 対象世帯("居住都道府県", 対象期間)
        居住市区町村 = 対象世帯("居住市区町村", 対象期間)

        級地区分キー一覧 = 市区町村級地区分_キー一覧()
        級地区分インデックス = np.select(
            [(居住都道府県 == キー[0]) * (居住市区町村 == キー[1]) for キー in 級地区分キー一覧],
            list(range(len(級地区分キー一覧))),
            -1).astype(int)

        # NOTE: 市区町村級地区分()[級地区分インデックス, 1] が級地区分2を表す
        区分 = 市区町村級地区分_値一覧()[級地区分インデックス, 1]

        # 当てはまらない場合は2
        return np.select(
            [級地区分インデックス != -1],
            [区分],
            2)


class 居住級地区分2_世帯員(Variable):
    # 世帯員ごとの所属世帯の居住級地区分
    value_type = int
    entity = 人物
    label = "居住級地区分2_世帯員"
    definition_period = DAY
    reference = "https://best-selection.co.jp/media/wp-content/uploads/2021/03/seikatsuhogo-kyuchi2022.pdf"

    def formula(対象人物, 対象期間, _parameters):
        return 対象人物.世帯("居住級地区分2", 対象期間)
